import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, Clock, ChevronRight, Baby } from 'lucide-react';
import { usePatientCtx } from '../App';
import { RiskBadge } from '../components/RiskGauge';

export default function AlertsPage() {
  const nav = useNavigate();
  const { patients, stats } = usePatientCtx();

  const alerts = patients.filter(p => p._risk?.tier >= 2)
                         .sort((a, b) => (b._risk?.tier ?? 0) - (a._risk?.tier ?? 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neo-text flex items-center gap-2">
            <Bell className="w-5 h-5 text-neo-red" />
            Critical Alerts
          </h1>
          <p className="text-xs text-neo-muted mt-0.5 font-mono">HIGH RISK · VERY HIGH RISK PATIENTS</p>
        </div>
        {alerts.length > 0 && (
          <span className="text-sm font-mono bg-neo-red/15 text-neo-red border border-neo-red/30 px-3 py-1 rounded-full">
            {alerts.length} ALERT{alerts.length > 1 ? 'S' : ''}
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 border border-neo-red/20 neon-border-red">
          <p className="text-xs text-neo-muted mb-1">Very High Risk</p>
          <p className="text-3xl font-bold font-mono text-neo-red">{stats.veryHigh}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-neo-red animate-pulse" />
            <span className="text-xs text-neo-muted">P ≥ 75%</span>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border border-neo-orange/20">
          <p className="text-xs text-neo-muted mb-1">High Risk</p>
          <p className="text-3xl font-bold font-mono text-neo-orange">{stats.high}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-neo-orange" />
            <span className="text-xs text-neo-muted">P 50–75%</span>
          </div>
        </div>
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="glass rounded-xl border border-neo-border border-dashed p-12 text-center">
          <Bell className="w-10 h-10 text-neo-green/40 mx-auto mb-3" />
          <p className="text-neo-green text-sm font-medium">No Critical Alerts</p>
          <p className="text-neo-muted text-xs mt-1">All patients are within safe risk thresholds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((p, i) => {
            const isVeryHigh = p._risk?.tier === 3;
            const elapsed = () => {
              const m = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 60000);
              return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
            };
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => nav(`/patient/${p.id}`)}
                className={`glass rounded-xl p-4 border cursor-pointer transition-all hover:scale-[1.01]
                             ${isVeryHigh ? 'border-neo-red/40 bg-neo-red/5' : 'border-neo-orange/30 bg-neo-orange/5'}`}
              >
                <div className="flex items-center gap-3">
                  {/* Pulse indicator */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                    ${isVeryHigh ? 'bg-neo-red/20' : 'bg-neo-orange/20'}`}>
                      {isVeryHigh
                        ? <AlertTriangle className="w-5 h-5 text-neo-red" />
                        : <Baby className="w-5 h-5 text-neo-orange" />}
                    </div>
                    {isVeryHigh && (
                      <span className="absolute inset-0 rounded-full bg-neo-red/20 animate-ping-slow" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono font-semibold text-sm text-neo-text">{p.patient_name || `PT-${p.id.slice(-4)}`}</span>
                      <RiskBadge label={p._risk?.label ?? 'High'} />
                    </div>
                    <div className="text-xs text-neo-muted font-mono">
                      GA {p.ga}wk · {p.bw}g · Onset {p.age_onset}h
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className={`font-mono font-bold ${isVeryHigh ? 'text-neo-red' : 'text-neo-orange'}`}>
                        {(p.probability * 100).toFixed(1)}%
                      </span>
                      <span className="text-neo-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />{elapsed()}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neo-muted flex-shrink-0" />
                </div>

                {isVeryHigh && (
                  <div className="mt-3 pt-3 border-t border-neo-red/20 text-xs text-neo-red font-mono">
                    ⚠ IMMEDIATE INTERVENTION — Blood culture · IV antibiotics · Escalated monitoring
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
