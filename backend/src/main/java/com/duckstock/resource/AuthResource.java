package com.duckstock.resource;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import com.duckstock.dto.auth.UserResponse;
import com.duckstock.service.AuthService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.NewCookie;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.Context;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthResource {

    private static final String COOKIE_NAME = "jwt_token";

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/register")
    @PermitAll
    @Operation(summary = "Register a new user")
    public Response register(@Valid @NotNull(message = "Request body is required") RegisterRequest request) {
        AuthService.AuthResult result = authService.register(request);
        NewCookie cookie = buildCookie(result.token(), result.maxAge());
        return Response.status(Response.Status.CREATED)
                .cookie(cookie)
                .entity(result.user())
                .build();
    }

    @POST
    @Path("/login")
    @PermitAll
    @Operation(summary = "Login with email and password")
    public Response login(@Valid @NotNull(message = "Request body is required") LoginRequest request) {
        AuthService.AuthResult result = authService.login(request);
        NewCookie cookie = buildCookie(result.token(), result.maxAge());
        return Response.ok(result.user())
                .cookie(cookie)
                .build();
    }

    @POST
    @Path("/logout")
    @PermitAll
    @Operation(summary = "Logout and clear authentication cookie")
    public Response logout() {
        NewCookie cookie = new NewCookie.Builder(COOKIE_NAME)
                .value("")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
        return Response.ok().cookie(cookie).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Get current authenticated user")
    public Response getCurrentUser(@Context SecurityContext securityContext) {
        System.out.println("Security Context: " + securityContext);
        String email = securityContext.getUserPrincipal().getName();
        UserResponse user = authService.getCurrentUser(email);
        return Response.ok(user).build();
    }

    private NewCookie buildCookie(String token, int maxAge) {
        return new NewCookie.Builder(COOKIE_NAME)
                .value(token)
                .path("/")
                .maxAge(maxAge)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .sameSite(NewCookie.SameSite.STRICT)
                .build();
    }
}
