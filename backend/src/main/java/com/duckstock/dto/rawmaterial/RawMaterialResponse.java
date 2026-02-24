package com.duckstock.dto.rawmaterial;

import com.duckstock.entity.RawMaterial;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class RawMaterialResponse {

    public UUID id;
    public String name;
    public String description;
    public BigDecimal price;
    public Integer stockQuantity;
    public String unit;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public RawMaterialResponse() {}

    public static RawMaterialResponse from(RawMaterial rawMaterial) {
        RawMaterialResponse response = new RawMaterialResponse();
        response.id = rawMaterial.id;
        response.name = rawMaterial.name;
        response.description = rawMaterial.description;
        response.price = rawMaterial.price;
        response.stockQuantity = rawMaterial.stockQuantity;
        response.unit = rawMaterial.unit;
        response.createdAt = rawMaterial.createdAt;
        response.updatedAt = rawMaterial.updatedAt;
        return response;
    }
}
