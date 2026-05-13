/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neo: {
          bg:      '#0a0f1e',
          surface: '#0f172a',
          card:    '#111827',
          border:  '#1e2d45',
          cyan:    '#00e5ff',
          teal:    '#14b8a6',
          green:   '#22c55e',
          yellow:  '#eab308',
          orange:  '#f97316',
          red:     '#ef4444',
          purple:  '#a855f7',
          text:    '#e2e8f0',
          muted:   '#64748b',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(0,229,255,0.15) 0%, transparent 70%)',
        'glow-red':  'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'scan':       'scan 4s linear infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px rgba(0,229,255,0.3), 0 0 10px rgba(0,229,255,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(0,229,255,0.6), 0 0 40px rgba(0,229,255,0.2)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      },
      backdropBlur: { xs: '2px' }
    }
  },
  plugins: []
};
