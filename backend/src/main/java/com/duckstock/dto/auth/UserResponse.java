package com.duckstock.dto.auth;

public class UserResponse {

    public Long id;
    public String name;
    public String email;
    public String role;

    public UserResponse() {}

    public UserResponse(Long id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public static UserResponse from(com.duckstock.entity.User user) {
        return new UserResponse(user.id, user.name, user.email, user.role);
    }
}
