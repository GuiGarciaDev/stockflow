package com.duckstock.resource;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;

@QuarkusTest
public class LoginValidationReproductionTest {

    @Test
    public void testLoginWithEmptyBody() {
        given()
                .contentType(ContentType.JSON)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(400); // User says this returns 500
    }

    @Test
    public void testLoginWithEmptyJson() {
        given()
                .contentType(ContentType.JSON)
                .body("{}")
                .when()
                .post("/auth/login")
                .then()
                .statusCode(400); // User says this returns 500
    }
}
