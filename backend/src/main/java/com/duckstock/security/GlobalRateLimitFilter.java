package com.duckstock.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import io.vertx.core.http.HttpHeaders;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class GlobalRateLimitFilter {

    @ConfigProperty(name = "duckstock.rate-limit.enabled", defaultValue = "true")
    boolean enabled;

    @ConfigProperty(name = "duckstock.rate-limit.limit", defaultValue = "300")
    int limitPerWindow;

    @ConfigProperty(name = "duckstock.rate-limit.window-seconds", defaultValue = "60")
    int windowSeconds;

    @Inject
    Router router;

    private final ConcurrentHashMap<String, WindowCounter> countersByClient = new ConcurrentHashMap<>();

    @PostConstruct
    void register() {
        // Register a global handler for all routes.
        // Lower order runs earlier.
        router.route().order(10).handler(this::handle);
    }

    void handle(RoutingContext routingContext) {
        if (!enabled) {
            routingContext.next();
            return;
        }

        // Avoid interfering with CORS preflight requests.
        if ("OPTIONS".equalsIgnoreCase(routingContext.request().method().name())) {
            routingContext.next();
            return;
        }

        String clientKey = clientKey(routingContext);
        long currentWindow = currentWindow();

        WindowCounter counter = countersByClient.computeIfAbsent(clientKey, k -> new WindowCounter(currentWindow));
        counter.resetIfWindowChanged(currentWindow);

        int currentCount = counter.incrementAndGet();
        if (currentCount > limitPerWindow) {
            long retryAfterSeconds = retryAfterSeconds(currentWindow);
            routingContext.response()
                    .setStatusCode(429)
                    .putHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                    .putHeader(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds))
                    .end("{\"error\":\"rate_limited\",\"message\":\"Too many requests\"}");
            return;
        }

        // Opportunistic cleanup to prevent unbounded growth.
        if (countersByClient.size() > 10_000) {
            cleanupOldCounters(currentWindow);
        }

        routingContext.next();
    }

    private String clientKey(RoutingContext routingContext) {
        // If the app is behind a reverse proxy, X-Forwarded-For may be present.
        // We only take the first IP. (If you deploy behind an untrusted proxy, do not rely on this.)
        String xff = routingContext.request().getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            int comma = xff.indexOf(',');
            return (comma >= 0 ? xff.substring(0, comma) : xff).trim();
        }

        return routingContext.request().remoteAddress().host();
    }

    private long currentWindow() {
        long now = Instant.now().getEpochSecond();
        return now / Math.max(windowSeconds, 1);
    }

    private long retryAfterSeconds(long currentWindow) {
        long now = Instant.now().getEpochSecond();
        long windowEndExclusive = (currentWindow + 1) * (long) Math.max(windowSeconds, 1);
        return Math.max(1, windowEndExclusive - now);
    }

    private void cleanupOldCounters(long currentWindow) {
        long minWindowToKeep = currentWindow - 2;
        for (Map.Entry<String, WindowCounter> entry : countersByClient.entrySet()) {
            if (entry.getValue().window < minWindowToKeep) {
                countersByClient.remove(entry.getKey(), entry.getValue());
            }
        }
    }

    static final class WindowCounter {
        volatile long window;
        final AtomicInteger count = new AtomicInteger(0);

        WindowCounter(long window) {
            this.window = window;
        }

        void resetIfWindowChanged(long expectedWindow) {
            if (window == expectedWindow) {
                return;
            }

            synchronized (this) {
                if (window != expectedWindow) {
                    window = expectedWindow;
                    count.set(0);
                }
            }
        }

        int incrementAndGet() {
            return count.incrementAndGet();
        }
    }
}
