import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, ChevronRight, Baby } from 'lucide-react';
import { RiskBadge } from './RiskGauge';

const COLOR_MAP = {
  green:  { bar: 'bg-neo-green', glow: 'shadow-neo-green/20' },
  yellow: { bar: 'bg-neo-yellow', glow: 'shadow-neo-yellow/20' },
  orange: { bar: 'bg-neo-orange', glow: 'shadow-neo-orange/20' },
  red:    { bar: 'bg-neo-red', glow: 'shadow-neo-red/20' },
};

export default function PatientCard({ patient, onRemove, index = 0 }) {
  const nav  = useNavigate();
  const prob  = patient.probability ?? 0;
  const risk  = patient._risk ?? { label: 'Low', color: 'green' };
  const { bar, glow } = COLOR_MAP[risk.color] || COLOR_MAP.green;

  const elapsed = () => {
    const ms = Date.now() - new Date(patient.createdAt).getTime();
    const m  = Math.floor(ms / 60000);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`glass rounded-xl p-4 cursor-pointer hover:border-neo-cyan/30 transition-all duration-200
                  border border-neo-border group shadow-lg ${glow}`}
      onClick={() => nav(`/patient/${patient.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neo-cyan/10 border border-neo-cyan/20 flex items-center justify-center">
            <Baby className="w-4 h-4 text-neo-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neo-text font-mono">{patient.patient_name || `PT-${patient.id.slice(-4)}`}</p>
            <p className="text-xs text-neo-muted">GA {patient.ga}wk · {patient.bw}g</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); onRemove(patient.id); }}
            className="p-1 rounded text-neo-muted hover:text-neo-red transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-4 h-4 text-neo-muted/50 group-hover:text-neo-cyan transition-colors" />
        </div>
      </div>

      {/* Probability bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-neo-muted mb-1">
          <span>Sepsis Probability</span>
          <span className="font-mono font-semibold text-neo-text">{(prob * 100).toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-neo-surface rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${prob * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px currentColor)` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <RiskBadge label={risk.label} />
        <span className="text-xs text-neo-muted flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {elapsed()}
        </span>
      </div>

      {risk.tier >= 3 && (
        <div className="mt-2 text-xs text-neo-red font-mono flex items-center gap-1 animate-pulse">
          ⚠ CRITICAL — IMMEDIATE ATTENTION REQUIRED
        </div>
      )}
    </motion.div>
  );
}
