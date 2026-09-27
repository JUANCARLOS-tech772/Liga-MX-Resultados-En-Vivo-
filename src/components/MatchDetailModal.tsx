import React from 'react';
import { X, Clock, MapPin, Radio, Shield, Activity, Calendar } from 'lucide-react';
import { Team, Match } from '../types';
import { TEAMS_DATA } from '../teamsData';

interface MatchDetailModalProps {
  match: Match | null;
  teams?: Record<string, Team>;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, teams, onClose }) => {
  if (!match) return null;

  const teamsMap = teams || TEAMS_DATA;
  const home = teamsMap[match.homeTeamId] || TEAMS_DATA[match.homeTeamId] || TEAMS_DATA['tbd'];
  const away = teamsMap[match.awayTeamId] || TEAMS_DATA[match.awayTeamId] || TEAMS_DATA['tbd'];
  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative">
        {/* Header with Close */}
        <div className="sticky top-0 bg-slate-900/90 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Jornada {match.jornada} • {match.date} {match.time}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Scoreboard Banner */}
        <div className="p-6 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 text-center">
          <div className="mb-3">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {match.status === 'HALFTIME' ? 'MEDIO TIEMPO' : `${match.minute}'`} ({match.period})
              </span>
            ) : match.status === 'FINISHED' ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                FINALIZADO
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-slate-400">
                POR INICIAR ({match.time})
              </span>
            )}
          </div>

          <div className="grid grid-cols-7 items-center gap-2">
            {/* Local */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 p-2 flex items-center justify-center border border-slate-700 shadow-md mb-2">
                <img
                  src={home?.badgeUrl}
                  alt={home?.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = home?.fallbackBadge || '';
                  }}
                />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px]">
                {home?.name}
              </h3>
              <p className="text-[11px] text-slate-400">{home?.city}</p>
            </div>

            {/* Score */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {match.status === 'SCHEDULED' ? (
                <span className="text-xl font-bold text-slate-500">VS</span>
              ) : (
                <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">
                  {match.homeScore} - {match.awayScore}
                </span>
              )}
            </div>

            {/* Visitante */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 p-2 flex items-center justify-center border border-slate-700 shadow-md mb-2">
                <img
                  src={away?.badgeUrl}
                  alt={away?.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = away?.fallbackBadge || '';
                  }}
                />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px]">
                {away?.name}
              </h3>
              <p className="text-[11px] text-slate-400">{away?.city}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{match.stadium}</span>
          </div>
        </div>

        {/* Content: Events Timeline & Match Stats */}
        <div className="p-6 space-y-6">
          {/* Events Timeline */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Incidencias del Partido
            </h4>

            {match.events && match.events.length > 0 ? (
              <div className="space-y-2.5">
                {match.events.map((ev) => {
                  const evTeam = TEAMS_DATA[ev.teamId];
                  const isHomeEvent = ev.teamId === match.homeTeamId;

                  return (
                    <div
                      key={ev.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs ${
                        isHomeEvent
                          ? 'bg-slate-950/70 border-slate-800'
                          : 'bg-slate-950/70 border-slate-800 flex-row-reverse'
                      }`}
                    >
                      <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                        {ev.minute}'
                      </span>
                      <span className="text-base">{ev.type === 'goal' ? '⚽' : ev.type === 'yellow_card' ? '🟨' : '🟥'}</span>
                      <div className={`flex-1 ${isHomeEvent ? 'text-left' : 'text-right'}`}>
                        <p className="font-bold text-white">{ev.player}</p>
                        {ev.detail && <p className="text-[10px] text-slate-400">{ev.detail}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 bg-slate-950/50 rounded-xl border border-slate-800/60">
                Sin incidencias registradas por el momento.
              </p>
            )}
          </div>

          {/* Match Stats */}
          {match.stats && (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Estadísticas del Encuentro
              </h4>

              {/* Posesión */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>{match.stats.homePossession}%</span>
                  <span className="text-slate-500 font-normal">Posesión</span>
                  <span>{match.stats.awayPossession}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${match.stats.homePossession}%` }}
                  />
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${match.stats.awayPossession}%` }}
                  />
                </div>
              </div>

              {/* Tiros */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 text-slate-300">
                <span className="font-mono font-bold">{match.stats.homeShots}</span>
                <span className="text-slate-400">Tiros Totales</span>
                <span className="font-mono font-bold">{match.stats.awayShots}</span>
              </div>

              {/* Tiros al Arco */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 text-slate-300">
                <span className="font-mono font-bold">{match.stats.homeShotsOnTarget}</span>
                <span className="text-slate-400">Tiros a Puerta</span>
                <span className="font-mono font-bold">{match.stats.awayShotsOnTarget}</span>
              </div>

              {/* Tiros de Esquina */}
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 text-slate-300">
                <span className="font-mono font-bold">{match.stats.homeCorners}</span>
                <span className="text-slate-400">Tiros de Esquina</span>
                <span className="font-mono font-bold">{match.stats.awayCorners}</span>
              </div>

              {/* Faltas */}
              <div className="flex items-center justify-between text-xs py-1.5 text-slate-300">
                <span className="font-mono font-bold">{match.stats.homeFouls}</span>
                <span className="text-slate-400">Faltas Cometidas</span>
                <span className="font-mono font-bold">{match.stats.awayFouls}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
