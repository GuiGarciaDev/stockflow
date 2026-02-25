package com.duckstock.security;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtTokenProvider {

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "900") // 15 min
    int accessLifespan;

    @ConfigProperty(name = "smallrye.jwt.refresh-token.lifespan", defaultValue = "604800") // 7 days
    int refreshLifespan;

    @ConfigProperty(name = "smallrye.jwt.new-token.issuer", defaultValue = "duckstock")
    String issuer;

    public String generateAccessToken(Long userId, String email, String role) {
        return Jwt.issuer(issuer)
                .subject(userId.toString())
                .upn(email)
                .groups(Set.of(role))
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role)
                .claim("type", "access")
                .expiresIn(Duration.ofSeconds(accessLifespan))
                .sign();
    }

    public String generateRefreshToken(Long userId, String email) {
        return Jwt.issuer(issuer)
                .subject(userId.toString())
                .upn(email)
                .claim("userId", userId)
                .claim("type", "refresh")
                .expiresIn(Duration.ofSeconds(refreshLifespan))
                .sign();
    }

    public int getAccessLifespan() {
        return accessLifespan;
    }

    public int getRefreshLifespan() {
        return refreshLifespan;
    }
}
