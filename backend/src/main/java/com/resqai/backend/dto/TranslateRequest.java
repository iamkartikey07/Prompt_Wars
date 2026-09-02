package com.resqai.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for translating first-aid guidance.
 */
public record TranslateRequest(
        @NotBlank String text,
        @NotBlank String targetLanguage  // e.g. "Hindi", "Tamil", "Bengali"
) {}
