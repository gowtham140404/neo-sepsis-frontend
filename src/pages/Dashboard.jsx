import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, CheckCircle, Activity, Zap, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { usePatientCtx } from '../app';
import PatientCard from '../components/PatientCard';

const STAT_COLORS = [
  { label: 'Low',       color: '#22c55e', key: 'low' },
  { label: 'Moderate',  color: '#eab308', key: 'moderate' },
  { label: 'High',      color: '#f97316', key: 'high' },
  { label: 'Very High', color: '#ef4444', key: 'veryHigh' },
];

export default function Dashboard() {
  const nav = useNavigate();
  const { patients, removePatient, stats } = usePatientCtx();

  // Build trend data from last 10 patients
  const trend = [...patients].reverse().slice(-10).map((p, i) => ({
    name: `#${i + 1}`,
    prob: +(p.probability * 100).toFixed(1)
  }));

  const pieData = STAT_COLORS.map(c => ({ name: c.label, value: stats[c.key], color: c.color }))
                              .filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neo-text">ICU Overview</h1>
          <p className="text-xs text-neo-muted mt-0.5 font-mono">
            {new Date().toLocaleString()} · NEONATAL SEPSIS MONITORING
          </p>
        </div>
        <button onClick={() => nav('/predict')} className="btn-primary text-xs py-2 px-4">
          <Zap className="w-3.5 h-3.5" />
          New Prediction
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Patients', value: stats.total, icon: Users,         color: 'text-neo-cyan' },
          { label: 'Critical',       value: stats.veryHigh + stats.high, icon: AlertTriangle, color: 'text-neo-red' },
          { label: 'Low Risk',       value: stats.low,   icon: CheckCircle,   color: 'text-neo-green' },
          { label: 'Moderate',       value: stats.moderate, icon: Activity,   color: 'text-neo-yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} whileHover={{ scale: 1.02 }}
            className="glass rounded-xl p-4 border border-neo-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neo-muted">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      {patients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Trend chart */}
          <div className="glass rounded-xl p-4 border border-neo-border sm:col-span-2">
            <p className="section-header"><TrendingUp className="w-3.5 h-3.5" />Risk Trend</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, fontSize: 11 }}
                  formatter={v => [`${v}%`, 'Probability']}
                />
                <Area type="monotone" dataKey="prob" stroke="#00e5ff" strokeWidth={2} fill="url(#probGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribution pie */}
          <div className="glass rounded-xl p-4 border border-neo-border">
            <p className="section-header"><Activity className="w-3.5 h-3.5" />Distribution</p>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={44}
                         dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-neo-muted">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-mono text-neo-text">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-24 text-neo-muted text-xs">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Patient list */}
      <div>
        <p className="section-header">
          <Users className="w-3.5 h-3.5" />
          Recent Patients
          <span className="ml-auto font-mono text-neo-text">{patients.length}</span>
        </p>

        {patients.length === 0 ? (
          <div className="glass rounded-xl border border-neo-border border-dashed p-12 text-center">
            <Activity className="w-10 h-10 text-neo-cyan/30 mx-auto mb-3" />
            <p className="text-neo-muted text-sm">No patients yet</p>
            <p className="text-neo-muted/60 text-xs mt-1">Run your first prediction to populate the dashboard</p>
            <button onClick={() => nav('/predict')} className="btn-primary mt-4 mx-auto text-xs py-2">
              <Zap className="w-3.5 h-3.5" /> Start Predicting
            </button>
          </div>
        ) : (
          <div className="icu-grid">
            {patients.map((p, i) => (
              <PatientCard key={p.id} patient={p} onRemove={removePatient} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
