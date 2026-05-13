import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Zap, Bell, Settings, Activity, AlertTriangle
} from 'lucide-react';
import { usePatientCtx } from '../App';
import InstallPrompt from './InstallPrompt';

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predict',  icon: Zap,             label: 'Predict'   },
  { to: '/alerts',   icon: Bell,            label: 'Alerts'    },
  { to: '/settings', icon: Settings,        label: 'Settings'  },
];

export default function Layout() {
  const { highRisk } = usePatientCtx();
  const { pathname }  = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-neo-bg">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 glass border-b border-neo-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="w-6 h-6 text-neo-cyan" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-neo-green rounded-full animate-pulse" />
            </div>
            <div>
              <span className="font-mono font-bold text-sm neon-text-cyan tracking-widest">NEOSEPSIS</span>
              <span className="ml-1 text-neo-muted text-xs">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-neo-muted font-mono">
            <span className="hidden sm:block">ICU CLINICAL DECISION SUPPORT</span>
            {highRisk.length > 0 && (
              <span className="flex items-center gap-1 text-neo-red animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {highRisk.length} CRITICAL
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main + Sidebar layout (desktop) ── */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto px-0 sm:px-4 pb-20 sm:pb-0">
        {/* Desktop sidebar */}
        <nav className="hidden sm:flex flex-col w-56 pt-6 pr-4 gap-1 flex-shrink-0">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group
                 ${isActive
                   ? 'bg-neo-cyan/10 text-neo-cyan border border-neo-cyan/20'
                   : 'text-neo-muted hover:text-neo-text hover:bg-white/5 border border-transparent'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neo-cyan' : 'group-hover:text-neo-cyan/70'}`} />
                  <span className="font-medium">{label}</span>
                  {label === 'Alerts' && highRisk.length > 0 && (
                    <span className="ml-auto text-xs bg-neo-red/20 text-neo-red px-1.5 py-0.5 rounded-full">
                      {highRisk.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 min-w-0 pt-4 sm:pt-6 px-4 sm:px-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 glass border-t border-neo-border">
        <div className="flex justify-around h-16">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-1 text-xs transition-colors
                 ${isActive ? 'text-neo-cyan' : 'text-neo-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-neo-cyan' : ''}`} />
                    {label === 'Alerts' && highRisk.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[9px] flex items-center justify-center bg-neo-red rounded-full text-white font-bold">
                        {highRisk.length}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  );
}
