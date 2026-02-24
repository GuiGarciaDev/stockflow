package com.duckstock.dto.production;

import java.math.BigDecimal;
import java.util.List;

public class ProductionResponse {

    public List<ProductionSuggestion> products;
    public BigDecimal grandTotalValue;

    public ProductionResponse() {}

    public ProductionResponse(List<ProductionSuggestion> products, BigDecimal grandTotalValue) {
        this.products = products;
        this.grandTotalValue = grandTotalValue;
    }
}
