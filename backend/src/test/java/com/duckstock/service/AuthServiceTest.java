package com.duckstock.service;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import com.duckstock.entity.User;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.UnauthorizedException;
import com.duckstock.security.JwtTokenProvider;
import com.duckstock.security.PasswordEncoder;
import com.duckstock.service.AuthService;

import io.smallrye.jwt.auth.principal.JWTParser;

@SuppressWarnings("unused")
class AuthServiceTest {

    private AuthService authService;
    private JwtTokenProvider jwtTokenProvider;
    private PasswordEncoder passwordEncoder;
    private JWTParser jwtParser;

    @BeforeEach
    void setUp() {
        authService = new AuthService();
        jwtTokenProvider = Mockito.mock(JwtTokenProvider.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        jwtParser = Mockito.mock(JWTParser.class);
        setField(authService, "jwtTokenProvider", jwtTokenProvider);
        setField(authService, "passwordEncoder", passwordEncoder);
        setField(authService, "jwtParser", jwtParser);
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.email = "user@stockflow.com";

        User existing = new User();
        existing.email = request.email;

        try (MockedStatic<User> userStatic = Mockito.mockStatic(User.class)) {
            userStatic.when(() -> User.findByEmail(request.email)).thenReturn(existing);
            BusinessException ex = assertThrows(BusinessException.class, () -> authService.register(request));
            assertEquals("Email already registered", ex.getMessage());
        }
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.email = "missing@stockflow.com";
        request.password = "secret123";

        try (MockedStatic<User> userStatic = Mockito.mockStatic(User.class)) {
            userStatic.when(() -> User.findByEmail(request.email)).thenReturn(null);
            UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.login(request));
            assertEquals("Invalid email or password", ex.getMessage());
        }
    }

    @Test
    void refreshToken_shouldThrowWhenTokenParsingFails() throws Exception {
        Mockito.when(jwtParser.parse("invalid")).thenThrow(new RuntimeException("bad token"));
        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.refreshToken("invalid"));
        assertEquals("Invalid refresh token", ex.getMessage());
    }

    @Test
    void getCurrentUser_shouldThrowWhenMissing() {
        try (MockedStatic<User> userStatic = Mockito.mockStatic(User.class)) {
            userStatic.when(() -> User.findByEmail("missing@stockflow.com")).thenReturn(null);
            UnauthorizedException ex = assertThrows(UnauthorizedException.class,
                    () -> authService.getCurrentUser("missing@stockflow.com"));
            assertEquals("User not found", ex.getMessage());
        }
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
