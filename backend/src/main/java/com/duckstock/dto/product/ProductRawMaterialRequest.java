package com.duckstock.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ProductRawMaterialRequest {

    @NotNull(message = "Raw material ID is required")
    public UUID rawMaterialId;

    @NotNull(message = "Quantity needed is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    public Integer quantityNeeded;
}
