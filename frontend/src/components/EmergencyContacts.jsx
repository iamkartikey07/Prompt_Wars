import { useState, useEffect } from 'react';
import { Plus, Trash2, Phone, Mail, UserCircle, Bell, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmergencyContacts, addEmergencyContact, deleteEmergencyContact, sendAlert } from '../api/client';

const EMPTY_FORM = { name: '', phone: '', email: '', relationship: 'Family' };
const RELATIONSHIPS = ['Family', 'Friend', 'Colleague', 'Doctor', 'Neighbour', 'Other'];

export default function EmergencyContacts({ currentResult }) {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [alerting, setAlerting] = useState(false);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch {
      toast.error('Could not load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setAdding(true);
    try {
      const saved = await addEmergencyContact(form);
      setContacts(prev => [saved, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      toast.success(`${saved.name} added as emergency contact`);
    } catch {
      toast.error('Could not save contact');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove ${name} from emergency contacts?`)) return;
    try {
      await deleteEmergencyContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact removed');
    } catch {
      toast.error('Could not remove contact');
    }
  };

  const handleAlert = async () => {
    if (contacts.length === 0) {
      toast.error('No contacts configured');
      return;
    }
    setAlerting(true);
    try {
      const summary = currentResult
        ? `Possible situation: ${currentResult.situation}. Severity: ${currentResult.severity}.`
        : 'Emergency assistance needed.';
      const res = await sendAlert(summary);
      toast.success(res.message, { duration: 6000 });
    } catch {
      toast.error('Alert failed');
    } finally {
      setAlerting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Emergency Contacts</h2>
          <p className="text-sm text-gray-400">People to notify during an emergency</p>
        </div>
        <div className="flex gap-2">
          {contacts.length > 0 && (
            <button
              onClick={handleAlert}
              disabled={alerting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              {alerting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Bell size={15} />
              }
              Alert All
            </button>
          )}
          <button
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Alert simulation notice */}
      <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl px-4 py-3 flex gap-2">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300">
          Alert notifications are currently <strong>simulated</strong>. To send real SMS/WhatsApp messages,
          configure a notification provider (e.g. Twilio) in the backend.
        </p>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-900 border border-gray-700 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white mb-1">New Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Doe"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone *</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="jane@email.com"
                type="email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Relationship</label>
              <select
                value={form.relationship}
                onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {RELATIONSHIPS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={adding}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {adding ? 'Saving…' : 'Save Contact'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contact list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <UserCircle size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No emergency contacts yet</p>
          <p className="text-gray-600 text-sm mt-1">Add contacts so they can be notified during an emergency</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(contact => (
            <div key={contact.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle size={24} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-sm">{contact.name}</p>
                  <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{contact.relationship}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {contact.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Phone size={11} /> {contact.phone}
                    </span>
                  )}
                  {contact.email && (
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={11} /> {contact.email}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(contact.id, contact.name)}
                className="p-2 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
