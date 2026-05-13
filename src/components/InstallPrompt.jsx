import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [prompt, setPrompt]   = useState(null);
  const [show,   setShow]     = useState(false);
  const [done,   setDone]     = useState(false);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setDone(true);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && !done && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 100, opacity: 0 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="glass-cyan rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neo-cyan/20 border border-neo-cyan/30 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-neo-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neo-text">Install NeoSepsis AI</p>
                <p className="text-xs text-neo-muted">Add to your home screen for offline access</p>
              </div>
              <button onClick={() => setShow(false)} className="text-neo-muted hover:text-neo-text transition-colors flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <button onClick={install} className="btn-primary w-full mt-3 text-xs py-2">
              Install App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
