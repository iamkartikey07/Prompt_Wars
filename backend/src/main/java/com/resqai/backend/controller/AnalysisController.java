package com.resqai.backend.controller;

import com.resqai.backend.dto.AnalyzeRequest;
import com.resqai.backend.dto.FirstAidResponse;
import com.resqai.backend.dto.TranslateRequest;
import com.resqai.backend.dto.TranslateResponse;
import com.resqai.backend.model.Incident;
import com.resqai.backend.service.GeminiService;
import com.resqai.backend.service.IncidentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);

    private final IncidentService incidentService;
    private final GeminiService geminiService;

    public AnalysisController(IncidentService incidentService, GeminiService geminiService) {
        this.incidentService = incidentService;
        this.geminiService = geminiService;
    }

    /**
     * POST /api/analyze
     * Accepts text and/or image, returns structured first-aid guidance.
     */
    @PostMapping("/analyze")
    public ResponseEntity<FirstAidResponse> analyze(@Valid @RequestBody AnalyzeRequest request) {
        if ((request.description() == null || request.description().isBlank())
                && (request.imageBase64() == null || request.imageBase64().isBlank())) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Received analyze request. Has image: {}", request.imageBase64() != null && !request.imageBase64().isBlank());

        FirstAidResponse response = incidentService.analyzeAndSave(
                request.description(),
                request.imageBase64(),
                request.imageMimeType()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/translate
     * Translates guidance text to a specified local language using Gemini.
     */
    @PostMapping("/translate")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        try {
            String translated = geminiService.translateText(request.text(), request.targetLanguage());
            return ResponseEntity.ok(new TranslateResponse(translated, request.targetLanguage()));
        } catch (Exception e) {
            log.error("Translation failed", e);
            return ResponseEntity.ok(new TranslateResponse(
                    "Translation is currently unavailable. Please try again shortly.",
                    request.targetLanguage()
            ));
        }
    }

    /**
     * GET /api/incidents
     * Returns recent incident history.
     */
    @GetMapping("/incidents")
    public ResponseEntity<List<Incident>> getIncidents() {
        return ResponseEntity.ok(incidentService.getRecentIncidents());
    }
}
