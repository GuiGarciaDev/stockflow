package com.duckstock.resource;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.greaterThan;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import com.duckstock.dto.auth.RegisterRequest;
import com.duckstock.dto.product.ProductRawMaterialRequest;
import com.duckstock.dto.product.ProductRequest;
import com.duckstock.dto.rawmaterial.RawMaterialRequest;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ProductionResourceTest {

    @Test
    @Order(1)
    @TestSecurity(user = "test-user", roles = "USER")
    public void testGetSuggestions() {
        // Prepare data
        // 1. Create Raw Material
        RawMaterialRequest rmRequest = new RawMaterialRequest();
        rmRequest.name = "Madeira";
        rmRequest.price = new BigDecimal("10.00");
        rmRequest.stockQuantity = 100;
        rmRequest.unit = "m²";

        String rmId = given()
                .contentType(ContentType.JSON)
                .body(rmRequest)
                .when()
                .post("/raw-materials")
                .then()
                .statusCode(201)
                .extract().path("id");

        // 2. Create Product
        ProductRequest pRequest = new ProductRequest();
        pRequest.name = "Cadeira";
        pRequest.price = new BigDecimal("100.00");
        pRequest.stockQuantity = 0;

        String p1Id = given()
                .contentType(ContentType.JSON)
                .body(pRequest)
                .when()
                .post("/products")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        // 3. Associate
        ProductRawMaterialRequest assocRequest = new ProductRawMaterialRequest();
        assocRequest.rawMaterialId = java.util.UUID.fromString(rmId);
        assocRequest.quantityNeeded = 5;

        java.util.List<ProductRawMaterialRequest> requests = java.util.Collections.singletonList(assocRequest);

        given()
                .contentType(ContentType.JSON)
                .body(requests)
                .when()
                .post("/products/" + p1Id + "/raw-materials")
                .then()
                .statusCode(201);

        // 4. Get suggestions
        given()
                .when()
                .get("/production/suggestions")
                .then()
                .statusCode(200)
                .body("products.size()", greaterThan(0))
                .body("products.productName", org.hamcrest.Matchers.hasItem("Cadeira"));
    }

    @Test
    @Order(2)
    @TestSecurity(user = "admin", roles = "ADMIN")
    public void testConfirmProduction() {
        // Confirm production (admin only, but the security filter is being tested separately)
        // For now, let's just test the logic if it's reachable or if we need a token

        // Registration and Login to get ADMIN token
        RegisterRequest reg = new RegisterRequest();
        reg.name = "Admin";
        reg.email = "admin-test@duckstock.com";
        reg.password = "admin123";
        // We can't set role via register, so we'd need to seed or fix role in DB.
        // However, the AuthService has a "USER" default.
        // Let's assume the test runs without strict security for now or we use a @TestSecurity
        
        // Actually, the CookieAuthFilter will look for a cookie.
        // Let's just try to call it and see if it works with the logic.
        
        given()
                .contentType(ContentType.JSON)
                .when()
                .post("/production/confirm")
                .then()
                .statusCode(200);
    }
}
