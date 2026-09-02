package com.resqai.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Structured response from Gemini for a first-aid analysis.
 * Uses cautious language – never presented as a definitive medical diagnosis.
 */
public record FirstAidResponse(
        @JsonProperty("situation")
        String situation,

        @JsonProperty("severity")
        String severity,          // LOW | MODERATE | HIGH | CRITICAL | UNKNOWN

        @JsonProperty("confidence")
        Double confidence,        // 0.0 – 1.0

        @JsonProperty("immediateActions")
        List<String> immediateActions,

        @JsonProperty("avoid")
        List<String> avoid,

        @JsonProperty("warningSigns")
        List<String> warningSigns,

        @JsonProperty("seekEmergencyHelp")
        boolean seekEmergencyHelp,

        @JsonProperty("reasonForEscalation")
        String reasonForEscalation,

        @JsonProperty("disclaimer")
        String disclaimer
) {}
