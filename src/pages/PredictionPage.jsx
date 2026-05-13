import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Zap, CheckCircle, AlertTriangle,
  Loader, RefreshCw, Info
} from 'lucide-react';
import { usePredict } from '../hooks/usePredict';
import { usePatientCtx } from '../app';
import { RiskGauge, RiskBadge } from '../components/RiskGauge';

// ─── Field definitions ──────────────────────────────────────────────────────
const BINARY_FIELDS = [
  { key: 'enr_leth',   label: 'Lethargy' },
  { key: 'enr_cry',    label: 'Abnormal Cry' },
  { key: 'enr_refl',   label: 'Poor Reflexes' },
  { key: 'enr_fever',  label: 'Fever' },
  { key: 'enr_tachyc', label: 'Tachycardia' },
  { key: 'enr_tachyp', label: 'Tachypnoea' },
  { key: 'enr_apn',    label: 'Apnoea' },
  { key: 'enr_retr',   label: 'Retractions' },
  { key: 'enr_cyan',   label: 'Cyanosis' },
  { key: 'enr_abd',    label: 'Abdominal Distension' },
  { key: 'enr_puls',   label: 'Poor Pulses' },
  { key: 'enr_hi_cry', label: 'High-pitched Cry' },
  { key: 'enr_cxr',    label: 'Abnormal CXR' },
  { key: 'enr_fio2',   label: 'Supplemental FiO2' },
];

const STEPS = ['Patient Info', 'Clinical Signs', 'Lab Values', 'Review'];

const DEFAULT_FORM = {
   patient_name: '', ga: '', bw: '', age_onset: '',
  enr_leth: 0, enr_cry: 0, enr_refl: 0, enr_fever: 0,
  enr_tachyc: 0, enr_tachyp: 0, enr_apn: 0, enr_retr: 0,
  enr_cyan: 0, enr_abd: 0, enr_puls: 0, enr_hi_cry: 0,
  enr_cxr: 0, enr_fio2: 0,
  enr_crp_val: '', enr_tlc_val: '',
};

// ─── Toggle button ───────────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === 1 ? 0 : 1)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-sm transition-all duration-200
                  ${value === 1
                    ? 'bg-neo-cyan/10 border-neo-cyan/40 text-neo-cyan'
                    : 'bg-neo-surface border-neo-border text-neo-muted hover:border-neo-border/80'}`}
    >
      <span>{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors relative ${value ? 'bg-neo-cyan' : 'bg-neo-border'}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

export default function PredictionPage() {
  const nav = useNavigate();
  const [step,   setStep]   = useState(0);
  const [form,   setForm]   = useState(DEFAULT_FORM);
  const { run, loading, coldStart, result, error, reset } = usePredict();
  const { addPatient } = usePatientCtx();

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canAdvance = () => {
    if (step === 0) return form.ga !== '' && form.bw !== '' && form.age_onset !== '';
    if (step === 2) return form.enr_crp_val !== '' && form.enr_tlc_val !== '';
    return true;
  };

  const submit = async () => {
    const payload = {
      ga:          +form.ga,
      bw:          +form.bw,
      age_onset:   +form.age_onset,
      enr_leth:    form.enr_leth,
      enr_cry:     form.enr_cry,
      enr_refl:    form.enr_refl,
      enr_fever:   form.enr_fever,
      enr_tachyc:  form.enr_tachyc,
      enr_tachyp:  form.enr_tachyp,
      enr_apn:     form.enr_apn,
      enr_retr:    form.enr_retr,
      enr_cyan:    form.enr_cyan,
      enr_abd:     form.enr_abd,
      enr_puls:    form.enr_puls,
      enr_hi_cry:  form.enr_hi_cry,
      enr_cxr:     form.enr_cxr,
      enr_fio2:    form.enr_fio2,
      enr_crp_val: +form.enr_crp_val,
      enr_tlc_val: +form.enr_tlc_val,
    };
    const res = await run(payload);
    if (res) {

  const fixedRes = {
    ...res,
    probability:
      res.probability ??
      res.sepsis_probability ??
      res.risk_probability ??
      0
  };

  addPatient(form, fixedRes);
}
  };

  const startOver = () => { reset(); setForm(DEFAULT_FORM); setStep(0); };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (result) {
    const prob =
  result.probability ??
  result.sepsis_probability ??
  result.risk_probability ??
  0;
    const risk = result._risk;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto space-y-6">
        <div className={`glass rounded-2xl p-6 border-2 text-center
          ${risk.color === 'red' ? 'border-neo-red/40' :
            risk.color === 'orange' ? 'border-neo-orange/40' :
            risk.color === 'yellow' ? 'border-neo-yellow/40' : 'border-neo-green/40'}`}>
          <p className="text-xs uppercase tracking-widest text-neo-muted mb-4 font-mono">Prediction Result</p>
          <div className="flex justify-center mb-2">
            <RiskGauge probability={prob} size={200} />
          </div>
          <RiskBadge label={risk.label} size="lg" />
          <p className="mt-4 text-3xl font-bold font-mono neon-text-cyan">{(prob * 100).toFixed(2)}%</p>
          <p className="text-sm text-neo-muted mt-1">Sepsis Probability</p>

          {risk.tier >= 2 && (
            <div className="mt-4 p-3 bg-neo-red/10 border border-neo-red/30 rounded-lg text-sm text-neo-red text-left">
              <AlertTriangle className="inline w-4 h-4 mr-1" />
              <strong>Clinical Alert:</strong> Elevated sepsis risk detected. Consider blood culture, IV antibiotics, and escalated monitoring.
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={startOver}   className="btn-ghost flex-1 text-xs"><RefreshCw className="w-3.5 h-3.5" />New Patient</button>
          <button onClick={() => nav('/')} className="btn-primary flex-1 text-xs">View Dashboard</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-1">
            <div className={`flex-1 h-0.5 rounded-full transition-colors ${i <= step ? 'bg-neo-cyan' : 'bg-neo-border'} ${i === 0 ? 'hidden' : ''}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all
                             ${i < step ? 'bg-neo-cyan text-neo-bg' : i === step ? 'border-2 border-neo-cyan text-neo-cyan' : 'border border-neo-border text-neo-muted'}`}>
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-base font-semibold text-neo-text">{STEPS[step]}</h2>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

          {/* STEP 0 — Patient Info */}
{step === 0 && (
  <div className="glass rounded-xl p-5 border border-neo-border space-y-4">

    <div>
      <label className="form-label">Patient Name</label>

      <input
        type="text"
        className="form-input"
        placeholder="Enter patient name"
        value={form.patient_name}
        onChange={e => setField('patient_name', e.target.value)}
      />
    </div>

    {[
      {
        key: 'ga',
        label: 'Gestational Age (weeks)',
        placeholder: '28 – 42',
        min: 22,
        max: 44
      },

      {
        key: 'bw',
        label: 'Birth Weight (grams)',
        placeholder: '500 – 5000',
        min: 300,
        max: 6000
      },

      {
        key: 'age_onset',
        label: 'Age at Onset (hours)',
        placeholder: '0 – 720',
        min: 0,
        max: 720
      },

    ].map(({ key, label, placeholder, min, max }) => (

      <div key={key}>
        <label className="form-label">
          {label}
        </label>

        <input
          type="number"
          min={min}
          max={max}
          step="any"
          className="form-input"
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setField(key, e.target.value)}
        />
      </div>

    ))}

  </div>
)}
          {/* STEP 1 — Clinical Signs */}
          {step === 1 && (
            <div className="glass rounded-xl p-5 border border-neo-border space-y-2">
              <p className="text-xs text-neo-muted flex items-center gap-1 mb-3">
                <Info className="w-3.5 h-3.5" /> Toggle all signs present at enrollment
              </p>
              {BINARY_FIELDS.map(({ key, label }) => (
                <Toggle key={key} label={label} value={form[key]} onChange={v => setField(key, v)} />
              ))}
            </div>
          )}

          {/* STEP 2 — Lab Values */}
          {step === 2 && (
            <div className="glass rounded-xl p-5 border border-neo-border space-y-4">
              <div>
                <label className="form-label">CRP (mg/L) — C-Reactive Protein</label>
                <input type="number" min="0" step="0.1" className="form-input" placeholder="e.g. 48.5"
                  value={form.enr_crp_val} onChange={e => setField('enr_crp_val', e.target.value)} />
              </div>
              <div>
                <label className="form-label">TLC (×10³/µL) — Total Leukocyte Count</label>
                <input type="number" min="0" step="0.1" className="form-input" placeholder="e.g. 14.2"
                  value={form.enr_tlc_val} onChange={e => setField('enr_tlc_val', e.target.value)} />
              </div>
              <div className="p-3 bg-neo-surface/60 rounded-lg border border-neo-border text-xs text-neo-muted">
                <p>Normal ranges — CRP: &lt;10 mg/L · TLC: 5–20 ×10³/µL (neonates)</p>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="glass rounded-xl p-5 border border-neo-border space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[
                  ['GA', `${form.ga} wk`],
                  ['BW', `${form.bw} g`],
                  ['Age Onset', `${form.age_onset} hr`],
                  ['CRP', `${form.enr_crp_val} mg/L`],
                  ['TLC', `${form.enr_tlc_val} ×10³`],
                ].map(([l, v]) => (
                  <div key={l} className="glass rounded-lg p-2 text-center">
                    <p className="text-neo-muted text-xs mb-0.5">{l}</p>
                    <p className="font-mono font-semibold text-neo-cyan text-xs">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-neo-muted mb-2">Positive Clinical Signs</p>
                <div className="flex flex-wrap gap-1.5">
                  {BINARY_FIELDS.filter(f => form[f.key] === 1).map(f => (
                    <span key={f.key} className="text-xs bg-neo-orange/10 border border-neo-orange/30 text-neo-orange px-2 py-0.5 rounded-full">{f.label}</span>
                  ))}
                  {BINARY_FIELDS.every(f => form[f.key] === 0) && (
                    <span className="text-xs text-neo-muted">None</span>
                  )}
                </div>
              </div>

              {/* Cold start notice */}
              {coldStart && loading && (
                <div className="p-3 bg-neo-yellow/10 border border-neo-yellow/30 rounded-lg text-xs text-neo-yellow flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin flex-shrink-0" />
                  Server is waking up from sleep — this may take 30–60 seconds…
                </div>
              )}

              {error && (
                <div className="p-3 bg-neo-red/10 border border-neo-red/30 rounded-lg text-xs text-neo-red">
                  <AlertTriangle className="inline w-3.5 h-3.5 mr-1" />
                  {error}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex-1" disabled={loading}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()} className="btn-primary flex-1">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={loading} className="btn-primary flex-1">
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analysing…</> : <><Zap className="w-4 h-4" /> Run Prediction</>}
          </button>
        )}
      </div>
    </div>
  );
}
