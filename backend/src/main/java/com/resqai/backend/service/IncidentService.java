package com.resqai.backend.service;

import com.resqai.backend.dto.FirstAidResponse;
import com.resqai.backend.model.Incident;
import com.resqai.backend.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final GeminiService geminiService;

    public IncidentService(IncidentRepository incidentRepository, GeminiService geminiService) {
        this.incidentRepository = incidentRepository;
        this.geminiService = geminiService;
    }

    public FirstAidResponse analyzeAndSave(String description, String imageBase64, String imageMimeType) {
        FirstAidResponse response;
        String status;

        try {
            if (imageBase64 != null && !imageBase64.isBlank()) {
                response = geminiService.analyzeMultimodal(description, imageBase64, imageMimeType);
            } else {
                response = geminiService.analyzeText(description);
            }
            status = response.confidence() != null && response.confidence() < 0.4 ? "UNCERTAIN" : "ANALYZED";
        } catch (Exception e) {
            log.error("Gemini analysis failed, using fallback", e);
            response = geminiService.fallbackResponse();
            status = "ERROR";
        }

        // Save to MongoDB
        try {
            Incident incident = new Incident(description, imageBase64 != null && !imageBase64.isBlank(), response, status);
            incidentRepository.save(incident);
            log.debug("Saved incident to MongoDB");
        } catch (Exception e) {
            log.warn("Could not save incident to MongoDB: {}", e.getMessage());
        }

        return response;
    }

    public List<Incident> getRecentIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc();
    }
}
