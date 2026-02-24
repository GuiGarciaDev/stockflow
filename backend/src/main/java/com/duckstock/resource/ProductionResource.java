package com.duckstock.resource;

import com.duckstock.dto.production.ProductionResponse;
import com.duckstock.service.ProductionService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/production")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"USER", "ADMIN"})
@Tag(name = "Production", description = "Production planning endpoints")
public class ProductionResource {

    @Inject
    ProductionService productionService;

    @GET
    @Path("/suggestions")
    @Operation(summary = "Get production suggestions based on available raw materials")
    public Response getSuggestions() {
        ProductionResponse response = productionService.getSuggestions();
        return Response.ok(response).build();
    }

    @POST
    @Path("/confirm")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Confirm production — actually deducts raw material stock (ADMIN only)")
    public Response confirmProduction() {
        ProductionResponse response = productionService.confirmProduction();
        return Response.ok(response).build();
    }
}
