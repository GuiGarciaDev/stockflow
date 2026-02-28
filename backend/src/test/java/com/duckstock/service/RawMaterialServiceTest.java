package com.duckstock.service;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import com.duckstock.dto.rawmaterial.RawMaterialRequest;
import com.duckstock.dto.rawmaterial.RawMaterialResponse;
import com.duckstock.entity.RawMaterial;
import com.duckstock.exception.ResourceNotFoundException;
import com.duckstock.service.RawMaterialService;

@Disabled("Requires full Panache static interception in Quarkus runtime")
@SuppressWarnings("unused")
class RawMaterialServiceTest {

    private RawMaterialService rawMaterialService;

    @BeforeEach
    void setUp() {
        rawMaterialService = new RawMaterialService();
    }

    @Test
    void findById_shouldThrowWhenMissing() {
        UUID id = UUID.randomUUID();
        try (MockedStatic<RawMaterial> rawMaterialStatic = Mockito.mockStatic(RawMaterial.class)) {
            rawMaterialStatic.when(() -> RawMaterial.findById(id)).thenReturn(null);
            ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                    () -> rawMaterialService.findById(id));
            assertTrue(ex.getMessage().contains("Raw material not found"));
        }
    }

    @Test
    void update_shouldOnlyChangeProvidedFields() {
        UUID id = UUID.randomUUID();
        RawMaterial rawMaterial = Mockito.spy(new RawMaterial());
        rawMaterial.id = id;
        rawMaterial.name = "Old";
        rawMaterial.description = "Desc";
        rawMaterial.price = new BigDecimal("10.00");
        rawMaterial.stockQuantity = 5;
        rawMaterial.unit = "kg";
        Mockito.doNothing().when(rawMaterial).persist();

        RawMaterialRequest request = new RawMaterialRequest();
        request.name = "New";

        try (MockedStatic<RawMaterial> rawMaterialStatic = Mockito.mockStatic(RawMaterial.class)) {
            rawMaterialStatic.when(() -> RawMaterial.findById(id)).thenReturn(rawMaterial);

            RawMaterialResponse response = rawMaterialService.update(id, request);
            assertEquals("New", response.name);
            assertEquals("Desc", response.description);
            assertEquals(new BigDecimal("10.00"), response.price);
            assertEquals(5, response.stockQuantity);
        }
    }
}
