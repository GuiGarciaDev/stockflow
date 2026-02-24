package com.duckstock.resource;

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
public class RawMaterialResourceTest {

    private static String materialId;

    @Test
    @Order(1)
    public void testCreateRawMaterial() {
        RawMaterialRequest request = new RawMaterialRequest();
        request.name = "Tábua de Madeira";
        request.description = "Madeira de carvalho";
        request.price = new BigDecimal("50.00");
        request.stockQuantity = 100;
        request.unit = "m²";

        materialId = given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/raw-materials")
                .then()
                .statusCode(201)
                .body("name", is("Tábua de Madeira"))
                .body("description", is("Madeira de carvalho"))
                .body("price", is(50.0f))
                .body("stockQuantity", is(100))
                .body("unit", is("m²"))
                .extract()
                .path("id");
    }

    @Test
    @Order(2)
    public void testListRawMaterials() {
        given()
                .when()
                .get("/raw-materials")
                .then()
                .statusCode(200)
                .body("totalElements", greaterThan(0));
    }

    @Test
    @Order(3)
    public void testUpdateRawMaterial() {
        RawMaterialRequest request = new RawMaterialRequest();
        request.name = "Tábua de Madeira Atualizada";
        request.price = new BigDecimal("60.00");
        request.stockQuantity = 120;
        request.unit = "m²";

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .put("/raw-materials/" + materialId)
                .then()
                .statusCode(200)
                .body("name", is("Tábua de Madeira Atualizada"))
                .body("description", is("Madeira de carvalho"))
                .body("price", is(60.0f))
                .body("stockQuantity", is(120))
                .body("unit", is("m²"));
    }

    @Test
    @Order(4)
    public void testDeleteRawMaterial() {
        given()
                .when()
                .delete("/raw-materials/" + materialId)
                .then()
                .statusCode(204);

        given()
                .when()
                .get("/raw-materials/" + materialId)
                .then()
                .statusCode(404);
    }

    @Test
    public void testListAllWithEmptyParams() {
        given()
                .queryParam("page", "")
                .queryParam("size", "")
                .queryParam("search", "")
                .when()
                .get("/raw-materials")
                .then()
                .statusCode(200);
    }

    @Test
    public void testListAllWithNullParams() {
        given()
                .when()
                .get("/raw-materials")
                .then()
                .statusCode(200);
    }

    @Test
    public void testUpdateWithNonExistentId() {
        RawMaterialRequest request = new RawMaterialRequest();
        request.name = "Test";
        request.price = BigDecimal.TEN;
        request.stockQuantity = 10;
        request.unit = "un";

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .pathParam("id", UUID.randomUUID().toString())
                .when()
                .put("/raw-materials/{id}")
                .then()
                .statusCode(404);
    }

    @Test
    public void testUpdateWithMalformedId() {
        RawMaterialRequest request = new RawMaterialRequest();
        request.name = "Test";
        request.price = BigDecimal.TEN;
        request.stockQuantity = 10;
        request.unit = "un";

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .pathParam("id", "invalid-uuid")
                .when()
                .put("/raw-materials/{id}")
                .then()
                .statusCode(404);
    }

    @Test
    public void testPartialUpdateRawMaterial() {
        // 1. Create
        RawMaterialRequest createRequest = new RawMaterialRequest();
        createRequest.name = "Original Name";
        createRequest.description = "Original Description";
        createRequest.price = new BigDecimal("10.00");
        createRequest.stockQuantity = 100;
        createRequest.unit = "kg";

        String id = given()
                .contentType(ContentType.JSON)
                .body(createRequest)
                .when().post("/raw-materials")
                .then()
                .statusCode(201)
                .extract().path("id");

        // 2. Partial Update (only name)
        RawMaterialRequest updateRequest = new RawMaterialRequest();
        updateRequest.name = "Updated Name";

        given()
                .contentType(ContentType.JSON)
                .body(updateRequest)
                .when().put("/raw-materials/" + id)
                .then()
                .statusCode(200)
                .body("name", is("Updated Name"))
                .body("description", is("Original Description"))
                .body("price", is(10.0f))
                .body("stockQuantity", is(100))
                .body("unit", is("kg"));
    }
}
