package com.resqai.backend.dto;

/**
 * Generic API error response.
 */
public record ErrorResponse(
        String error,
        String message,
        long timestamp
) {
    public ErrorResponse(String error, String message) {
        this(error, message, System.currentTimeMillis());
    }
}
