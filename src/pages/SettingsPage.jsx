import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Wifi, WifiOff, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { checkHealth, getModelInfo, API_BASE } from '../services/api';

export default function SettingsPage() {
  const [health,    setHealth]    = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [checking,  setChecking]  = useState(false);

  const doCheck = async () => {
    setChecking(true);
    const [h, m] = await Promise.all([checkHealth(), getModelInfo()]);
    setHealth(h);
    if (m.ok) setModelInfo(m.data);
    setChecking(false);
  };

  useEffect(() => { doCheck(); }, []);

  const StatusDot = ({ online }) => (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full
                      ${online ? 'bg-neo-green/15 text-neo-green' : 'bg-neo-red/15 text-neo-red'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-neo-green animate-pulse' : 'bg-neo-red'}`} />
      {online ? 'ONLINE' : 'OFFLINE'}
    </span>
  );

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="text-xl font-bold text-neo-text">Settings</h1>

      {/* Backend health */}
      <div className="glass rounded-xl p-5 border border-neo-border">
        <div className="flex items-center justify-between mb-4">
          <p className="section-header m-0"><Server className="w-3.5 h-3.5" />Backend Status</p>
          <button onClick={doCheck} disabled={checking}
            className="btn-ghost text-xs py-1 px-3">
            <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking…' : 'Refresh'}
          </button>
        </div>

        {health && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neo-muted flex items-center gap-2">
                {health.online ? <Wifi className="w-4 h-4 text-neo-green" /> : <WifiOff className="w-4 h-4 text-neo-red" />}
                Connection
              </span>
              <StatusDot online={health.online} />
            </div>
            {!health.online && (
              <p className="text-xs text-neo-yellow font-mono">
                Reason: {health.reason}. Render free-tier may be asleep — first request triggers cold start (~30–60s).
              </p>
            )}
          </motion.div>
        )}

        <div className="mt-4 pt-4 border-t border-neo-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neo-muted">API Endpoint</span>
            <a href={API_BASE} target="_blank" rel="noopener noreferrer"
               className="text-neo-cyan text-xs font-mono flex items-center gap-1 hover:underline">
              {API_BASE.replace('https://', '')} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neo-muted">Swagger Docs</span>
            <a href={`${API_BASE}/docs`} target="_blank" rel="noopener noreferrer"
               className="text-neo-cyan text-xs font-mono flex items-center gap-1 hover:underline">
              /docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Model info */}
      <div className="glass rounded-xl p-5 border border-neo-border">
        <p className="section-header"><Cpu className="w-3.5 h-3.5" />Model Information</p>
        {modelInfo ? (
          <div className="space-y-2">
            {Object.entries(modelInfo).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-neo-muted capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-mono text-neo-cyan text-xs">{String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[
              ['Model Type', 'XGBoost Classifier'],
              ['Task', 'Neonatal Sepsis Prediction'],
              ['Input Features', '19'],
              ['Output', 'Sepsis Probability (0–1)'],
              ['Risk Strata', 'Low / Moderate / High / Very High'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-neo-muted">{k}</span>
                <span className="font-mono text-neo-cyan text-xs">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk thresholds */}
      <div className="glass rounded-xl p-5 border border-neo-border">
        <p className="section-header"><Shield className="w-3.5 h-3.5" />Risk Stratification</p>
        <div className="space-y-2">
          {[
            { label: 'Low',       range: '0 – 20%',  color: 'bg-neo-green', action: 'Routine monitoring' },
            { label: 'Moderate',  range: '20 – 50%', color: 'bg-neo-yellow', action: 'Enhanced surveillance' },
            { label: 'High',      range: '50 – 75%', color: 'bg-neo-orange', action: 'Urgent evaluation' },
            { label: 'Very High', range: '75 – 100%',color: 'bg-neo-red',   action: 'Immediate intervention' },
          ].map(({ label, range, color, action }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
              <span className="text-neo-text font-medium w-24">{label}</span>
              <span className="text-neo-muted font-mono text-xs w-20">{range}</span>
              <span className="text-neo-muted text-xs">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-neo-surface rounded-xl border border-neo-border text-xs text-neo-muted leading-relaxed">
        <Shield className="w-4 h-4 mb-2 text-neo-yellow" />
        <strong className="text-neo-yellow">Clinical Disclaimer:</strong> NeoSepsis AI is an AI-assisted decision support tool.
        Predictions are probabilistic and not a substitute for clinical judgment, physical examination, or laboratory confirmation.
        Always follow institutional protocols and consult a qualified neonatologist for treatment decisions.
      </div>
    </div>
  );
}
