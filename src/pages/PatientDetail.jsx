import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Baby, Activity, AlertTriangle, CheckCircle, Clipboard } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { usePatientCtx } from '../app';
import { RiskGauge, RiskBadge } from '../components/RiskGauge';

const SIGN_LABELS = {
  enr_leth:'Lethargy', enr_cry:'Abnormal Cry', enr_refl:'Poor Reflexes',
  enr_fever:'Fever', enr_tachyc:'Tachycardia', enr_tachyp:'Tachypnoea',
  enr_apn:'Apnoea', enr_retr:'Retractions', enr_cyan:'Cyanosis',
  enr_abd:'Abd. Distension', enr_puls:'Poor Pulses', enr_hi_cry:'High-pitched Cry',
  enr_cxr:'Abnormal CXR', enr_fio2:'Supplemental FiO2',
};

// Heuristic feature importance: weighted by clinical evidence
const WEIGHTS = {
  enr_tachyc: 0.82, enr_tachyp: 0.79, enr_fever: 0.75, enr_cyan: 0.73,
  enr_apn: 0.71,   enr_retr: 0.68,   enr_puls: 0.65,  enr_abd: 0.60,
  enr_cxr: 0.58,   enr_hi_cry: 0.52, enr_leth: 0.50,  enr_cry: 0.45,
  enr_refl: 0.42,  enr_fio2: 0.38,
  ga: 0.90, bw: 0.85, age_onset: 0.70,
  enr_crp_val: 0.88, enr_tlc_val: 0.78,
};

const RECS = {
  0: ['Continue standard monitoring protocols', 'Routine neonatal care', 'Reassess if clinical deterioration'],
  1: ['Enhanced vital sign monitoring q2h', 'CBC with differential', 'Blood culture if deteriorates', 'Consider empirical antibiotics per protocol'],
  2: ['Immediate blood culture (×2)', 'Empirical broad-spectrum antibiotics', 'IV access and fluid bolus if unstable', 'Neonatologist review urgently', 'Consider CPAP/ventilation'],
  3: ['EMERGENCY: Septic shock protocol', 'Blood culture, urine culture, LP if stable', 'Meropenem + Vancomycin IV', 'Fluid resuscitation', 'ICU escalation', 'Inform attending physician STAT'],
};

export default function PatientDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getPatient } = usePatientCtx();
  const p = getPatient(id);

  if (!p) return (
    <div className="text-center py-20 text-neo-muted">
      <p>Patient not found.</p>
      <button onClick={() => nav('/')} className="btn-ghost mt-4 mx-auto">← Back</button>
    </div>
  );

  const prob = p.probability ?? 0;
  const risk = p._risk;
  const recs = RECS[risk?.tier ?? 0];

  // Feature importance bars
  const featureData = Object.entries(WEIGHTS)
    .filter(([k]) => {
      if (['enr_crp_val', 'enr_tlc_val', 'ga', 'bw', 'age_onset'].includes(k)) return true;
      return p[k] === 1;
    })
    .map(([k, w]) => ({
      name: SIGN_LABELS[k] || k.replace('enr_', '').toUpperCase(),
      importance: +(w * (p[k] ? 1 : 0.4) * 100).toFixed(0),
      positive: !!p[k],
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button>
        <div>
          <h1 className="text-lg font-bold text-neo-text flex items-center gap-2">
            <Baby className="w-5 h-5 text-neo-cyan" />
            Patient {p.patient_name || `PT-${p.id.slice(-4)}`}
          </h1>
          <p className="text-xs text-neo-muted font-mono">{new Date(p.createdAt).toLocaleString()}</p>
        </div>
        <div className="ml-auto"><RiskBadge label={risk?.label ?? 'Low'} size="lg" /></div>
      </div>

      {/* Gauge + vitals */}
      <div className="glass rounded-xl p-5 border border-neo-border flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center">
          <RiskGauge probability={prob} size={180} />
          <p className="text-xs text-neo-muted mt-1 font-mono">SEPSIS PROBABILITY</p>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[
            ['GA', `${p.ga} wk`], ['Birth Weight', `${p.bw} g`],
            ['Age at Onset', `${p.age_onset} hr`],
            ['CRP', `${p.enr_crp_val} mg/L`], ['TLC', `${p.enr_tlc_val} ×10³`],
          ].map(([l, v]) => (
            <div key={l} className="bg-neo-surface rounded-lg p-3">
              <p className="text-xs text-neo-muted">{l}</p>
              <p className="text-sm font-bold font-mono text-neo-cyan mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature importance */}
      <div className="glass rounded-xl p-5 border border-neo-border">
        <p className="section-header"><Activity className="w-3.5 h-3.5" />Feature Importance (SHAP-style)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={featureData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={110} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 11 }}
              formatter={v => [`${v}`, 'Importance']}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {featureData.map((e, i) => (
                <Cell key={i} fill={e.positive ? '#00e5ff' : '#1e2d45'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-neo-muted mt-2">Cyan = positive finding. Based on clinical feature weights.</p>
      </div>

      {/* Clinical signs */}
      <div className="glass rounded-xl p-5 border border-neo-border">
        <p className="section-header"><Clipboard className="w-3.5 h-3.5" />Clinical Signs</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SIGN_LABELS).map(([k, l]) => (
            <div key={k} className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2
                                     ${p[k] === 1 ? 'bg-neo-orange/10 text-neo-orange' : 'bg-neo-surface text-neo-muted'}`}>
              {p[k] === 1
                ? <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                : <CheckCircle  className="w-3 h-3 flex-shrink-0 text-neo-muted/30" />}
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className={`glass rounded-xl p-5 border
                       ${risk?.tier >= 3 ? 'border-neo-red/40' :
                         risk?.tier >= 2 ? 'border-neo-orange/40' :
                         risk?.tier >= 1 ? 'border-neo-yellow/40' : 'border-neo-green/40'}`}>
        <p className="section-header"><AlertTriangle className="w-3.5 h-3.5" />Clinical Recommendations</p>
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-neo-text">
              <span className="text-neo-cyan mt-0.5 flex-shrink-0">›</span>
              {r}
            </li>
          ))}
        </ul>
        <p className="text-xs text-neo-muted mt-4 border-t border-neo-border pt-3">
          ⚕ These recommendations are AI-generated decision support only. Clinical judgment must always prevail.
        </p>
      </div>
    </div>
  );
}
