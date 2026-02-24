package com.duckstock.resource;

import com.duckstock.dto.product.ProductRequest;
import com.duckstock.dto.product.ProductRawMaterialRequest;
import com.duckstock.dto.rawmaterial.RawMaterialRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.greaterThan;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestSecurity(user = "test-user", roles = "USER")
public class ProductResourceTest {

    private static String productId;
    private static String rawMaterialId;

    @Test
    @Order(1)
    public void testCreateProduct() {
        ProductRequest request = new ProductRequest();
        request.name = "Mesa de Jantar";
        request.description = "Mesa elegante";
        request.price = new BigDecimal("500.00");
        request.stockQuantity = 10;

        productId = given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/products")
                .then()
                .statusCode(201)
                .body("name", is("Mesa de Jantar"))
                .extract()
                .path("id");
    }

    @Test
    @Order(2)
    public void testAssociateRawMaterial() {
        // Create a raw material first
        RawMaterialRequest rmRequest = new RawMaterialRequest();
        rmRequest.name = "Parafuso";
        rmRequest.price = new BigDecimal("0.50");
        rmRequest.stockQuantity = 1000;
        rmRequest.unit = "un";

        rawMaterialId = given()
                .contentType(ContentType.JSON)
                .body(rmRequest)
                .when()
                .post("/raw-materials")
                .then()
                .statusCode(201)
                .extract()
                .path("id");

        ProductRawMaterialRequest assocRequest = new ProductRawMaterialRequest();
        assocRequest.rawMaterialId = java.util.UUID.fromString(rawMaterialId);
        assocRequest.quantityNeeded = 20;

        given()
                .contentType(ContentType.JSON)
                .body(assocRequest)
                .when()
                .post("/products/" + productId + "/raw-materials")
                .then()
                .statusCode(201)
                .body("rawMaterials.size()", is(1))
                .body("rawMaterials[0].rawMaterialName", is("Parafuso"))
                .body("rawMaterials[0].quantityNeeded", is(20));
    }

    @Test
    @Order(3)
    public void testListProducts() {
        given()
                .when()
                .get("/products")
                .then()
                .statusCode(200)
                .body("totalElements", greaterThan(0));
    }

    @Test
    @Order(4)
    public void testDeleteProduct() {
        given()
                .when()
                .delete("/products/" + productId)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/products/" + productId)
                .then()
                .statusCode(404);
    }

    @Test
    public void testPartialUpdateProduct() {
        // 1. Create
        ProductRequest createRequest = new ProductRequest();
        createRequest.name = "Original Product";
        createRequest.description = "Original Desc";
        createRequest.price = new BigDecimal("50.00");
        createRequest.stockQuantity = 5;

        String id = given()
                .contentType(ContentType.JSON)
                .body(createRequest)
                .when().post("/products")
                .then()
                .statusCode(201)
                .extract().path("id");

        // 2. Partial Update (only price)
        ProductRequest updateRequest = new ProductRequest();
        updateRequest.price = new BigDecimal("75.00");

        given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
                .when().put("/products/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Original Product"))
                .body("description", is("Original Desc"))
                .body("price", is(75.0f))
                .body("stockQuantity", is(5));
    }
}
