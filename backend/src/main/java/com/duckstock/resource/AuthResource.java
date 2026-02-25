package com.duckstock.resource;

import java.util.Map;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import com.duckstock.dto.auth.UserResponse;
import com.duckstock.exception.UnauthorizedException;
import com.duckstock.service.AuthService;

import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.CookieParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthResource {

    private static final String COOKIE_NAME = "jwt_token";

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @ConfigProperty(name = "duckstock.auth.cookie.secure", defaultValue = "false")
    boolean cookieSecure;

    @ConfigProperty(name = "duckstock.auth.cookie.same-site", defaultValue = "STRICT")
    String cookieSameSite;

    @POST
    @Path("/register")
    @PermitAll
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Register a new user", description = "Creates a new user and returns an access token in the response and a refresh token in a cookie.")
    @org.eclipse.microprofile.openapi.annotations.responses.APIResponse(responseCode = "201", description = "User successfully registered")
    public Response register(@Valid @NotNull(message = "Request body is required") RegisterRequest request) {
        AuthService.AuthResult result = authService.register(request);
        NewCookie cookie = buildCookie(result.refreshToken(), result.refreshMaxAge());
        return Response.status(Response.Status.CREATED)
                .cookie(cookie)
                .entity(Map.of(
                    "user", result.user(),
                    "accessToken", result.accessToken()
                ))
                .build();
    }

    @POST
    @Path("/login")
    @PermitAll
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Login with email and password", description = "Authenticates user and returns an access token in the response and a refresh token in a cookie.")
    @org.eclipse.microprofile.openapi.annotations.responses.APIResponse(responseCode = "200", description = "Successfully authenticated")
    @org.eclipse.microprofile.openapi.annotations.responses.APIResponse(responseCode = "401", description = "Invalid credentials")
    public Response login(@Valid @NotNull(message = "Request body is required") LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);
        NewCookie cookie = buildCookie(result.refreshToken(), result.refreshMaxAge());
        return Response.ok(Map.of(
                    "user", result.user(),
                    "accessToken", result.accessToken()
                ))
                .cookie(cookie)
                .build();
    }

    @POST
    @Path("/refresh")
    @PermitAll
    @Operation(summary = "Refresh access token", description = "Uses the refresh token from the cookie to issue a new short-lived access token.")
    @org.eclipse.microprofile.openapi.annotations.responses.APIResponse(responseCode = "200", description = "New access token generated")
    @org.eclipse.microprofile.openapi.annotations.responses.APIResponse(responseCode = "401", description = "Invalid or missing refresh token")
    public Response refresh(@CookieParam(COOKIE_NAME) String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new UnauthorizedException("Refresh token is missing");
        }
        
        String newAccessToken = authService.refreshToken(refreshToken);
        return Response.ok(Map.of("accessToken", newAccessToken)).build();
    }

    @POST
    @Path("/logout")
    @PermitAll
    @Operation(summary = "Logout", description = "Clears the authentication refresh token cookie.")
    public Response logout() {
        NewCookie cookie = new NewCookie.Builder(COOKIE_NAME)
                .value("")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(parseSameSite(cookieSameSite))
                .build();
        return Response.ok().cookie(cookie).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Get current authenticated user", description = "Returns details of the currently authenticated user identified by the Bearer token.")
    @org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement(name = "BearerAuth")
    public Response getCurrentUser() {
        String email = jwt.getName();
        UserResponse user = authService.getCurrentUser(email);
        return Response.ok(user).build();
    }

    private NewCookie buildCookie(String token, int maxAge) {
        return new NewCookie.Builder(COOKIE_NAME)
                .value(token)
                .path("/")
                .maxAge(maxAge)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(parseSameSite(cookieSameSite))
                .build();
    }

    private NewCookie.SameSite parseSameSite(String sameSite) {
        if (sameSite == null) {
            return NewCookie.SameSite.STRICT;
        }

        return switch (sameSite.trim().toUpperCase()) {
            case "LAX" -> NewCookie.SameSite.LAX;
            case "NONE" -> NewCookie.SameSite.NONE;
            default -> NewCookie.SameSite.STRICT;
        };
    }
}
