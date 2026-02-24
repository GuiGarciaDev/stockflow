package com.duckstock.dto.common;

import java.time.LocalDateTime;

public class ErrorResponse {

    public int status;
    public String message;
    public String detail;
    public LocalDateTime timestamp;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int status, String message) {
        this();
        this.status = status;
        this.message = message;
    }

    public ErrorResponse(int status, String message, String detail) {
        this(status, message);
        this.detail = detail;
    }
}
