import { Shield, Phone, Clock } from 'lucide-react';

const tabs = [
  { id: 'analyze', label: 'Emergency Guide', icon: Shield },
  { id: 'contacts', label: 'Emergency Contacts', icon: Phone },
  { id: 'history', label: 'Incident History', icon: Clock },
];

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Brand */}
        <div className="flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ResQ AI</h1>
            <p className="text-xs text-gray-400">Emergency First-Aid Guidance</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/50 border border-amber-900/50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Not a substitute for professional care
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex gap-1 -mb-px">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
