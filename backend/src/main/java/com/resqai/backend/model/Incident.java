package com.resqai.backend.model;

import com.resqai.backend.dto.FirstAidResponse;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Persisted incident record stored in MongoDB.
 */
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    private String description;
    private boolean hasImage;
    private FirstAidResponse analysis;
    private Instant createdAt;
    private String status; // ANALYZED | UNCERTAIN | ERROR

    public Incident() {}

    public Incident(String description, boolean hasImage, FirstAidResponse analysis, String status) {
        this.description = description;
        this.hasImage = hasImage;
        this.analysis = analysis;
        this.status = status;
        this.createdAt = Instant.now();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isHasImage() { return hasImage; }
    public void setHasImage(boolean hasImage) { this.hasImage = hasImage; }

    public FirstAidResponse getAnalysis() { return analysis; }
    public void setAnalysis(FirstAidResponse analysis) { this.analysis = analysis; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
