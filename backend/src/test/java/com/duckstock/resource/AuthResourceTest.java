package com.duckstock.resource;

import com.duckstock.dto.auth.LoginRequest;
import com.duckstock.dto.auth.RegisterRequest;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
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

    private static String accessToken;
    private static String refreshToken;

    @Test
    @Order(1)
    public void testRegister() {
        RegisterRequest request = new RegisterRequest();
        request.name = "Auth Test User";
        request.email = "authtest@duckstock.com";
        request.password = "password123";

        Response response = given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/auth/register")
                .then()
                .statusCode(201)
                .body("user.name", is("Auth Test User"))
                .body("user.email", is("authtest@duckstock.com"))
                .body("accessToken", notNullValue())
                .cookie("jwt_token", notNullValue())
                .extract().response();

        accessToken = response.path("accessToken");
        refreshToken = response.getCookie("jwt_token");
    }

    @Test
    @Order(2)
    public void testLogin() {
        LoginRequest request = new LoginRequest();
        request.email = "authtest@duckstock.com";
        request.password = "password123";

        Response response = given()
                .contentType(ContentType.JSON)
                .body(request)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(200)
                .body("user.email", is("authtest@duckstock.com"))
                .body("accessToken", notNullValue())
                .cookie("jwt_token", notNullValue())
                .extract().response();

        accessToken = response.path("accessToken");
        refreshToken = response.getCookie("jwt_token");
    }

    @Test
    @Order(3)
    public void testGetMeWithToken() {
        given()
                .header("Authorization", "Bearer " + accessToken)
                .when()
                .get("/auth/me")
                .then()
                .statusCode(200)
                .body("email", is("authtest@duckstock.com"));
    }

    @Test
    @Order(4)
    public void testGetMeWithoutToken() {
        given()
                .when()
                .get("/auth/me")
                .then()
                .statusCode(401);
    }

    @Test
    @Order(5)
    public void testRefreshAccessToken() {
        given()
                .cookie("jwt_token", refreshToken)
                .when()
                .post("/auth/refresh")
                .then()
                .statusCode(200)
                .body("accessToken", notNullValue());
    }

    @Test
    @Order(6)
    public void testLogout() {
        given()
                .when()
                .post("/auth/logout")
                .then()
                .statusCode(200)
                .cookie("jwt_token", is(""));
    }

    @Test
    @Order(7)
    public void testLoginWithEmptyBody() {
        given()
                .contentType(ContentType.JSON)
                .when()
                .post("/auth/login")
                .then()
                .statusCode(400);
    }

    @Test
    @Order(8)
    public void testLoginWithEmptyJson() {
        given()
                .contentType(ContentType.JSON)
                .body("{}")
                .when()
                .post("/auth/login")
                .then()
                .statusCode(400);
    }
}
