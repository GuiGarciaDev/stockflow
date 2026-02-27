package com.duckstock.dto.production;

import java.util.UUID;

public class ProductionCreateResponse {

    public UUID productId;
    public Integer quantityRequested;
    public Integer quantityCreated;
    public Integer maxQuantityPossible;
    public Integer newProductStockQuantity;

    public ProductionCreateResponse() {}

    public ProductionCreateResponse(
            UUID productId,
            Integer quantityRequested,
            Integer quantityCreated,
            Integer maxQuantityPossible,
            Integer newProductStockQuantity
    ) {
        this.productId = productId;
        this.quantityRequested = quantityRequested;
        this.quantityCreated = quantityCreated;
        this.maxQuantityPossible = maxQuantityPossible;
        this.newProductStockQuantity = newProductStockQuantity;
    }
}
