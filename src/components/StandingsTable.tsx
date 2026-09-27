import React, { useMemo } from 'react';
import { Trophy, Flame, Activity, Radio } from 'lucide-react';
import { LIGA_MX_18_TEAMS, TEAMS_DATA } from '../teamsData';
import { Team, Match, StandingRow } from '../types';

interface StandingsTableProps {
  matches: Match[];
  teams?: Record<string, Team>;
  onEditTeamBadge?: (teamId: string) => void;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ matches, teams, onEditTeamBadge }) => {
  // Cálculo dinámico y en tiempo real de la tabla general
  const { tableData, liveMatchesCount } = useMemo(() => {
    const teamsDict = teams || TEAMS_DATA;
    // Lista de los 18 clubes oficiales
    const officialClubs = LIGA_MX_18_TEAMS.map((t) => teamsDict[t.id] || t);

    // Inicializar estadísticas en 0 para cada club
    const statsMap: Record<
      string,
      {
        pj: number;
        g: number;
        e: number;
        p: number;
        gf: number;
        gc: number;
        liveMatchInfo?: StandingRow['liveMatchInfo'];
        form: ('W' | 'D' | 'L')[];
      }
    > = {};

    officialClubs.forEach((club) => {
      statsMap[club.id] = {
        pj: 0,
        g: 0,
        e: 0,
        p: 0,
        gf: 0,
        gc: 0,
        form: []
      };
    });

    let liveCount = 0;

    // Procesar todos los partidos de la fase regular (J1 a J17)
    matches.forEach((m) => {
      // Ignorar comodines TBD
      if (
        !m.homeTeamId ||
        !m.awayTeamId ||
        m.homeTeamId === 'tbd' ||
        m.homeTeamId === 'por_confirmar' ||
        m.awayTeamId === 'tbd' ||
        m.awayTeamId === 'por_confirmar'
      ) {
        return;
      }

      // Solo partidos de fase regular (Jornadas 1 a 17) cuentan para la tabla general
      if (m.jornada > 17) return;

      const homeStats = statsMap[m.homeTeamId];
      const awayStats = statsMap[m.awayTeamId];

      if (!homeStats || !awayStats) return;

      const homeObj = teamsDict[m.homeTeamId] || TEAMS_DATA[m.homeTeamId];
      const awayObj = teamsDict[m.awayTeamId] || TEAMS_DATA[m.awayTeamId];

      // PARTIDO FINALIZADO
      if (m.status === 'FINISHED') {
        homeStats.pj += 1;
        awayStats.pj += 1;
        homeStats.gf += m.homeScore;
        homeStats.gc += m.awayScore;
        awayStats.gf += m.awayScore;
        awayStats.gc += m.homeScore;

        if (m.homeScore > m.awayScore) {
          homeStats.g += 1;
          awayStats.p += 1;
          homeStats.form.push('W');
          awayStats.form.push('L');
        } else if (m.awayScore > m.homeScore) {
          awayStats.g += 1;
          homeStats.p += 1;
          awayStats.form.push('W');
          homeStats.form.push('L');
        } else {
          homeStats.e += 1;
          awayStats.e += 1;
          homeStats.form.push('D');
          awayStats.form.push('D');
        }
      }

      // PARTIDO EN VIVO O MEDIO TIEMPO (Cálculo dinámico momentáneo)
      if (m.status === 'LIVE' || m.status === 'HALFTIME') {
        liveCount += 1;
        homeStats.pj += 1;
        awayStats.pj += 1;
        homeStats.gf += m.homeScore;
        homeStats.gc += m.awayScore;
        awayStats.gf += m.awayScore;
        awayStats.gc += m.homeScore;

        let homeLivePts = 1;
        let awayLivePts = 1;

        if (m.homeScore > m.awayScore) {
          homeStats.g += 1; // +3 pts momentáneos
          awayStats.p += 1; // 0 pts momentáneos
          homeLivePts = 3;
          awayLivePts = 0;
        } else if (m.awayScore > m.homeScore) {
          awayStats.g += 1; // +3 pts momentáneos
          homeStats.p += 1; // 0 pts momentáneos
          homeLivePts = 0;
          awayLivePts = 3;
        } else {
          homeStats.e += 1; // +1 pt momentáneo
          awayStats.e += 1; // +1 pt momentáneo
          homeLivePts = 1;
          awayLivePts = 1;
        }

        // Información del enfrentamiento en vivo para pintar de rojo
        homeStats.liveMatchInfo = {
          opponentId: m.awayTeamId,
          opponentName: awayObj?.shortName || awayObj?.name || 'Rival',
          opponentBadge: awayObj?.badgeUrl || '/teams/tbd.svg',
          minute: m.minute || 1,
          matchScore: `${m.homeScore} - ${m.awayScore}`,
          isHome: true,
          period: m.status === 'HALFTIME' ? 'Descanso' : m.period || `${m.minute}'`,
          livePointsDelta: homeLivePts
        };

        awayStats.liveMatchInfo = {
          opponentId: m.homeTeamId,
          opponentName: homeObj?.shortName || homeObj?.name || 'Rival',
          opponentBadge: homeObj?.badgeUrl || '/teams/tbd.svg',
          minute: m.minute || 1,
          matchScore: `${m.awayScore} - ${m.homeScore}`,
          isHome: false,
          period: m.status === 'HALFTIME' ? 'Descanso' : m.period || `${m.minute}'`,
          livePointsDelta: awayLivePts
        };
      }
    });

    // Construir filas de la tabla
    const rows: StandingRow[] = officialClubs.map((club) => {
      const stats = statsMap[club.id] || { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, form: [] };
      const pts = stats.g * 3 + stats.e;
      const dg = stats.gf - stats.gc;

      return {
        rank: 1,
        teamId: club.id,
        name: club.name,
        shortName: club.shortName,
        badgeUrl: club.badgeUrl,
        pj: stats.pj,
        g: stats.g,
        e: stats.e,
        p: stats.p,
        gf: stats.gf,
        gc: stats.gc,
        dg,
        pts,
        form: (stats.form.length > 0 ? stats.form.slice(-5) : ['D', 'D', 'D', 'D', 'D']) as any,
        liveMatchInfo: stats.liveMatchInfo
      };
    });

    // Ordenamiento estricto Liga MX:
    // 1. Puntos DESC
    // 2. Diferencia de Goles (DG) DESC
    // 3. Goles a Favor (GF) DESC
    // 4. Menos Goles en Contra (GC) ASC
    // 5. Nombre ASC
    rows.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      if (b.gf !== a.gf) return b.gf - a.gf;
      if (a.gc !== b.gc) return a.gc - b.gc;
      return a.name.localeCompare(b.name);
    });

    const rankedRows = rows.map((r, idx) => ({ ...r, rank: idx + 1 }));

    return { tableData: rankedRows, liveMatchesCount: liveCount };
  }, [matches, teams]);

  return (
    <div className="space-y-4">
      {/* Header and Qualification Zone Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-3xl shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">Tabla General en Vivo • Liga MX</h2>
              {liveMatchesCount > 0 && (
                <span className="flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-md">
                  <Radio className="w-3 h-3 animate-spin" />
                  {liveMatchesCount / 2} Partidos en Juego
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Actualización instantánea: +3 pts por victoria momentánea, +1 pt por empate en vivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-400">Liguilla Directa (1-6)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="font-bold text-blue-400">Play-In (7-10)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <span>Eliminados (11-18)</span>
          </div>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-950/90 text-[11px] text-slate-400 uppercase font-black tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-3 w-12 text-center">#</th>
                <th className="py-3.5 px-3 min-w-[240px]">Club</th>
                <th className="py-3.5 px-2 text-center font-mono">PJ</th>
                <th className="py-3.5 px-2 text-center font-mono">G</th>
                <th className="py-3.5 px-2 text-center font-mono">E</th>
                <th className="py-3.5 px-2 text-center font-mono">P</th>
                <th className="py-3.5 px-2 text-center font-mono hidden sm:table-cell">GF</th>
                <th className="py-3.5 px-2 text-center font-mono hidden sm:table-cell">GC</th>
                <th className="py-3.5 px-2 text-center font-mono">DIF</th>
                <th className="py-3.5 px-3 text-center font-black text-white">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tableData.map((row) => {
                const isLiguilla = row.rank <= 6;
                const isPlayIn = row.rank >= 7 && row.rank <= 10;
                const isAtlante = row.teamId === 'atlante';
                const isLiveNow = Boolean(row.liveMatchInfo);

                return (
                  <tr
                    key={row.teamId}
                    className={`transition duration-150 ${
                      isLiveNow
                        ? 'bg-gradient-to-r from-red-950/50 via-red-900/30 to-red-950/20 border-l-4 border-l-red-500 shadow-md ring-1 ring-red-500/30'
                        : isAtlante
                        ? 'bg-amber-500/5 hover:bg-amber-500/10'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Rank with indicator */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`w-1.5 h-4 rounded-full ${
                            isLiveNow
                              ? 'bg-red-500 animate-pulse'
                              : isLiguilla
                              ? 'bg-emerald-500'
                              : isPlayIn
                              ? 'bg-blue-500'
                              : 'bg-transparent'
                          }`}
                        />
                        <span className="font-black text-slate-300 font-mono text-xs">
                          {row.rank}
                        </span>
                      </div>
                    </td>

                    {/* Team Name, Crest, and Live Match Badge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => {
                            if (onEditTeamBadge) onEditTeamBadge(row.teamId);
                          }}
                          title={onEditTeamBadge ? `Haz clic para cambiar el escudo de ${row.name}` : undefined}
                          className="w-8 h-8 rounded-xl bg-slate-950 p-1 flex items-center justify-center shrink-0 border border-slate-800 hover:border-amber-400 hover:scale-110 transition cursor-pointer shadow-sm"
                        >
                          <img
                            src={row.badgeUrl}
                            alt={row.name}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/teams/tbd.svg';
                            }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-black text-white text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{row.name}</span>
                            {isAtlante && (
                              <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0">
                                OFICIAL
                              </span>
                            )}
                          </div>

                          {/* Sub-barra: Equipos cruzados en vivo pintados de rojo */}
                          {row.liveMatchInfo ? (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-black text-red-300 bg-red-950/90 px-2 py-0.5 rounded-lg border border-red-500/50 w-fit shadow-md animate-in fade-in">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                              <span className="flex items-center gap-1 truncate">
                                <span>vs {row.liveMatchInfo.opponentName}</span>
                                <span>•</span>
                                <span className="font-mono text-red-200">{row.liveMatchInfo.matchScore}</span>
                                <span>•</span>
                                <span className="text-[10px] text-red-400 font-semibold">{row.liveMatchInfo.period}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono sm:hidden block">
                              {row.shortName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* PJ, G, E, P */}
                    <td className="py-3 px-2 text-center text-slate-300 font-mono font-bold text-xs">{row.pj}</td>
                    <td className="py-3 px-2 text-center text-slate-300 font-mono font-bold text-xs">{row.g}</td>
                    <td className="py-3 px-2 text-center text-slate-300 font-mono font-bold text-xs">{row.e}</td>
                    <td className="py-3 px-2 text-center text-slate-300 font-mono font-bold text-xs">{row.p}</td>

                    {/* GF, GC */}
                    <td className="py-3 px-2 text-center text-slate-400 font-mono text-xs hidden sm:table-cell">{row.gf}</td>
                    <td className="py-3 px-2 text-center text-slate-400 font-mono text-xs hidden sm:table-cell">{row.gc}</td>

                    {/* Goal Diff */}
                    <td
                      className={`py-3 px-2 text-center font-mono font-black text-xs ${
                        row.dg > 0
                          ? 'text-emerald-400'
                          : row.dg < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.dg > 0 ? `+${row.dg}` : row.dg}
                    </td>

                    {/* Points with live indicator if playing */}
                    <td className="py-3 px-3 text-center">
                      {row.liveMatchInfo ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-red-600 text-white font-black font-mono text-sm border border-red-400 shadow-md shadow-red-600/30 animate-pulse">
                            {row.pts}
                          </span>
                          <span className="text-[8px] font-black text-red-400 uppercase tracking-tight mt-0.5">
                            EN VIVO
                          </span>
                        </div>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-950 font-black text-white font-mono text-sm border border-slate-800 shadow-inner">
                          {row.pts}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
