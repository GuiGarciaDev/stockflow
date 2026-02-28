package com.duckstock.service;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import com.duckstock.dto.production.ProductionCreateRequest;
import com.duckstock.dto.production.ProductionCreateResponse;
import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.entity.RawMaterial;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.ResourceNotFoundException;
import com.duckstock.service.ProductionService;

@Disabled("Requires full Panache static interception in Quarkus runtime")
@SuppressWarnings("unused")
class ProductionServiceTest {

    private ProductionService productionService;

    @BeforeEach
    void setUp() {
        productionService = new ProductionService();
    }

    @Test
    void createProduct_shouldThrowWhenRequestIsNull() {
        BusinessException ex = assertThrows(BusinessException.class, () -> productionService.createProduct(null));
        assertEquals("Request body is required", ex.getMessage());
    }

    @Test
    void createProduct_shouldThrowWhenProductNotFound() {
        ProductionCreateRequest request = new ProductionCreateRequest(UUID.randomUUID(), 1);

        try (MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class)) {
            productStatic.when(() -> Product.findById(request.productId)).thenReturn(null);
            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> productionService.createProduct(request));
            assertEquals("Product not found", ex.getMessage());
        }
    }

    @Test
    void createProduct_shouldPartiallyProduceWhenRequestedAboveMax() {
        UUID productId = UUID.randomUUID();
        ProductionCreateRequest request = new ProductionCreateRequest(productId, 10);

        Product product = Mockito.spy(new Product());
        product.id = productId;
        product.stockQuantity = 2;
        Mockito.doNothing().when(product).persist();

        RawMaterial rawMaterial = Mockito.spy(new RawMaterial());
        rawMaterial.stockQuantity = 14;
        Mockito.doNothing().when(rawMaterial).persist();

        ProductRawMaterial prm = new ProductRawMaterial();
        prm.product = product;
        prm.rawMaterial = rawMaterial;
        prm.quantityNeeded = 4;

        try (MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class);
             MockedStatic<ProductRawMaterial> prmStatic = Mockito.mockStatic(ProductRawMaterial.class)) {
            productStatic.when(() -> Product.findById(productId)).thenReturn(product);
            prmStatic.when(() -> ProductRawMaterial.findByProduct(product)).thenReturn(List.of(prm));

            ProductionCreateResponse response = productionService.createProduct(request);

            assertEquals(3, response.quantityCreated);
            assertEquals(3, response.maxQuantityPossible);
            assertEquals(5, response.newProductStockQuantity);
            assertEquals(2, rawMaterial.stockQuantity);
        }
    }
}
