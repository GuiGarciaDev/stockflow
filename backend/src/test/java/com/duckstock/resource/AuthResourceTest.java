package com.duckstock.resource;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthResourceTest {

    @Test
    @Order(1)
    public void testRegister() {
        RegisterRequest request = new RegisterRequest();
        request.name = "Test User";
        request.email = "test@duckstock.com";
        request.password = "password123";

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/auth/register")
                .then()
                .statusCode(201)
                .body("name", is("Test User"))
                .body("email", is("test@duckstock.com"))
                .body("role", is("USER"))
                .cookie("jwt_token", notNullValue());
    }

    @Test
    @Order(2)
    public void testLogin() {
        LoginRequest request = new LoginRequest();
        request.email = "test@duckstock.com";
        request.password = "password123";

        given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(200)
                .body("email", is("test@duckstock.com"))
                .cookie("jwt_token", notNullValue());
    }

    @Test
    @Order(3)
    @TestSecurity(user = "test@duckstock.com", roles = "USER")
    public void testGetMe() {
        given()
                .when()
                .get("/auth/me")
                .then()
                .statusCode(200)
                .body("email", is("test@duckstock.com"));
    }

    @Test
    @Order(4)
    public void testLogout() {
        given()
                .contentType(ContentType.JSON)
                .when()
                .post("/auth/logout")
                .then()
                .statusCode(200)
                .cookie("jwt_token", is(""));
    }
}
