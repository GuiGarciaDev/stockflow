package com.duckstock.dto.production;

import java.math.BigDecimal;
import java.util.UUID;

public class ProductionSuggestion {

    public UUID productId;
    public String productName;
    public Integer quantityPossible;
    public BigDecimal unitPrice;
    public BigDecimal totalValue;

    public ProductionSuggestion() {}

    public ProductionSuggestion(UUID productId, String productName, Integer quantityPossible,
                                 BigDecimal unitPrice, BigDecimal totalValue) {
        this.productId = productId;
        this.productName = productName;
        this.quantityPossible = quantityPossible;
        this.unitPrice = unitPrice;
        this.totalValue = totalValue;
    }
}
