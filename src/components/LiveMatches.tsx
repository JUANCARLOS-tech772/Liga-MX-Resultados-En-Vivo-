import React, { useState } from 'react';
import { Radio, Clock, Shield, Flame, Activity, ChevronRight, AlertCircle, Calendar, Trophy, Sparkles, Bell, BellOff } from 'lucide-react';
import { Match, Team } from '../types';
import { TEAMS_DATA } from '../teamsData';
import { isMatchNotificationEnabled, toggleMatchNotification } from '../services/notifications';

interface LiveMatchesProps {
  matches: Match[];
  teams?: Record<string, Team>;
  onSelectMatch: (match: Match) => void;
  onEditTeamBadge?: (teamId: string) => void;
}

export const LiveMatches: React.FC<LiveMatchesProps> = ({ matches, teams, onSelectMatch, onEditTeamBadge }) => {
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'SCHEDULED'>('ALL');
  const [selectedJornada, setSelectedJornada] = useState<number | 'ALL' | 'LIGUILLA'>(1);
  const [, setPrefsUpdated] = useState(0);
  const teamsMap = teams || TEAMS_DATA;

  const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'HALFTIME');

  // Filter by status & jornada
  const filteredMatches = matches.filter((m) => {
    // Status filter
    if (filter === 'LIVE' && m.status !== 'LIVE' && m.status !== 'HALFTIME') return false;
    if (filter === 'FINISHED' && m.status !== 'FINISHED') return false;
    if (filter === 'SCHEDULED' && m.status !== 'SCHEDULED') return false;

    // Jornada filter
    if (selectedJornada === 'ALL') return true;
    if (selectedJornada === 'LIGUILLA') return m.jornada >= 18;
    return m.jornada === selectedJornada;
  });

  return (
    <div className="space-y-6">
      {/* Live Highlights Banner if any live match */}
      {liveMatches.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-emerald-400" />
                {liveMatches.length} {liveMatches.length === 1 ? 'Partido En Juego' : 'Partidos En Juego'}
              </h2>
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Control Maestro en Directo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveMatches.map((m) => {
              const home = teamsMap[m.homeTeamId] || TEAMS_DATA[m.homeTeamId];
              const away = teamsMap[m.awayTeamId] || TEAMS_DATA[m.awayTeamId];
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m)}
                  className="bg-slate-950/70 border border-emerald-500/30 hover:border-emerald-400/80 rounded-xl p-3.5 cursor-pointer transition hover:bg-slate-900 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" />
                      {m.period} • {m.minute}'
                    </span>
                    <span className="truncate max-w-[140px] text-[11px]">{m.stadium}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img
                        src={home?.badgeUrl || '/teams/tbd.svg'}
                        alt={home?.name}
                        className="w-7 h-7 object-contain group-hover:scale-110 transition"
                      />
                      <span className="font-bold text-sm text-white truncate">{home?.name || 'Por Confirmar'}</span>
                    </div>

                    <div className="px-3 py-1 bg-slate-900 rounded-lg font-mono font-black text-lg text-emerald-400 border border-slate-800">
                      {m.homeScore} - {m.awayScore}
                    </div>

                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="font-bold text-sm text-white truncate text-right">{away?.name || 'Por Confirmar'}</span>
                      <img
                        src={away?.badgeUrl || '/teams/tbd.svg'}
                        alt={away?.name}
                        className="w-7 h-7 object-contain group-hover:scale-110 transition"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Jornada & Liguilla Carousel Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Calendario Oficial Apertura 2026</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">17 Jornadas + Liguilla</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedJornada('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedJornada === 'ALL'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80 hover:bg-slate-800'
            }`}
          >
            Todas
          </button>

          {Array.from({ length: 17 }, (_, i) => i + 1).map((jNum) => (
            <button
              key={jNum}
              onClick={() => setSelectedJornada(jNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedJornada === jNum
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80 hover:bg-slate-800'
              }`}
            >
              J{jNum}
            </button>
          ))}

          <button
            onClick={() => setSelectedJornada('LIGUILLA')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1.5 ${
              selectedJornada === 'LIGUILLA'
                ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Liguilla (CF, SF, Final)</span>
          </button>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos ({matches.length})
          </button>
          <button
            onClick={() => setFilter('LIVE')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              filter === 'LIVE'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            En Vivo ({liveMatches.length})
          </button>
          <button
            onClick={() => setFilter('SCHEDULED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'SCHEDULED' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por Jugar
          </button>
          <button
            onClick={() => setFilter('FINISHED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              filter === 'FINISHED' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Finalizados
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Mostrando <strong className="text-white">{filteredMatches.length}</strong> partidos
        </div>
      </div>

      {/* Liguilla Notice if selected */}
      {selectedJornada === 'LIGUILLA' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Fase Final (Liguilla Apertura 2026):</strong> Los espacios de Cuartos de Final, Semifinales y Gran Final están abiertos para que coloques los clasificados y marcadores desde el Panel de Administración.
            </span>
          </div>
        </div>
      )}

      {/* Match Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-900/30 rounded-2xl border border-slate-800">
            No hay partidos con el filtro seleccionado.
          </div>
        ) : (
          filteredMatches.map((m) => {
            const home = teamsMap[m.homeTeamId] || TEAMS_DATA[m.homeTeamId];
            const away = teamsMap[m.awayTeamId] || TEAMS_DATA[m.awayTeamId];
            const isLive = m.status === 'LIVE' || m.status === 'HALFTIME';
            const isFinished = m.status === 'FINISHED';
            const isLiguilla = m.jornada >= 18;

            return (
              <div
                key={m.id}
                onClick={() => onSelectMatch(m)}
                className={`p-4 rounded-2xl border transition cursor-pointer hover:scale-[1.01] flex flex-col justify-between group relative overflow-hidden ${
                  isLive
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : isLiguilla
                    ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400/60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Card Header: Jornada / Stage, Date, Status */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    {isLiguilla ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                        {m.period}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                        Jornada {m.jornada}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-medium">{m.date} • {m.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        {m.period} {m.minute}'
                      </span>
                    )}
                    {isFinished && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                        Finalizado
                      </span>
                    )}
                    {!isLive && !isFinished && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {m.time}
                      </span>
                    )}

                    {/* Quick Bell Alert Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMatchNotification(m.id, m.homeTeamId, m.awayTeamId);
                        setPrefsUpdated(Date.now());
                      }}
                      className={`p-1 rounded-lg border transition cursor-pointer ${
                        isMatchNotificationEnabled(m.id, m.homeTeamId, m.awayTeamId)
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                      title={
                        isMatchNotificationEnabled(m.id, m.homeTeamId, m.awayTeamId)
                          ? 'Alertas de gol activadas para este partido'
                          : 'Haz clic para activar alertas de gol para este partido'
                      }
                    >
                      {isMatchNotificationEnabled(m.id, m.homeTeamId, m.awayTeamId) ? (
                        <Bell className="w-3.5 h-3.5" />
                      ) : (
                        <BellOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Teams & Score Grid */}
                <div className="space-y-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditTeamBadge && home?.id) onEditTeamBadge(home.id);
                        }}
                        className="w-8 h-8 p-0.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500 flex items-center justify-center shrink-0 transition"
                        title="Clic para cambiar escudo"
                      >
                        <img
                          src={home?.badgeUrl || '/teams/tbd.svg'}
                          alt={home?.name}
                          className="w-full h-full object-contain"
                        />
                      </button>
                      <span className="font-bold text-sm text-white truncate">{home?.name || 'Por Confirmar'}</span>
                    </div>

                    <span
                      className={`text-xl font-mono font-black px-2.5 py-0.5 rounded-lg ${
                        isLive
                          ? 'text-emerald-400 bg-slate-950 border border-emerald-500/30'
                          : isFinished
                          ? 'text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      {isLive || isFinished ? m.homeScore : '-'}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditTeamBadge && away?.id) onEditTeamBadge(away.id);
                        }}
                        className="w-8 h-8 p-0.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500 flex items-center justify-center shrink-0 transition"
                        title="Clic para cambiar escudo"
                      >
                        <img
                          src={away?.badgeUrl || '/teams/tbd.svg'}
                          alt={away?.name}
                          className="w-full h-full object-contain"
                        />
                      </button>
                      <span className="font-bold text-sm text-white truncate">{away?.name || 'Por Confirmar'}</span>
                    </div>

                    <span
                      className={`text-xl font-mono font-black px-2.5 py-0.5 rounded-lg ${
                        isLive
                          ? 'text-emerald-400 bg-slate-950 border border-emerald-500/30'
                          : isFinished
                          ? 'text-white'
                          : 'text-slate-600'
                      }`}
                    >
                      {isLive || isFinished ? m.awayScore : '-'}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Stadium & Quick Action */}
                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[240px]">{m.stadium}</span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition font-semibold">
                    <span>Detalles</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
