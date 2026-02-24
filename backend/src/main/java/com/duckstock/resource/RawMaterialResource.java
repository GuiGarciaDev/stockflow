package com.duckstock.resource;

import com.duckstock.dto.common.PageResponse;
import com.duckstock.dto.rawmaterial.RawMaterialRequest;
import com.duckstock.dto.rawmaterial.RawMaterialResponse;
import com.duckstock.exception.BusinessException;
import com.duckstock.service.RawMaterialService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/raw-materials")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"USER", "ADMIN"})
@Tag(name = "Raw Materials", description = "Raw material management endpoints")
public class RawMaterialResource {

    @Inject
    RawMaterialService rawMaterialService;

    @GET
    @Operation(summary = "List all raw materials with pagination")
    public Response listAll(
            @QueryParam("page") @DefaultValue("0") String pageStr,
            @QueryParam("size") @DefaultValue("10") String sizeStr,
            @QueryParam("search") String search) {
        int page = parseOrDefault(pageStr, 0);
        int size = parseOrDefault(sizeStr, 10);
        PageResponse<RawMaterialResponse> result = rawMaterialService.listAll(page, size, search);
        return Response.ok(result).build();
    }

    private int parseOrDefault(String value, int defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    @GET
    @Path("/all")
    @Operation(summary = "List all raw materials without pagination (for dropdowns)")
    public Response listAllNoPagination() {
        List<RawMaterialResponse> result = rawMaterialService.listAllNoPagination();
        return Response.ok(result).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Get a raw material by ID")
    public Response findById(@PathParam("id") UUID id) {
        RawMaterialResponse rawMaterial = rawMaterialService.findById(id);
        return Response.ok(rawMaterial).build();
    }

    @POST
    @Operation(summary = "Create a new raw material")
    public Response create(@Valid RawMaterialRequest request) {
        if (request.name == null || request.name.isBlank()) {
            throw new BusinessException("Raw material name is required");
        }
        if (request.price == null) {
            throw new BusinessException("Price is required");
        }
        if (request.stockQuantity == null) {
            throw new BusinessException("Stock quantity is required");
        }
        if (request.unit == null || request.unit.isBlank()) {
            throw new BusinessException("Unit is required");
        }

        RawMaterialResponse rawMaterial = rawMaterialService.create(request);
        return Response.status(Response.Status.CREATED).entity(rawMaterial).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a raw material")
    public Response update(@PathParam("id") UUID id, @Valid RawMaterialRequest request) {
        RawMaterialResponse rawMaterial = rawMaterialService.update(id, request);
        return Response.ok(rawMaterial).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a raw material")
    public Response delete(@PathParam("id") UUID id) {
        rawMaterialService.delete(id);
        return Response.noContent().build();
    }
}
