import React from 'react';
import { X, Shield } from 'lucide-react';
import { BadgeManager } from './BadgeManager';
import { Team } from '../types';

interface BadgeModalProps {
  isOpen: boolean;
  teamId?: string;
  teams: Record<string, Team>;
  onClose: () => void;
  onBadgeUpdated?: (teamId: string, newBadgeUrl: string) => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  teamId = 'america',
  teams,
  onClose,
  onBadgeUpdated
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-white space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personalizador de Escudos Oficiales</h3>
              <p className="text-xs text-slate-400">Modifica, sube o elige escudos en alta resolución</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <BadgeManager
          teams={teams}
          initialTeamId={teamId}
          onBadgeUpdated={(id, url) => {
            if (onBadgeUpdated) onBadgeUpdated(id, url);
          }}
        />
      </div>
    </div>
  );
};
