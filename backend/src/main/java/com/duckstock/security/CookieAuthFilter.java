package com.duckstock.security;

import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;
import java.io.IOException;

/**
 * JAX-RS filter that reads the JWT token from an HTTP-only cookie
 * and sets it as a Bearer token in the Authorization header.
 * This allows SmallRye JWT to validate the token normally.
 */
@Provider
@Priority(Priorities.AUTHENTICATION - 10)
public class CookieAuthFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(CookieAuthFilter.class);
    private static final String COOKIE_NAME = "jwt_token";

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        LOG.debugf("CookieAuthFilter checking request to %s", requestContext.getUriInfo().getPath());

        // Only add Authorization header if not already present
        String authHeader = requestContext.getHeaderString("Authorization");
        if (authHeader != null && !authHeader.isEmpty()) {
            LOG.debug("Authorization header already present, skipping cookie check");
            return;
        }

        Cookie cookie = requestContext.getCookies().get(COOKIE_NAME);
        if (cookie != null && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
            LOG.debugf("Found JWT cookie, setting Authorization header");
            requestContext.getHeaders().putSingle("Authorization", "Bearer " + cookie.getValue());
        } else {
            LOG.debug("No JWT cookie found");
        }
    }
}
