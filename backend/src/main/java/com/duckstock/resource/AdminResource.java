package com.duckstock.resource;

import com.duckstock.service.SeedService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.Map;

@Path("/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
@Tag(name = "Admin", description = "Administration endpoints (ADMIN only)")
public class AdminResource {

    @Inject
    SeedService seedService;

    @POST
    @Path("/seed")
    @Operation(summary = "Seed the database with initial data (ADMIN only)")
    public Response seed() {
        Map<String, Object> result = seedService.seed();
        return Response.ok(result).build();
    }
}
