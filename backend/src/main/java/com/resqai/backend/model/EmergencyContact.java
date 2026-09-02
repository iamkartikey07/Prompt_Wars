package com.resqai.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Emergency contact stored per session/user.
 */
@Document(collection = "emergency_contacts")
public class EmergencyContact {

    @Id
    private String id;

    private String name;
    private String phone;
    private String email;
    private String relationship;
    private Instant createdAt;

    public EmergencyContact() {}

    public EmergencyContact(String name, String phone, String email, String relationship) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.relationship = relationship;
        this.createdAt = Instant.now();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
