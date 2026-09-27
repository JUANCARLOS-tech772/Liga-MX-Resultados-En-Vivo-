import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X } from 'lucide-react';
import { GoalAlertPayload } from '../types';

interface GoalToastProps {
  alert: GoalAlertPayload | null;
  onClose: () => void;
}

export const GoalToast: React.FC<GoalToastProps> = ({ alert, onClose }) => {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.4)] p-4 text-white">
            {/* Ambient animated glow */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              {/* Crest with glowing pulse */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 p-1.5 flex items-center justify-center border border-emerald-500/40 shadow-inner">
                  {alert.badgeUrl ? (
                    <img
                      src={alert.badgeUrl}
                      alt={alert.scoringTeam}
                      className="w-full h-full object-contain filter drop-shadow-md"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">⚽</span>
                  )}
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black items-center justify-center">
                    !
                  </span>
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase border border-emerald-500/40">
                    <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                    EN VIVO
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {alert.minute}'
                  </span>
                </div>
                <h3 className="text-base font-black tracking-tight text-white truncate drop-shadow">
                  {alert.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  {alert.body}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="shrink-0 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom pulsing progress line */}
            <div className="mt-2.5 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 7, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
