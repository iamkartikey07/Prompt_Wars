import { useState } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle, Info,
  ChevronDown, Globe, Bell, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { translateGuidance, sendAlert } from '../api/client';

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-800', label: 'CRITICAL', icon: ShieldAlert },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-800', label: 'HIGH', icon: AlertTriangle },
  MODERATE: { color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-800', label: 'MODERATE', icon: AlertTriangle },
  LOW:      { color: 'text-green-400', bg: 'bg-green-950/50', border: 'border-green-800', label: 'LOW', icon: CheckCircle },
  UNKNOWN:  { color: 'text-gray-400', bg: 'bg-gray-800/50', border: 'border-gray-700', label: 'UNKNOWN', icon: Info },
};

const LANGUAGES = [
  'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi',
  'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia',
  'Urdu', 'Assamese',
];

export default function GuidanceResult({ result }) {
  const [selectedLang, setSelectedLang] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [alerting, setAlerting] = useState(false);

  const severity = result?.severity?.toUpperCase() || 'UNKNOWN';
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.UNKNOWN;
  const SeverityIcon = cfg.icon;

  const handleTranslate = async () => {
    if (!selectedLang) { toast.error('Select a language first'); return; }
    setTranslating(true);
    try {
      const textToTranslate = buildTranslationText(result);
      const res = await translateGuidance(textToTranslate, selectedLang);
      setTranslatedText(res.translatedText);
      toast.success(`Translated to ${selectedLang}`);
    } catch {
      toast.error('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const handleAlert = async () => {
    setAlerting(true);
    try {
      const summary = `Emergency situation detected: ${result.situation}. Severity: ${result.severity}.`;
      const res = await sendAlert(summary);
      toast.success(res.message, { duration: 5000 });
    } catch {
      toast.error('Alert failed. Please try again.');
    } finally {
      setAlerting(false);
    }
  };

  return (
    <div id="guidance-result" className="space-y-4">
      {/* Situation + Severity header */}
      <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
            <SeverityIcon size={24} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-widest ${cfg.color} bg-gray-900/50 px-2 py-0.5 rounded`}>
                {cfg.label}
              </span>
              {result.confidence != null && (
                <span className="text-xs text-gray-500">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              )}
              {result.seekEmergencyHelp && (
                <span className="text-xs text-red-400 bg-red-950/60 border border-red-800 px-2 py-0.5 rounded font-semibold animate-pulse">
                  ⚠ Emergency help recommended
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white mt-1 capitalize">
              Possible situation: {result.situation}
            </h2>
            {result.reasonForEscalation && result.seekEmergencyHelp && (
              <p className="text-sm text-red-300 mt-1">{result.reasonForEscalation}</p>
            )}
          </div>
        </div>
      </div>

      {/* Immediate Actions */}
      {result.immediateActions?.length > 0 && (
        <Section
          title="What to do now"
          color="green"
          icon="✓"
          items={result.immediateActions}
          numbered
        />
      )}

      {/* Avoid */}
      {result.avoid?.length > 0 && (
        <Section
          title="What to avoid"
          color="red"
          icon="✗"
          items={result.avoid}
        />
      )}

      {/* Warning Signs */}
      {result.warningSigns?.length > 0 && (
        <Section
          title="Warning signs to watch for"
          color="amber"
          icon="!"
          items={result.warningSigns}
        />
      )}

      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Alert contacts */}
        <button
          onClick={handleAlert}
          disabled={alerting}
          className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
        >
          {alerting ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Bell size={16} />
          )}
          Alert Emergency Contacts
        </button>

        {/* Translate */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-xl px-3 py-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select language…</option>
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-3 text-gray-500 pointer-events-none" />
          </div>
          <button
            onClick={handleTranslate}
            disabled={!selectedLang || translating}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors whitespace-nowrap"
          >
            {translating ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Globe size={16} />
            )}
            Translate
          </button>
        </div>
      </div>

      {/* Translated text */}
      {translatedText && (
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Translated to {selectedLang}</span>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
        </div>
      )}

      {/* Disclaimer */}
      {result.disclaimer && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl px-4 py-3 flex gap-2">
          <Info size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">{result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, icon, items, numbered }) {
  const colorMap = {
    green: { header: 'text-green-400', bg: 'bg-green-950/30', border: 'border-green-900/50', dot: 'bg-green-500', iconBg: 'bg-green-900/40' },
    red:   { header: 'text-red-400',   bg: 'bg-red-950/30',   border: 'border-red-900/50',   dot: 'bg-red-500',   iconBg: 'bg-red-900/40'   },
    amber: { header: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-900/50', dot: 'bg-amber-500', iconBg: 'bg-amber-900/40' },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${c.header} mb-3 flex items-center gap-2`}>
        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${c.iconBg} ${c.header}`}>
          {icon}
        </span>
        {title}
      </h3>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-200">
            {numbered ? (
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${c.iconBg} ${c.header}`}>
                {i + 1}
              </span>
            ) : (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${c.dot}`} />
            )}
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function buildTranslationText(result) {
  const lines = [];
  lines.push(`Possible situation: ${result.situation}`);
  lines.push(`Severity: ${result.severity}`);
  if (result.immediateActions?.length) {
    lines.push('\nImmediate actions:');
    result.immediateActions.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
  }
  if (result.avoid?.length) {
    lines.push('\nWhat to avoid:');
    result.avoid.forEach(a => lines.push(`- ${a}`));
  }
  if (result.warningSigns?.length) {
    lines.push('\nWarning signs:');
    result.warningSigns.forEach(w => lines.push(`- ${w}`));
  }
  if (result.seekEmergencyHelp) {
    lines.push(`\nSeek emergency help: Yes. ${result.reasonForEscalation || ''}`);
  }
  return lines.join('\n');
}
