package com.resqai.backend.dto;

import jakarta.validation.constraints.Size;

/**
 * Request body for incident analysis.
 * At least one of description or imageBase64 must be provided.
 */
public record AnalyzeRequest(
        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        String description,

        String imageBase64,   // base64-encoded image data URI
        String imageMimeType  // e.g. "image/jpeg", "image/png"
) {}
