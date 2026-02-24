package com.duckstock.resource;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
public class MeEndpointIntegrationTest {

    @Test
    public void testMeEndpointWithRealCookie() {
        // 0. Register a user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.name = "Me Test User";
        registerRequest.email = "metest@duckstock.com";
        registerRequest.password = "password123";

        given()
                .contentType(ContentType.JSON)
                .body(registerRequest)
                .when()
                .post("/auth/register")
                .then()
                .statusCode(201);

        // 1. Login to get the cookie
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.email = "metest@duckstock.com";
        loginRequest.password = "password123";

        Response loginResponse = given()
                .contentType(ContentType.JSON)
                .body(loginRequest)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(200)
                .cookie("jwt_token", notNullValue())
                .extract().response();

        String sessionId = loginResponse.getCookie("jwt_token");

        // 2. Call /me with the cookie
        given()
                .cookie("jwt_token", sessionId)
                .when()
                .get("/auth/me")
                .then()
                .statusCode(200)
                .body("email", is("metest@duckstock.com"));
    }
}
