package com.resqai.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resqai.backend.dto.FirstAidResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service that calls the Gemini API directly via HTTP for structured first-aid analysis.
 * Using the Gemini REST API to avoid dependency conflicts with early SDK versions.
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    private static final String SYSTEM_PROMPT = """
            You are ResQ AI, an emergency first-aid guidance assistant.
            
            IMPORTANT RULES:
            - Never provide definitive medical diagnoses.
            - Always use cautious language like "possible", "may indicate", "could be".
            - Always recommend professional medical help when there is any doubt.
            - If you cannot determine the situation clearly, set confidence below 0.5 and severity to UNKNOWN.
            - Always include a disclaimer reminding users to seek professional help.
            
            SEVERITY LEVELS:
            - LOW: Minor issue, manageable at home
            - MODERATE: Needs attention, monitor carefully
            - HIGH: Urgent medical attention recommended
            - CRITICAL: Call emergency services immediately
            - UNKNOWN: Cannot determine from provided information
            
            Respond ONLY with valid JSON in exactly this structure:
            {
              "situation": "brief description of possible situation",
              "severity": "LOW|MODERATE|HIGH|CRITICAL|UNKNOWN",
              "confidence": 0.0 to 1.0,
              "immediateActions": ["step 1", "step 2", ...],
              "avoid": ["thing to avoid 1", ...],
              "warningSigns": ["warning sign 1", ...],
              "seekEmergencyHelp": true or false,
              "reasonForEscalation": "reason if seekEmergencyHelp is true, otherwise empty string",
              "disclaimer": "This is AI-generated guidance and NOT a substitute for professional medical advice. Always consult a qualified medical professional."
            }
            """;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String model;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    /**
     * Analyze a text description of an emergency situation.
     */
    public FirstAidResponse analyzeText(String description) throws IOException, InterruptedException {
        log.debug("Analyzing text description: {}", description.substring(0, Math.min(description.length(), 100)));

        String prompt = "Analyze this emergency situation and provide first-aid guidance:\n\n" + description;

        var requestBody = buildTextRequest(prompt);
        return callGemini(requestBody);
    }

    /**
     * Analyze both text and an image (multimodal).
     */
    public FirstAidResponse analyzeMultimodal(String description, String imageBase64, String mimeType)
            throws IOException, InterruptedException {
        log.debug("Analyzing multimodal input");

        String prompt = description != null && !description.isBlank()
                ? "Analyze this emergency situation from the image and description:\n\n" + description
                : "Analyze this emergency situation from the image and provide first-aid guidance:";

        var requestBody = buildMultimodalRequest(prompt, imageBase64, mimeType);
        return callGemini(requestBody);
    }

    /**
     * Translate first-aid guidance text to a target language.
     */
    public String translateText(String text, String targetLanguage) throws IOException, InterruptedException {
        log.debug("Translating to {}", targetLanguage);

        String prompt = String.format(
                "Translate the following first-aid guidance text to %s. " +
                "Preserve the meaning exactly. Return ONLY the translated text, no explanations:\n\n%s",
                targetLanguage, text
        );

        var requestBody = buildSimpleTextRequest(prompt);
        String rawResponse = callGeminiRaw(requestBody);
        return extractTextFromResponse(rawResponse);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private Map<String, Object> buildTextRequest(String userPrompt) {
        return Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 1024,
                        "responseMimeType", "application/json"
                )
        );
    }

    private Map<String, Object> buildMultimodalRequest(String userPrompt, String imageBase64, String mimeType) {
        return Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", SYSTEM_PROMPT))
                ),
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("inline_data", Map.of(
                                        "mime_type", mimeType,
                                        "data", imageBase64
                                )),
                                Map.of("text", userPrompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "maxOutputTokens", 1024,
                        "responseMimeType", "application/json"
                )
        );
    }

    private Map<String, Object> buildSimpleTextRequest(String userPrompt) {
        return Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.1,
                        "maxOutputTokens", 2048
                )
        );
    }

    private FirstAidResponse callGemini(Map<String, Object> requestBody) throws IOException, InterruptedException {
        String rawResponse = callGeminiRaw(requestBody);
        return parseFirstAidResponse(rawResponse);
    }

    private String callGeminiRaw(Map<String, Object> requestBody) throws IOException, InterruptedException {
        String url = GEMINI_BASE_URL + "/" + model + ":generateContent?key=" + apiKey;
        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Gemini API error {}: {}", response.statusCode(), response.body());
            throw new IOException("Gemini API returned status " + response.statusCode() + ": " + response.body());
        }

        return response.body();
    }

    private FirstAidResponse parseFirstAidResponse(String rawGeminiResponse) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(rawGeminiResponse);

        // Extract the text content from the Gemini response structure
        String jsonText = Optional.ofNullable(root.path("candidates").get(0))
                .map(c -> c.path("content").path("parts").get(0))
                .map(p -> p.path("text").asText())
                .orElseThrow(() -> new JsonProcessingException("No content in Gemini response") {});

        // Clean up markdown code fences if present
        jsonText = jsonText.trim();
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
        }

        return objectMapper.readValue(jsonText, FirstAidResponse.class);
    }

    private String extractTextFromResponse(String rawGeminiResponse) throws JsonProcessingException {
        JsonNode root = objectMapper.readTree(rawGeminiResponse);
        return Optional.ofNullable(root.path("candidates").get(0))
                .map(c -> c.path("content").path("parts").get(0))
                .map(p -> p.path("text").asText())
                .orElse("Translation unavailable.");
    }

    /**
     * Returns a safe fallback response when Gemini is unavailable or fails.
     */
    public FirstAidResponse fallbackResponse() {
        return new FirstAidResponse(
                "Unable to analyze situation",
                "UNKNOWN",
                0.0,
                List.of(
                        "Ensure the scene is safe before approaching.",
                        "Call emergency services (112 / 911) immediately.",
                        "Keep the person calm and still.",
                        "Do not move the person unless in immediate danger."
                ),
                List.of(
                        "Do not give food or water unless directed by a professional.",
                        "Do not leave the person alone."
                ),
                List.of(
                        "Unconsciousness or unresponsiveness",
                        "Difficulty breathing",
                        "Severe bleeding",
                        "Signs of shock"
                ),
                true,
                "AI analysis was unavailable. Always seek professional emergency help when uncertain.",
                "This is AI-generated guidance and NOT a substitute for professional medical advice. " +
                        "Please contact emergency services or a qualified medical professional immediately."
        );
    }
}
