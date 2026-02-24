package com.duckstock.resource;

import com.duckstock.dto.common.PageResponse;
import com.duckstock.dto.product.ProductRawMaterialRequest;
import com.duckstock.dto.product.ProductRequest;
import com.duckstock.dto.product.ProductResponse;
import com.duckstock.exception.BusinessException;
import com.duckstock.service.ProductService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.UUID;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"USER", "ADMIN"})
@Tag(name = "Products", description = "Product management endpoints")
public class ProductResource {

    @Inject
    ProductService productService;

    @GET
    @Operation(summary = "List all products with pagination")
    public Response listAll(
            @QueryParam("page") @DefaultValue("0") String pageStr,
            @QueryParam("size") @DefaultValue("10") String sizeStr,
            @QueryParam("search") String search) {
        int page = parseOrDefault(pageStr, 0);
        int size = parseOrDefault(sizeStr, 10);
        PageResponse<ProductResponse> result = productService.listAll(page, size, search);
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
    @Path("/{id}")
    @Operation(summary = "Get a product by ID")
    public Response findById(@PathParam("id") UUID id) {
        ProductResponse product = productService.findById(id);
        return Response.ok(product).build();
    }

    @POST
    @Operation(summary = "Create a new product")
    public Response create(@Valid ProductRequest request) {
        if (request.name == null || request.name.isBlank()) {
            throw new BusinessException("Product name is required");
        }
        if (request.price == null) {
            throw new BusinessException("Price is required");
        }
        if (request.stockQuantity == null) {
            throw new BusinessException("Stock quantity is required");
        }

        ProductResponse product = productService.create(request);
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Update a product")
    public Response update(@PathParam("id") UUID id, @Valid ProductRequest request) {
        ProductResponse product = productService.update(id, request);
        return Response.ok(product).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Delete a product")
    public Response delete(@PathParam("id") UUID id) {
        productService.delete(id);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/raw-materials")
    @Operation(summary = "Add a raw material to a product")
    public Response addRawMaterial(@PathParam("id") UUID id,
                                    @Valid ProductRawMaterialRequest request) {
        ProductResponse product = productService.addRawMaterial(id, request);
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    @DELETE
    @Path("/{id}/raw-materials/{associationId}")
    @Operation(summary = "Remove a raw material from a product")
    public Response removeRawMaterial(@PathParam("id") UUID id,
                                      @PathParam("associationId") UUID associationId) {
        ProductResponse product = productService.removeRawMaterial(id, associationId);
        return Response.ok(product).build();
    }

    @PUT
    @Path("/{id}/raw-materials/{associationId}")
    @Operation(summary = "Update raw material quantity for a product")
    public Response updateRawMaterialQuantity(@PathParam("id") UUID id,
                                               @PathParam("associationId") UUID associationId,
                                               @Valid ProductRawMaterialRequest request) {
        ProductResponse product = productService.updateRawMaterialQuantity(id, associationId, request);
        return Response.ok(product).build();
    }
}
