import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Info, ImageIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getIncidents } from '../api/client';

const SEVERITY_BADGE = {
  CRITICAL: 'bg-red-900/60 text-red-300 border-red-800',
  HIGH:     'bg-orange-900/60 text-orange-300 border-orange-800',
  MODERATE: 'bg-amber-900/60 text-amber-300 border-amber-800',
  LOW:      'bg-green-900/60 text-green-300 border-green-800',
  UNKNOWN:  'bg-gray-800 text-gray-400 border-gray-700',
};

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function IncidentHistory() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch {
      toast.error('Could not load incident history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Incident History</h2>
          <p className="text-sm text-gray-400">Past emergency analyses stored securely</p>
        </div>
        <button
          onClick={fetchIncidents}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
          <Clock size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No incidents recorded yet</p>
          <p className="text-gray-600 text-sm mt-1">Analyzed incidents will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(incident => {
            const sv = (incident.analysis?.severity || 'UNKNOWN').toUpperCase();
            const isExpanded = expanded === incident.id;
            return (
              <div key={incident.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : incident.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold border px-2 py-0.5 rounded uppercase tracking-wide ${SEVERITY_BADGE[sv] || SEVERITY_BADGE.UNKNOWN}`}>
                        {sv}
                      </span>
                      {incident.hasImage && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <ImageIcon size={11} /> image
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white mt-1 truncate">
                      {incident.analysis?.situation || 'Unknown situation'}
                    </p>
                    {incident.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{incident.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500">{formatTime(incident.createdAt)}</p>
                    <p className={`text-xs mt-1 ${
                      incident.status === 'ANALYZED' ? 'text-green-400' :
                      incident.status === 'UNCERTAIN' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>{incident.status}</p>
                  </div>
                </button>

                {isExpanded && incident.analysis && (
                  <div className="border-t border-gray-800 p-4 space-y-3">
                    {incident.analysis.immediateActions?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">
                          Immediate Actions
                        </h4>
                        <ol className="space-y-1">
                          {incident.analysis.immediateActions.map((a, i) => (
                            <li key={i} className="text-xs text-gray-300 flex gap-2">
                              <span className="text-gray-500 flex-shrink-0">{i + 1}.</span>
                              {a}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {incident.analysis.seekEmergencyHelp && (
                      <p className="text-xs text-red-400 flex items-center gap-1.5">
                        <AlertTriangle size={12} />
                        Emergency help was recommended
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
