package com.duckstock.service;

import java.lang.reflect.Field;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import org.mockito.Mockito;

import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.entity.RawMaterial;
import com.duckstock.entity.User;
import com.duckstock.security.PasswordEncoder;
import com.duckstock.service.SeedService;

@Disabled("Requires full Panache static interception in Quarkus runtime")
@SuppressWarnings("unused")
class SeedServiceTest {

    private SeedService seedService;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        seedService = new SeedService();
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        setField(seedService, "passwordEncoder", passwordEncoder);
    }

    @Test
    void seed_shouldReturnExpectedSummary() {
        Mockito.when(passwordEncoder.encode(Mockito.anyString())).thenReturn("encoded");

        try (MockedStatic<ProductRawMaterial> prmStatic = Mockito.mockStatic(ProductRawMaterial.class);
             MockedStatic<Product> productStatic = Mockito.mockStatic(Product.class);
             MockedStatic<RawMaterial> rawMaterialStatic = Mockito.mockStatic(RawMaterial.class);
             MockedStatic<User> userStatic = Mockito.mockStatic(User.class);
             MockedConstruction<ProductRawMaterial> prmConstruction = Mockito.mockConstruction(ProductRawMaterial.class);
             MockedConstruction<Product> productConstruction = Mockito.mockConstruction(Product.class);
             MockedConstruction<RawMaterial> rawConstruction = Mockito.mockConstruction(RawMaterial.class);
             MockedConstruction<User> userConstruction = Mockito.mockConstruction(User.class)) {

            prmStatic.when(ProductRawMaterial::deleteAll).thenReturn(0L);
            productStatic.when(Product::deleteAll).thenReturn(0L);
            rawMaterialStatic.when(RawMaterial::deleteAll).thenReturn(0L);
            userStatic.when(User::deleteAll).thenReturn(0L);

            Map<String, Object> result = seedService.seed(
                    "admin@stockflow.com",
                    "admin123",
                    "user@stockflow.com",
                    "user123"
            );

            assertEquals(30, result.get("products"));
            assertEquals(50, result.get("rawMaterials"));
            assertEquals(2, result.get("users"));
            assertEquals("Seed completed successfully", result.get("message"));
            assertTrue((Integer) result.get("associations") >= 60);
        }
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
