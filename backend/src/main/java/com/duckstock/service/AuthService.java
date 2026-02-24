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

    @Transactional
    public record AuthResult(UserResponse user, String token, int maxAge) {}

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

        String token = jwtTokenProvider.generateToken(user.id, user.email, user.role);
        return new AuthResult(UserResponse.from(user), token, jwtTokenProvider.getTokenLifespan());
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

        String token = jwtTokenProvider.generateToken(user.id, user.email, user.role);
        return new AuthResult(UserResponse.from(user), token, jwtTokenProvider.getTokenLifespan());
    }

    public UserResponse getCurrentUser(String email) {
        User user = User.findByEmail(email);
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }
        return UserResponse.from(user);
    }
}
