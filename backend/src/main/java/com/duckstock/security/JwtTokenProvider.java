package com.duckstock.security;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtTokenProvider {

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "3600")
    int tokenLifespan;

    @ConfigProperty(name = "smallrye.jwt.new-token.issuer", defaultValue = "duckstock")
    String issuer;

    public String generateToken(Long userId, String email, String role) {
        return Jwt.issuer(issuer)
                .subject(userId.toString())
                .upn(email)
                .groups(Set.of(role))
                .claim("userId", userId)
                .claim("email", email)
                .claim("role", role)
                .expiresIn(Duration.ofSeconds(tokenLifespan))
                .sign();
    }

    public int getTokenLifespan() {
        return tokenLifespan;
    }
}
