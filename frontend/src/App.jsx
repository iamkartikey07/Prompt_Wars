import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import IncidentForm from './components/IncidentForm';
import GuidanceResult from './components/GuidanceResult';
import EmergencyContacts from './components/EmergencyContacts';
import IncidentHistory from './components/IncidentHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151' },
          error: { style: { borderColor: '#dc2626' } },
          success: { style: { borderColor: '#16a34a' } },
        }}
      />

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <IncidentForm
              onResult={setResult}
              loading={loading}
              setLoading={setLoading}
            />
            {result && (
              <GuidanceResult result={result} />
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <EmergencyContacts currentResult={result} />
        )}

        {activeTab === 'history' && (
          <IncidentHistory />
        )}
      </main>
    </div>
  );
}
