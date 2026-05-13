// ── RiskGauge.jsx ────────────────────────────────────────────────────────────
// SVG arc gauge — ICU monitor style
export function RiskGauge({ probability = 0, size = 160 }) {
  const pct  = Math.max(0, Math.min(1, probability));
  const r    = size * 0.38;
  const cx   = size / 2;
  const cy   = size / 2 + 10;
  const startAngle = -210;
  const totalAngle = 240;
  const angle  = startAngle + pct * totalAngle;

  const toXY = (deg, radius) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const arcPath = (from, to, rad) => {
    const s = toXY(from, rad);
    const e = toXY(to,   rad);
    const large = (to - from) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${rad} ${rad} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const color =
    pct < 0.20 ? '#22c55e' :
    pct < 0.50 ? '#eab308' :
    pct < 0.75 ? '#f97316' :
                 '#ef4444';

  const needle = toXY(angle, r * 0.75);

  return (
    <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`}>
      {/* Track */}
      <path d={arcPath(-210, 30, r)} fill="none" stroke="#1e2d45" strokeWidth={size * 0.07} strokeLinecap="round" />
      {/* Fill */}
      <path d={arcPath(-210, angle, r)} fill="none" stroke={color} strokeWidth={size * 0.07} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }} />
      {/* Zone ticks */}
      {[0.20, 0.50, 0.75].map(v => {
        const pt = toXY(startAngle + v * totalAngle, r + size * 0.06);
        return <circle key={v} cx={pt.x} cy={pt.y} r={size * 0.012} fill={color} opacity={0.5} />;
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={color} strokeWidth={2} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <circle cx={cx} cy={cy} r={size * 0.04} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      {/* Labels */}
      <text x={cx} y={cy - r * 0.05} textAnchor="middle" fill={color}
            fontSize={size * 0.13} fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        {(pct * 100).toFixed(1)}%
      </text>
    </svg>
  );
}

// ── RiskBadge.jsx ────────────────────────────────────────────────────────────
const BADGE_MAP = {
  low:       'risk-badge-low',
  moderate:  'risk-badge-moderate',
  high:      'risk-badge-high',
  'very high':'risk-badge-very-high',
};
export function RiskBadge({ label = 'Low', size = 'sm' }) {
  const key = label.toLowerCase();
  const cls = BADGE_MAP[key] || 'risk-badge-low';
  return (
    <span className={`${cls} inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono
                      ${size === 'lg' ? 'text-sm font-semibold px-3 py-1' : 'text-xs'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label.toUpperCase()}
    </span>
  );
}
