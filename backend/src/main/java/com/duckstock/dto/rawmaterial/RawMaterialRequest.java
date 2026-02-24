package com.duckstock.dto.rawmaterial;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class RawMaterialRequest {

    @Size(min = 2, max = 200)
    public String name;

    @Size(max = 1000)
    public String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    public BigDecimal price;

    @Min(value = 0, message = "Stock cannot be negative")
    public Integer stockQuantity;

    @Size(max = 20)
    public String unit;
}
