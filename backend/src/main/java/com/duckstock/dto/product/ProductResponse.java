package com.duckstock.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.duckstock.entity.Product;

public class ProductResponse {

    public UUID id;
    public String name;
    public String description;
    public BigDecimal price;
    public Integer stockQuantity;
    public List<RawMaterialAssociation> rawMaterials;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public ProductResponse() {}

    public static ProductResponse from(Product product) {
        ProductResponse response = new ProductResponse();
        response.id = product.id;
        response.name = product.name;
        response.description = product.description;
        response.price = product.price;
        response.stockQuantity = product.stockQuantity;
        response.createdAt = product.createdAt;
        response.updatedAt = product.updatedAt;

        if (product.rawMaterials != null) {
            response.rawMaterials = product.rawMaterials.stream()
                    .map(prm -> {
                        RawMaterialAssociation assoc = new RawMaterialAssociation();
                        assoc.id = prm.id;
                        assoc.rawMaterialId = prm.rawMaterial.id;
                        assoc.rawMaterialName = prm.rawMaterial.name;
                        assoc.quantityNeeded = prm.quantityNeeded;
                        assoc.rawMaterialStockQuantity = prm.rawMaterial.stockQuantity;
                        assoc.rawMaterialUnit = prm.rawMaterial.unit;
                        return assoc;
                    })
                    .collect(Collectors.toList());
        }

        return response;
    }

    public static class RawMaterialAssociation {
        public UUID id;
        public UUID rawMaterialId;
        public String rawMaterialName;
        public Integer quantityNeeded;
        public Integer rawMaterialStockQuantity;
        public String rawMaterialUnit;
    }
}
