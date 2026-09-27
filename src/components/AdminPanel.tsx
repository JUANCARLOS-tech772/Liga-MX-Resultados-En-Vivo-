import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Flame,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Send,
  Radio,
  Clock,
  ShieldAlert,
  BellRing,
  Trash2,
  RotateCcw,
  Calendar,
  Activity,
  Award,
  Play,
  Pause,
  PlusCircle,
  Edit3,
  ArrowLeftRight,
  Search,
  X,
  Check,
  Shield
} from 'lucide-react';
import { Team, Match, AppSettings, MatchEvent } from '../types';
import { TEAMS_DATA } from '../teamsData';
import { BadgeManager } from './BadgeManager';
import { saveMatchToFirestore, deleteMatchFromFirestore, saveSettingsToFirestore, saveMatchesToFirestore } from '../services/firebaseFirestore';

interface AdminPanelProps {
  matches: Match[];
  settings: AppSettings;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onUpdateMatchSuccess?: (updatedMatch: Match) => void;
  teams?: Record<string, Team>;
  onBadgeUpdated?: (teamId: string, newBadgeUrl: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  matches,
  settings,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  teams = TEAMS_DATA,
  onBadgeUpdated
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Formulario para cantar gol instantáneo
  const [goalTeamChoice, setGoalTeamChoice] = useState<'home' | 'away'>('home');
  const [goalPlayer, setGoalPlayer] = useState('');
  const [goalDetail, setGoalDetail] = useState('');

  // Formulario para agregar eventos (Tarjetas, VAR, Cambios)
  const [eventType, setEventType] = useState<'yellow_card' | 'red_card' | 'var' | 'substitution'>('yellow_card');
  const [eventTeamChoice, setEventTeamChoice] = useState<'home' | 'away'>('home');
  const [eventPlayer, setEventPlayer] = useState('');
  const [eventDetail, setEventDetail] = useState('');

  // Formulario para crear nuevo partido
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [newHomeTeam, setNewHomeTeam] = useState('america');
  const [newAwayTeam, setNewAwayTeam] = useState('guadalajara');
  const [newJornada, setNewJornada] = useState(10);
  const [newStadium, setNewStadium] = useState('');
  const [newDate, setNewDate] = useState('Hoy');
  const [newTime, setNewTime] = useState('20:00');
  const [newStatus, setNewStatus] = useState<'SCHEDULED' | 'LIVE' | 'FINISHED'>('SCHEDULED');

  // Reloj automático
  const [isClockRunning, setIsClockRunning] = useState((settings as any).autoClockRunning || false);
  const [adminJornadaFilter, setAdminJornadaFilter] = useState<number | 'ALL' | 'LIGUILLA'>(1);

  // Modal selector de equipo (al hacer clic en los escudos)
  const [teamPicker, setTeamPicker] = useState<{
    isOpen: boolean;
    matchId: string;
    side: 'home' | 'away';
    currentTeamId: string;
  } | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  const teamList = Object.values(teams);
  const currentMatch = matches.find((m) => m.id === selectedMatchId) || matches[0];
  const homeTeam = currentMatch ? (teams[currentMatch.homeTeamId] || TEAMS_DATA[currentMatch.homeTeamId] || TEAMS_DATA['tbd']) : TEAMS_DATA['tbd'];
  const awayTeam = currentMatch ? (teams[currentMatch.awayTeamId] || TEAMS_DATA[currentMatch.awayTeamId] || TEAMS_DATA['tbd']) : TEAMS_DATA['tbd'];

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const getSavedPassword = () => passwordInput || sessionStorage.getItem('ligamx_admin_pwd') || 'ligamx2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'ligamx2026' || !passwordInput) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('ligamx_admin_pwd', passwordInput || 'ligamx2026');
      setLoginError('');
      showMessage('¡Modo Control Total activado! Tienes control absoluto de partidos, marcadores y escudos.');
    } else {
      setLoginError('Contraseña incorrecta. (Prueba: ligamx2026)');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('ligamx_admin_pwd');
    setPasswordInput('');
  };

  // Alternar visibilidad pública del panel
  const togglePublicVisibility = async () => {
    const nextVal = !settings.showAdminToPublic;
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getSavedPassword(), showAdminToPublic: nextVal })
      });
      saveSettingsToFirestore({ showAdminToPublic: nextVal }).catch(() => {});
      showMessage(`Visibilidad cambiada: ${nextVal ? 'Público' : 'Solo Administrador'}`);
    } catch {
      showMessage('Error al cambiar visibilidad', 'error');
    }
  };

  // Cambiar equipo del partido (Local o Visitante) al hacer clic sobre el escudo
  const handleSelectTeam = async (newTeamId: string) => {
    if (!teamPicker) return;
    const match = matches.find((m) => m.id === teamPicker.matchId);
    if (!match) return;

    const targetTeam = teams[newTeamId] || TEAMS_DATA[newTeamId];
    const newHomeTeamId = teamPicker.side === 'home' ? newTeamId : match.homeTeamId;
    const newAwayTeamId = teamPicker.side === 'away' ? newTeamId : match.awayTeamId;
    const newStadium = teamPicker.side === 'home' && targetTeam?.stadium ? targetTeam.stadium : match.stadium;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: match.id,
          homeTeamId: newHomeTeamId,
          awayTeamId: newAwayTeamId,
          stadium: newStadium
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage(`¡Equipo ${teamPicker.side === 'home' ? 'Local' : 'Visitante'} cambiado a ${targetTeam?.name || newTeamId}!`);
        setTeamPicker(null);
        setTeamSearchQuery('');
      } else {
        showMessage('Error al cambiar el equipo del partido', 'error');
      }
    } catch {
      showMessage('Error de conexión al cambiar equipo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Invertir localía (Swap Local vs Visitante)
  const handleSwapTeams = async () => {
    if (!currentMatch) return;
    setIsLoading(true);
    try {
      const newHomeTeamId = currentMatch.awayTeamId;
      const newAwayTeamId = currentMatch.homeTeamId;
      const newHomeTeamObj = teams[newHomeTeamId] || TEAMS_DATA[newHomeTeamId];
      const newStadium = newHomeTeamObj?.stadium || currentMatch.stadium;

      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          homeTeamId: newHomeTeamId,
          awayTeamId: newAwayTeamId,
          stadium: newStadium
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage(`¡Localía invertida! ${newHomeTeamObj?.shortName} es ahora el equipo Local.`);
      }
    } catch {
      showMessage('Error al invertir localía', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar marcadores (+1 / -1)
  const updateMatchScores = async (deltaHome: number, deltaAway: number) => {
    if (!currentMatch) return;
    const newHome = Math.max(0, currentMatch.homeScore + deltaHome);
    const newAway = Math.max(0, currentMatch.awayScore + deltaAway);

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          homeScore: newHome,
          awayScore: newAway,
          minute: currentMatch.minute,
          status: currentMatch.status === 'SCHEDULED' ? 'LIVE' : currentMatch.status,
          period: currentMatch.period === 'Previo' ? '1T' : currentMatch.period
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage(`Marcador actualizado: ${homeTeam?.shortName} ${newHome} - ${newAway} ${awayTeam?.shortName}`);
      }
    } catch {
      showMessage('Error al actualizar marcador', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar minuto del partido
  const updateMatchMinute = async (newMinute: number) => {
    if (!currentMatch) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          minute: Math.max(0, Math.min(130, newMinute))
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage(`Minuto fijado en ${newMinute}'. Sincronizado en tiempo real.`);
      }
    } catch {
      showMessage('Error al cambiar minuto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado del partido (1T, Descanso, 2T, Finalizado, etc.)
  const updateMatchStatus = async (status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED', period: string) => {
    if (!currentMatch) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          status,
          period
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage(`Estado actualizado a ${status} (${period}).`);
      }
    } catch {
      showMessage('Error al cambiar estado', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cantar Gol: Sube el marcador, añade el evento y dispara la Notificación Push nativa
  const handleAnnounceGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch) return;

    const isHome = goalTeamChoice === 'home';
    const newHomeScore = isHome ? currentMatch.homeScore + 1 : currentMatch.homeScore;
    const newAwayScore = !isHome ? currentMatch.awayScore + 1 : currentMatch.awayScore;
    const teamId = isHome ? currentMatch.homeTeamId : currentMatch.awayTeamId;
    const team = teams[teamId] || TEAMS_DATA[teamId];

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          homeScore: newHomeScore,
          awayScore: newAwayScore,
          minute: currentMatch.minute || 1,
          status: 'LIVE',
          period: currentMatch.period === 'Previo' ? '1T' : currentMatch.period,
          newGoalEvent: {
            type: 'goal',
            teamId,
            player: goalPlayer || `Goleador de ${team?.shortName}`,
            detail: goalDetail || 'Remate dentro del área'
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        setGoalPlayer('');
        setGoalDetail('');
        showMessage(`¡GOOOL de ${team?.shortName}! Alerta enviada a todos los clientes.`);
      }
    } catch {
      showMessage('Error al cantar el gol', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar Evento al Partido (Tarjeta, VAR, Cambio)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMatch) return;

    const teamId = eventTeamChoice === 'home' ? currentMatch.homeTeamId : currentMatch.awayTeamId;
    const team = teams[teamId] || TEAMS_DATA[teamId];

    const defaultLabels: Record<string, string> = {
      yellow_card: 'Tarjeta Amarilla',
      red_card: 'Tarjeta Roja',
      var: 'Revisión VAR',
      substitution: 'Sustitución de Jugador'
    };

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}`,
      type: eventType,
      minute: currentMatch.minute || 1,
      teamId,
      player: eventPlayer || team?.shortName || 'Jugador',
      detail: eventDetail || defaultLabels[eventType]
    };

    const updatedEvents = [...(currentMatch.events || []), newEvent];

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id,
          events: updatedEvents
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        setEventPlayer('');
        setEventDetail('');
        showMessage(`Evento agregado: ${defaultLabels[eventType]} para ${team?.shortName}`);
      }
    } catch {
      showMessage('Error al agregar evento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear nuevo partido
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHomeTeam === newAwayTeam) {
      showMessage('El equipo local y visitante no pueden ser el mismo', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          jornada: newJornada,
          homeTeamId: newHomeTeam,
          awayTeamId: newAwayTeam,
          stadium: newStadium || teams[newHomeTeam]?.stadium,
          date: newDate,
          time: newTime,
          status: newStatus,
          minute: newStatus === 'LIVE' ? 1 : 0,
          period: newStatus === 'LIVE' ? '1T' : 'Previo'
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        setSelectedMatchId(data.match.id);
        setIsCreatingMatch(false);
        showMessage('¡Nuevo partido creado y publicado!');
      }
    } catch {
      showMessage('Error al crear el partido', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar partido
  const handleResetMatch = async () => {
    if (!currentMatch) return;
    if (!confirm(`¿Deseas reiniciar el marcador y eventos del partido ${homeTeam?.shortName} vs ${awayTeam?.shortName}?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id
        })
      });
      const data = await res.json();
      if (res.ok && data.match) {
        saveMatchToFirestore(data.match).catch(() => {});
        showMessage('Partido reiniciado a 0-0.');
      }
    } catch {
      showMessage('Error al reiniciar partido', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar partido
  const handleDeleteMatch = async () => {
    if (!currentMatch) return;
    if (!confirm(`¿Seguro que deseas eliminar este partido (${homeTeam?.shortName} vs ${awayTeam?.shortName})?`)) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/match/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          matchId: currentMatch.id
        })
      });
      if (res.ok) {
        deleteMatchFromFirestore(currentMatch.id).catch(() => {});
        showMessage('Partido eliminado con éxito.');
        const remaining = matches.filter(m => m.id !== currentMatch.id);
        if (remaining.length > 0) {
          setSelectedMatchId(remaining[0].id);
        }
      }
    } catch {
      showMessage('Error al eliminar partido', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Alternar reloj automático
  const handleToggleClock = async () => {
    const nextState = !isClockRunning;
    setIsClockRunning(nextState);
    try {
      await fetch('/api/admin/clock/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: getSavedPassword(), running: nextState })
      });
      showMessage(`Reloj automático ${nextState ? 'activado (avanza 1 min cada 60s)' : 'pausado'}`);
    } catch {
      showMessage('Error al cambiar reloj automático', 'error');
    }
  };

  // Probar Push Notification
  const handleTestPush = async () => {
    try {
      const res = await fetch('/api/admin/test-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: getSavedPassword(),
          teamId: currentMatch ? currentMatch.homeTeamId : 'atlante'
        })
      });
      if (res.ok) {
        showMessage('Notificación Push y sonido de estadio disparados.');
      }
    } catch {
      showMessage('Error al disparar notificación', 'error');
    }
  };

  // Filtrado de equipos para el selector emergente
  const filteredTeamsForPicker = teamList.filter(t => 
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    t.shortName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    t.city.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  // Si no ha iniciado sesión en el panel
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center backdrop-blur-md">
        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-black text-white mb-1">Control Maestro Liga MX</h2>
        <p className="text-xs text-slate-400 mb-6">
          Ingresa la contraseña maestra para controlar marcadores, cambiar escudos, cantar goles y administrar partidos.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Contraseña maestra (ej: ligamx2026)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition"
              autoFocus
            />
          </div>

          {loginError && (
            <p className="text-xs font-semibold text-red-400 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !passwordInput}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
            <span>Desbloquear Panel</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
          Contraseña por defecto: <code className="text-amber-300 font-mono bg-slate-800 px-1.5 py-0.5 rounded">ligamx2026</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Visibility Switch & Master Options */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/40 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Panel de Control Maestro
            </h2>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              CONTROL MANUAL 100%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Haz clic sobre cualquier escudo en los partidos para cambiar los equipos instantáneamente.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botón Crear Partido */}
          <button
            onClick={() => setIsCreatingMatch(!isCreatingMatch)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isCreatingMatch ? 'Cancelar' : 'Nuevo Partido'}</span>
          </button>

          {/* Toggle Reloj Automático */}
          <button
            onClick={handleToggleClock}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isClockRunning
                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Avanza 1 minuto cada 60s en partidos en vivo"
          >
            {isClockRunning ? <Pause className="w-3.5 h-3.5 text-blue-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isClockRunning ? 'Reloj Auto: ON' : 'Reloj Auto: OFF'}</span>
          </button>

          {/* Visibilidad Pública */}
          <button
            onClick={togglePublicVisibility}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              settings.showAdminToPublic
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}
          >
            {settings.showAdminToPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{settings.showAdminToPublic ? 'Visible' : 'Oculto'}</span>
          </button>

          <button
            onClick={handleTestPush}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Prueba sonido y notificación push"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Probar Push</span>
          </button>

          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700/80 transition cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-in fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
              : 'bg-red-950/80 text-red-300 border-red-500/50'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Formulario Desplegable: Crear Nuevo Partido */}
      {isCreatingMatch && (
        <div className="bg-slate-900 border-2 border-emerald-500/60 p-6 rounded-3xl shadow-2xl space-y-4 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Crear Nuevo Partido de la Liga MX
            </h3>
            <span className="text-xs text-slate-400">18 Clubes Oficiales</span>
          </div>

          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Equipo Local */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Equipo Local</label>
                <select
                  value={newHomeTeam}
                  onChange={(e) => setNewHomeTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  {teamList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipo Visitante */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Equipo Visitante</label>
                <select
                  value={newAwayTeam}
                  onChange={(e) => setNewAwayTeam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  {teamList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Jornada</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newJornada}
                  onChange={(e) => setNewJornada(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Día / Fecha</label>
                <input
                  type="text"
                  placeholder="Ej. Hoy, Sábado, 28 Oct"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hora</label>
                <input
                  type="text"
                  placeholder="Ej. 20:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Estado Inicial</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="SCHEDULED">Por Iniciar</option>
                  <option value="LIVE">En Vivo</option>
                  <option value="FINISHED">Finalizado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Estadio (opcional)</label>
              <input
                type="text"
                placeholder={teams[newHomeTeam]?.stadium || 'Estadio local'}
                value={newStadium}
                onChange={(e) => setNewStadium(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingMatch(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition cursor-pointer"
              >
                Guardar Partido
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selector de Partido a Editar con Carrusel de Jornadas */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Seleccionar Partido para Control en Vivo
            </label>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
              💡 Tip: Puedes presionar sobre los escudos para cambiar de equipo rápidamente.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-bold">
            {matches.filter(m => adminJornadaFilter === 'ALL' ? true : adminJornadaFilter === 'LIGUILLA' ? m.jornada >= 18 : m.jornada === adminJornadaFilter).length} partidos
          </span>
        </div>

        {/* Carrusel de Jornadas J1-J17 + Liguilla */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setAdminJornadaFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
              adminJornadaFilter === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({matches.length})
          </button>

          {Array.from({ length: 17 }, (_, i) => i + 1).map((jNum) => {
            const count = matches.filter(m => m.jornada === jNum).length;
            if (count === 0) return null;
            return (
              <button
                key={jNum}
                onClick={() => setAdminJornadaFilter(jNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  adminJornadaFilter === jNum
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                J{jNum}
              </button>
            );
          })}

          <button
            onClick={() => setAdminJornadaFilter('LIGUILLA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
              adminJornadaFilter === 'LIGUILLA'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Liguilla ({matches.filter(m => m.jornada >= 18).length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {matches
            .filter((m) => {
              if (adminJornadaFilter === 'ALL') return true;
              if (adminJornadaFilter === 'LIGUILLA') return m.jornada >= 18;
              return m.jornada === adminJornadaFilter;
            })
            .map((m) => {
              const h = teams[m.homeTeamId] || TEAMS_DATA[m.homeTeamId];
              const a = teams[m.awayTeamId] || TEAMS_DATA[m.awayTeamId];
              const isSelected = m.id === selectedMatchId;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatchId(m.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                      {/* Escudo Local Clickeable */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamPicker({ isOpen: true, matchId: m.id, side: 'home', currentTeamId: m.homeTeamId });
                        }}
                        className="group relative p-0.5 rounded-lg hover:bg-amber-500/20 transition cursor-pointer"
                        title="Haz clic para cambiar el equipo Local"
                      >
                        <img src={h?.badgeUrl} alt={h?.name} className="w-5 h-5 object-contain group-hover:scale-110 transition" />
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-slate-950 font-black rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          ✎
                        </span>
                      </button>

                      <span className="font-bold text-white text-xs">{h?.shortName}</span>
                      <span className="text-amber-400 font-mono font-black text-xs px-1 bg-slate-900 rounded">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span className="font-bold text-white text-xs">{a?.shortName}</span>

                      {/* Escudo Visitante Clickeable */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTeamPicker({ isOpen: true, matchId: m.id, side: 'away', currentTeamId: m.awayTeamId });
                        }}
                        className="group relative p-0.5 rounded-lg hover:bg-amber-500/20 transition cursor-pointer"
                        title="Haz clic para cambiar el equipo Visitante"
                      >
                        <img src={a?.badgeUrl} alt={a?.name} className="w-5 h-5 object-contain group-hover:scale-110 transition" />
                        <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-slate-950 font-black rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          ✎
                        </span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className={m.status === 'LIVE' ? 'text-emerald-400 font-bold' : ''}>
                        {m.status === 'LIVE' ? `En Vivo ${m.minute}'` : m.status === 'FINISHED' ? 'Finalizado' : 'Por Iniciar'}
                      </span>
                      <span>• {m.jornada >= 18 ? m.period : `Jornada ${m.jornada}`}</span>
                      <span>• {m.date} {m.time}</span>
                    </div>
                  </div>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 ml-2" />}
                </div>
              );
            })}
        </div>
      </div>

      {currentMatch && homeTeam && awayTeam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Controlador de Marcador y Minuto */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tarjeta de Control Directo de Marcador */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Marcador y Minuto en Vivo</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetMatch}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                    title="Reiniciar a 0-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reiniciar 0-0</span>
                  </button>

                  <button
                    onClick={handleDeleteMatch}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition cursor-pointer"
                    title="Eliminar este partido"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>

              {/* Botones Interactivos de Escudos (Cambiar Equipo Local / Visitante) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botón Escudo Local */}
                <button
                  type="button"
                  onClick={() => setTeamPicker({ isOpen: true, matchId: currentMatch.id, side: 'home', currentTeamId: currentMatch.homeTeamId })}
                  className="group bg-slate-950 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 p-3 rounded-2xl flex items-center justify-between gap-2.5 transition cursor-pointer text-left shadow-md"
                  title="Haz clic sobre el escudo para cambiar el equipo Local de este partido"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img src={homeTeam.badgeUrl} alt={homeTeam.name} className="w-9 h-9 object-contain group-hover:scale-110 transition" />
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
                        <Edit3 className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                        LOCAL (Haz clic)
                      </span>
                      <span className="text-xs font-black text-white truncate block">
                        {homeTeam.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0 font-bold">
                    Cambiar ▾
                  </span>
                </button>

                {/* Botón Escudo Visitante */}
                <button
                  type="button"
                  onClick={() => setTeamPicker({ isOpen: true, matchId: currentMatch.id, side: 'away', currentTeamId: currentMatch.awayTeamId })}
                  className="group bg-slate-950 hover:bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 p-3 rounded-2xl flex items-center justify-between gap-2.5 transition cursor-pointer text-left shadow-md"
                  title="Haz clic sobre el escudo para cambiar el equipo Visitante de este partido"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img src={awayTeam.badgeUrl} alt={awayTeam.name} className="w-9 h-9 object-contain group-hover:scale-110 transition" />
                      <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 shadow">
                        <Edit3 className="w-2.5 h-2.5" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                        VISITANTE (Haz clic)
                      </span>
                      <span className="text-xs font-black text-white truncate block">
                        {awayTeam.name}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0 font-bold">
                    Cambiar ▾
                  </span>
                </button>
              </div>

              {/* Botón de Invertir Localía */}
              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwapTeams}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-xs font-bold border border-slate-700 shadow transition cursor-pointer"
                  title="Invertir quién juega de Local y quién de Visitante"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invertir Local / Visitante</span>
                </button>
              </div>

              {/* Botones de Marcador (+ / -) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Local Score Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <img src={homeTeam.badgeUrl} alt={homeTeam.name} className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-white truncate">{homeTeam.shortName}</span>
                  </div>
                  <div className="text-4xl font-black font-mono text-white">{currentMatch.homeScore}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateMatchScores(1, 0)}
                      disabled={isLoading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Gol Local
                    </button>
                    <button
                      onClick={() => updateMatchScores(-1, 0)}
                      disabled={isLoading || currentMatch.homeScore === 0}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visitante Score Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <img src={awayTeam.badgeUrl} alt={awayTeam.name} className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-white truncate">{awayTeam.shortName}</span>
                  </div>
                  <div className="text-4xl font-black font-mono text-white">{currentMatch.awayScore}</div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateMatchScores(0, 1)}
                      disabled={isLoading}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Gol Visita
                    </button>
                    <button
                      onClick={() => updateMatchScores(0, -1)}
                      disabled={isLoading || currentMatch.awayScore === 0}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Controlador de Minuto */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-emerald-400" /> Minuto Actual:{' '}
                    <strong className="text-white font-mono text-sm">{currentMatch.minute}'</strong>
                  </span>
                  <span>Período: {currentMatch.period}</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => updateMatchMinute(currentMatch.minute + 1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    +1 Min
                  </button>
                  <button
                    onClick={() => updateMatchMinute(currentMatch.minute + 5)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    +5 Min
                  </button>
                  <button
                    onClick={() => updateMatchMinute(45)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    45' (Descanso)
                  </button>
                  <button
                    onClick={() => updateMatchMinute(90)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    90' (Final)
                  </button>
                  <button
                    onClick={() => updateMatchMinute(0)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
                  >
                    Reiniciar 0'
                  </button>
                </div>
              </div>

              {/* Selector de Estado */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-400">Cambiar Estado del Partido</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => updateMatchStatus('LIVE', '1T')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      currentMatch.status === 'LIVE' && currentMatch.period === '1T'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    1er Tiempo
                  </button>
                  <button
                    onClick={() => updateMatchStatus('HALFTIME', 'Descanso')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      currentMatch.status === 'HALFTIME'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    Medio Tiempo
                  </button>
                  <button
                    onClick={() => updateMatchStatus('LIVE', '2T')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      currentMatch.status === 'LIVE' && currentMatch.period === '2T'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    2do Tiempo
                  </button>
                  <button
                    onClick={() => updateMatchStatus('FINISHED', 'FT')}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      currentMatch.status === 'FINISHED'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    Finalizado
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta: Tarjetas, VAR y Sustituciones */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Tarjetas, VAR y Sustituciones</h3>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventType('yellow_card')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      eventType === 'yellow_card'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🟨 Amarilla
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('red_card')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      eventType === 'red_card'
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🟥 Roja
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('var')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      eventType === 'var'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    📺 VAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventType('substitution')}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      eventType === 'substitution'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🔄 Cambio
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEventTeamChoice('home')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                      eventTeamChoice === 'home'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={homeTeam.badgeUrl} alt="" className="w-4 h-4 object-contain" />
                    <span>{homeTeam.shortName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEventTeamChoice('away')}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                      eventTeamChoice === 'away'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={awayTeam.badgeUrl} alt="" className="w-4 h-4 object-contain" />
                    <span>{awayTeam.shortName}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Jugador involucrado..."
                    value={eventPlayer}
                    onChange={(e) => setEventPlayer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Detalle de la jugada..."
                    value={eventDetail}
                    onChange={(e) => setEventDetail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  Agregar Evento al Partido
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Cantador de Gol Oficial & Alerta Push */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 p-6 rounded-3xl shadow-xl space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="text-xl">⚽</span>
                <div>
                  <h3 className="text-base font-black text-white">Cantar GOL Oficial</h3>
                  <p className="text-[11px] text-slate-400">
                    Dispara la sirena, la animación de confeti y la notificación Push a todos los teléfonos.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAnnounceGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">¿Quién anotó el gol?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGoalTeamChoice('home')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                        goalTeamChoice === 'home'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <img src={homeTeam.badgeUrl} alt="" className="w-5 h-5 object-contain" />
                      <span>{homeTeam.shortName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalTeamChoice('away')}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                        goalTeamChoice === 'away'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <img src={awayTeam.badgeUrl} alt="" className="w-5 h-5 object-contain" />
                      <span>{awayTeam.shortName}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Goleador</label>
                  <input
                    type="text"
                    placeholder="Ej. Henry Martín, Alexis Vega, Paulinho..."
                    value={goalPlayer}
                    onChange={(e) => setGoalPlayer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Detalle de la jugada</label>
                  <input
                    type="text"
                    placeholder="Ej. Tiro libre directo, remate de cabeza, penal..."
                    value={goalDetail}
                    onChange={(e) => setGoalDetail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>¡CANTAR GOL Y ENVIAR ALERTA PUSH!</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EMERGENTE: Selector de Equipos por Escudo */}
      {teamPicker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Cambiar Equipo {teamPicker.side === 'home' ? 'Local' : 'Visitante'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Selecciona el club de la Liga MX para este partido.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTeamPicker(null);
                  setTeamSearchQuery('');
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buscador de clubes */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por club, nombre, apodo o ciudad..."
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition"
                autoFocus
              />
            </div>

            {/* Cuadrícula de Clubes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
              {filteredTeamsForPicker.map((t) => {
                const isCurrent = t.id === teamPicker.currentTeamId;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTeam(t.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    <img src={t.badgeUrl} alt={t.name} className="w-9 h-9 object-contain shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white truncate">{t.shortName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{t.name}</div>
                      <div className="text-[9px] text-slate-500 truncate">{t.city}</div>
                    </div>
                    {isCurrent && (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 shrink-0">
              <span>18 Clubes Oficiales de la Liga BBVA MX</span>
              <button
                onClick={() => {
                  setTeamPicker(null);
                  setTeamSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gestión de Escudos Oficiales de Base */}
      <div className="pt-6 border-t border-slate-800">
        <BadgeManager
          teams={teams}
          onBadgeUpdated={onBadgeUpdated}
          adminPassword={passwordInput || sessionStorage.getItem('ligamx_admin_pwd') || undefined}
        />
      </div>
    </div>
  );
};
