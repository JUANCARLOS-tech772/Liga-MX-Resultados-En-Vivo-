import React, { useState } from 'react';
import { Shield, MapPin, Calendar, Search, Edit3, X, Sparkles } from 'lucide-react';
import { Team } from '../types';
import { BadgeManager } from './BadgeManager';
import { BadgeModal } from './BadgeModal';

interface TeamsGridProps {
  teams: Record<string, Team>;
  onBadgeUpdated?: (teamId: string, newBadgeUrl: string) => void;
}

export const TeamsGrid: React.FC<TeamsGridProps> = ({ teams, onBadgeUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [modalTeamId, setModalTeamId] = useState<string | null>(null);

  const teamList = Object.values(teams);

  const filteredTeams = teamList.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              18 Clubes Oficiales de la Liga MX
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Sustitución estricta de Atlante FC. Puedes personalizar, subir o cambiar el escudo oficial de cualquier club.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Botón para cambiar escudos directamente */}
          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 shrink-0 shadow-md cursor-pointer ${
              isEditorOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-emerald-600/25'
            }`}
          >
            {isEditorOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Ocultar Panel de Escudos</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Cambiar / Subir Escudos</span>
              </>
            )}
          </button>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar club o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Editor Desplegable Integrado */}
      {isEditorOpen && (
        <div className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <BadgeManager
            teams={teams}
            onBadgeUpdated={(teamId, newUrl) => {
              if (onBadgeUpdated) onBadgeUpdated(teamId, newUrl);
            }}
          />
        </div>
      )}

      {/* Grid of 18 Teams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team: Team) => {
          const isAtlante = team.id === 'atlante';

          return (
            <div
              key={team.id}
              className={`p-4 rounded-3xl border transition relative overflow-hidden group shadow-lg ${
                isAtlante
                  ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/50 shadow-amber-950/20'
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {isAtlante && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  Sustitución Oficial
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Crest with glowing frame and click to edit */}
                <div
                  onClick={() => setModalTeamId(team.id)}
                  title="Haz clic para cambiar este escudo"
                  className="w-16 h-16 rounded-2xl bg-slate-800/90 p-2 flex items-center justify-center shrink-0 border border-slate-700/60 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-200 shadow-inner cursor-pointer relative"
                >
                  <img
                    src={team.badgeUrl}
                    alt={team.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = team.fallbackBadge;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit3 className="w-4 h-4 text-emerald-300 drop-shadow" />
                  </div>
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{team.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {team.shortName}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{team.stadium}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {team.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom card details */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Fundación: <strong className="text-slate-200 font-mono">{team.founded}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => setModalTeamId(team.id)}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Cambiar escudo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de edición rápida al hacer clic en cualquier equipo */}
      {modalTeamId && (
        <BadgeModal
          isOpen={!!modalTeamId}
          teamId={modalTeamId}
          teams={teams}
          onClose={() => setModalTeamId(null)}
          onBadgeUpdated={(id, url) => {
            if (onBadgeUpdated) onBadgeUpdated(id, url);
          }}
        />
      )}
    </div>
  );
};
