package com.duckstock.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "product_raw_materials",
       uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "raw_material_id"}))
public class ProductRawMaterial extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public java.util.UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "raw_material_id", nullable = false)
    public RawMaterial rawMaterial;

    @NotNull(message = "Quantity needed is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity_needed", nullable = false)
    public Integer quantityNeeded;

    public static java.util.List<ProductRawMaterial> findByProduct(Product product) {
        return find("product", product).list();
    }

    public static java.util.List<ProductRawMaterial> findByRawMaterial(RawMaterial rawMaterial) {
        return find("rawMaterial", rawMaterial).list();
    }
}
