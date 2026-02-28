package com.duckstock.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import com.duckstock.dto.product.ProductRawMaterialRequest;
import com.duckstock.dto.product.ProductRequest;
import com.duckstock.dto.product.ProductResponse;
import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.entity.RawMaterial;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.ResourceNotFoundException;
import com.duckstock.service.ProductService;

@Disabled("Requires full Panache static interception in Quarkus runtime")
@SuppressWarnings("unused")
class ProductServiceTest {

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService();
    }

    @Test
    void findById_shouldThrowWhenMissing() {
        UUID id = UUID.randomUUID();
        try (MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class)) {
            productStatic.when(() -> Product.findById(id)).thenReturn(null);
            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> productService.findById(id));
            assertTrue(ex.getMessage().contains("Product not found"));
        }
    }

    @Test
    void update_shouldOnlyChangeProvidedFields() {
        UUID id = UUID.randomUUID();

        Product product = Mockito.spy(new Product());
        product.id = id;
        product.name = "Old";
        product.description = "Desc";
        product.price = new BigDecimal("10.00");
        product.stockQuantity = 4;
        Mockito.doNothing().when(product).persist();

        ProductRequest request = new ProductRequest();
        request.price = new BigDecimal("20.00");

        try (MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class)) {
            productStatic.when(() -> Product.findById(id)).thenReturn(product);
            ProductResponse response = productService.update(id, request);
            assertEquals("Old", response.name);
            assertEquals(new BigDecimal("20.00"), response.price);
            assertEquals(4, response.stockQuantity);
        }
    }

    @Test
    void addRawMaterials_shouldThrowWhenDuplicateAssociationExists() {
        UUID productId = UUID.randomUUID();
        UUID rawMaterialId = UUID.randomUUID();

        Product product = new Product();
        product.id = productId;
        product.rawMaterials = new ArrayList<>();

        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.id = rawMaterialId;
        rawMaterial.name = "Steel";

        ProductRawMaterial existing = new ProductRawMaterial();
        existing.rawMaterial = rawMaterial;
        product.rawMaterials.add(existing);

        ProductRawMaterialRequest request = new ProductRawMaterialRequest();
        request.rawMaterialId = rawMaterialId;
        request.quantityNeeded = 2;

        try (MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class);
             MockedStatic<RawMaterial> rawMaterialStatic = Mockito.mockStatic(RawMaterial.class)) {
            productStatic.when(() -> Product.findById(productId)).thenReturn(product);
            rawMaterialStatic.when(() -> RawMaterial.findById(rawMaterialId)).thenReturn(rawMaterial);

            BusinessException ex = assertThrows(BusinessException.class,
                    () -> productService.addRawMaterials(productId, List.of(request)));

            assertTrue(ex.getMessage().contains("already associated"));
        }
    }
}
