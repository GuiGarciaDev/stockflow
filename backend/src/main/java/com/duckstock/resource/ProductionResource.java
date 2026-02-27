package com.duckstock.resource;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import com.duckstock.dto.production.ProductionCreateRequest;
import com.duckstock.dto.production.ProductionCreateResponse;
import com.duckstock.dto.production.ProductionResponse;
import com.duckstock.service.ProductionService;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

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
    @Path("/create")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Create product units from raw materials (ADMIN only)")
    public Response createProduct(
            @Valid @NotNull(message = "Request body is required") ProductionCreateRequest request
    ) {
        ProductionCreateResponse response = productionService.createProduct(request);
        return Response.ok(response).build();
    }

    @POST
    @Path("/confirm")
    @RolesAllowed("ADMIN")
    @Operation(hidden = true)
    public Response confirmProduction(
            @Valid @NotNull(message = "Request body is required") ProductionCreateRequest request
    ) {
        return createProduct(request);
    }
}
