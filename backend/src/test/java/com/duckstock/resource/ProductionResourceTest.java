package com.duckstock.resource;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.greaterThan;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

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
    public void testCreateProduction() {
        // Pick a product from suggestions and create 1 unit.
        String productId = given()
                .when()
                .get("/production/suggestions")
                .then()
                .statusCode(200)
                .extract()
                .path("products[0].productId");

        given()
                .contentType(ContentType.JSON)
                .body(java.util.Map.of(
                        "productId", productId,
                        "quantity", 1
                ))
                .when()
                .post("/production/create")
                .then()
                .statusCode(200)
                .body("productId", org.hamcrest.Matchers.equalTo(productId))
                .body("quantityRequested", org.hamcrest.Matchers.equalTo(1))
                .body("quantityCreated", org.hamcrest.Matchers.equalTo(1));
    }
}
