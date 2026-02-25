package com.duckstock.service;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import com.duckstock.dto.auth.UserResponse;
import com.duckstock.entity.User;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.UnauthorizedException;
import com.duckstock.security.JwtTokenProvider;
import com.duckstock.security.PasswordEncoder;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);

    @Inject
    JwtTokenProvider jwtTokenProvider;

    @Inject
    PasswordEncoder passwordEncoder;

    @Inject
    io.smallrye.jwt.auth.principal.JWTParser jwtParser;

    @Transactional
    public record AuthResult(UserResponse user, String accessToken, String refreshToken, int refreshMaxAge) {}

    @Transactional
    public AuthResult register(RegisterRequest request) {
        User existing = User.findByEmail(request.email);
        if (existing != null) {
            throw new BusinessException("Email already registered");
        }

        User user = new User();
        user.name = request.name;
        user.email = request.email;
        user.password = passwordEncoder.encode(request.password);
        user.role = "USER";
        user.persist();

        LOG.infof("User registered: %s", user.email);

        String accessToken = jwtTokenProvider.generateAccessToken(user.id, user.email, user.role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.id, user.email);
        
        return new AuthResult(UserResponse.from(user), accessToken, refreshToken, jwtTokenProvider.getRefreshLifespan());
    }

    public AuthResult login(LoginRequest request) {
        User user = User.findByEmail(request.email);
        if (user == null) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw new UnauthorizedException("Invalid email or password");
        }

        LOG.infof("User logged in: %s", user.email);

        String accessToken = jwtTokenProvider.generateAccessToken(user.id, user.email, user.role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.id, user.email);

        return new AuthResult(UserResponse.from(user), accessToken, refreshToken, jwtTokenProvider.getRefreshLifespan());
    }

    public String refreshToken(String refreshToken) {
        try {
            org.eclipse.microprofile.jwt.JsonWebToken parsedJwt = jwtParser.parse(refreshToken);
            
            // Validate token type claim
            String type = parsedJwt.getClaim("type");
            if (!"refresh".equals(type)) {
                throw new UnauthorizedException("Invalid token type");
            }

            String email = parsedJwt.getName();
            User user = User.findByEmail(email);
            if (user == null) {
                throw new UnauthorizedException("User not found");
            }

            LOG.debugf("Refreshing token for user: %s", email);
            return jwtTokenProvider.generateAccessToken(user.id, user.email, user.role);
        } catch (Exception e) {
            LOG.error("Failed to parse refresh token", e);
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    public UserResponse getCurrentUser(String email) {
        User user = User.findByEmail(email);
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }
        return UserResponse.from(user);
    }
}
