package com.duckstock.dto.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {

    @Size(min = 2, max = 200)
    public String name;

    @Size(max = 1000)
    public String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    public BigDecimal price;

    @Min(value = 0, message = "Stock cannot be negative")
    public Integer stockQuantity;
}
