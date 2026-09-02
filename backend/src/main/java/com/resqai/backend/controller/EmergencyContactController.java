package com.resqai.backend.controller;

import com.resqai.backend.model.EmergencyContact;
import com.resqai.backend.service.EmergencyContactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency-contacts")
public class EmergencyContactController {

    private static final Logger log = LoggerFactory.getLogger(EmergencyContactController.class);

    private final EmergencyContactService service;

    public EmergencyContactController(EmergencyContactService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<EmergencyContact>> getContacts() {
        return ResponseEntity.ok(service.getAllContacts());
    }

    @PostMapping
    public ResponseEntity<EmergencyContact> addContact(@RequestBody Map<String, String> body) {
        EmergencyContact contact = service.saveContact(
                body.get("name"),
                body.get("phone"),
                body.get("email"),
                body.getOrDefault("relationship", "Other")
        );
        return ResponseEntity.ok(contact);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable String id) {
        service.deleteContact(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/emergency-contacts/alert
     * Simulates sending an alert to all configured emergency contacts.
     * Returns clearly whether alerts were simulated or actually sent.
     */
    @PostMapping("/alert")
    public ResponseEntity<Map<String, Object>> sendAlert(@RequestBody Map<String, String> body) {
        String summary = body.getOrDefault("incidentSummary", "Emergency situation detected");
        int notified = service.alertContacts(summary);

        String message = notified == 0
                ? "No emergency contacts configured. Please add contacts in the Emergency Contacts section."
                : String.format(
                        "%d contact(s) have been notified (simulation — configure an SMS/WhatsApp integration to send real messages).",
                        notified
                  );

        return ResponseEntity.ok(Map.of(
                "contactsNotified", notified,
                "message", message,
                "simulated", true
        ));
    }
}
