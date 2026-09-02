package com.resqai.backend.dto;

/**
 * Response wrapper for translated guidance text.
 */
public record TranslateResponse(
        String translatedText,
        String targetLanguage
) {}
