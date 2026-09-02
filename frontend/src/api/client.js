import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Analysis ─────────────────────────────────────────────────────────────────

export async function analyzeIncident(description, imageBase64 = null, imageMimeType = null) {
  const { data } = await api.post('/analyze', { description, imageBase64, imageMimeType });
  return data;
}

// ── Translation ───────────────────────────────────────────────────────────────

export async function translateGuidance(text, targetLanguage) {
  const { data } = await api.post('/translate', { text, targetLanguage });
  return data;
}

// ── Emergency Contacts ────────────────────────────────────────────────────────

export async function getEmergencyContacts() {
  const { data } = await api.get('/emergency-contacts');
  return data;
}

export async function addEmergencyContact(contact) {
  const { data } = await api.post('/emergency-contacts', contact);
  return data;
}

export async function deleteEmergencyContact(id) {
  await api.delete(`/emergency-contacts/${id}`);
}

export async function sendAlert(incidentSummary) {
  const { data } = await api.post('/emergency-contacts/alert', { incidentSummary });
  return data;
}

// ── Incidents ─────────────────────────────────────────────────────────────────

export async function getIncidents() {
  const { data } = await api.get('/incidents');
  return data;
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}
