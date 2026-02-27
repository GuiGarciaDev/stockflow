package com.duckstock.dto.production;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ProductionCreateRequest {

    @NotNull(message = "Product ID is required")
    public UUID productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    public Integer quantity;

    public ProductionCreateRequest() {}

    public ProductionCreateRequest(UUID productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }
}
