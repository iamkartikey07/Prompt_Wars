package com.resqai.backend.service;

import com.resqai.backend.model.EmergencyContact;
import com.resqai.backend.repository.EmergencyContactRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmergencyContactService {

    private static final Logger log = LoggerFactory.getLogger(EmergencyContactService.class);

    private final EmergencyContactRepository repository;

    public EmergencyContactService(EmergencyContactRepository repository) {
        this.repository = repository;
    }

    public EmergencyContact saveContact(String name, String phone, String email, String relationship) {
        EmergencyContact contact = new EmergencyContact(name, phone, email, relationship);
        return repository.save(contact);
    }

    public List<EmergencyContact> getAllContacts() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public void deleteContact(String id) {
        repository.deleteById(id);
    }

    /**
     * Simulates alerting emergency contacts. In production this would integrate
     * with an SMS/WhatsApp gateway. Currently it logs the alert and returns the
     * contact list that would be notified — no message is actually sent.
     *
     * @param incidentSummary  A short summary of the incident
     * @return number of contacts that would be alerted
     */
    public int alertContacts(String incidentSummary) {
        List<EmergencyContact> contacts = repository.findAllByOrderByCreatedAtDesc();
        for (EmergencyContact contact : contacts) {
            log.info("[ALERT SIMULATION] Would send alert to {} ({}): {}",
                    contact.getName(), contact.getPhone(), incidentSummary);
        }
        return contacts.size();
    }
}
