import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Shield,
  Star,
  Flame,
  Check,
  Filter,
  Search,
  Sparkles,
  Sliders,
  Calendar,
  Radio
} from 'lucide-react';
import { Match, Team } from '../types';
import { LIGA_MX_18_TEAMS, TEAMS_DATA } from '../teamsData';
import {
  NotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
  isMatchNotificationEnabled,
  toggleMatchNotification,
  toggleFavoriteTeam,
  requestNotificationPermission,
  getNotificationPermission,
  showNativeGoalNotification
} from '../services/notifications';
import { soundEffects } from '../services/soundEffects';

interface NotificationSettingsProps {
  matches: Match[];
  teams?: Record<string, Team>;
  onTestGoalAlert?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  matches,
  teams,
  onTestGoalAlert
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [selectedJornada, setSelectedJornada] = useState<number | 'ALL' | 'LIGUILLA'>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);

  const teamsMap = teams || TEAMS_DATA;

  useEffect(() => {
    const handlePrefsChange = () => {
      setPrefs(getNotificationPreferences());
    };
    window.addEventListener('ligamx_notification_prefs_changed', handlePrefsChange);
    return () => {
      window.removeEventListener('ligamx_notification_prefs_changed', handlePrefsChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleGlobal = async () => {
    const next = !prefs.globalEnabled;
    const updated = { ...prefs, globalEnabled: next };
    setPrefs(updated);
    saveNotificationPreferences(updated);

    if (next) {
      soundEffects.playWhistle();
      try {
        const res = await requestNotificationPermission();
        setPermission(res.permission);
        setIsIframeBlocked(res.isIframeBlocked);
      } catch {}
      showToast('¡Notificaciones Push globales activadas!');
    } else {
      showToast('Notificaciones Push desactivadas');
    }
  };

  const handleToggleSound = () => {
    const next = !prefs.soundEnabled;
    const updated = { ...prefs, soundEnabled: next };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    soundEffects.setEnabled(next);
    if (next) soundEffects.playWhistle();
    showToast(next ? 'Sonido de estadio activado' : 'Sonido silenciado');
  };

  const handleToggleVibration = () => {
    const next = !prefs.vibrationEnabled;
    const updated = { ...prefs, vibrationEnabled: next };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    if (next && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }
    showToast(next ? 'Vibración activada' : 'Vibración desactivada');
  };

  const handleChangeMode = (mode: 'all_matches' | 'selected_only') => {
    const updated = { ...prefs, mode };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    showToast(
      mode === 'all_matches'
        ? 'Modo: Recibir alertas de todos los partidos'
        : 'Modo: Recibir alertas solo de partidos seleccionados y favoritos'
    );
  };

  const handleToggleMatch = (matchId: string, homeTeamId?: string, awayTeamId?: string) => {
    const isNowActive = toggleMatchNotification(matchId, homeTeamId, awayTeamId);
    setPrefs(getNotificationPreferences());
    soundEffects.playWhistle();
    showToast(
      isNowActive
        ? '🔔 Alerta de gol activada para este partido'
        : '🔕 Alerta desactivada para este partido'
    );
  };

  const handleToggleTeamFavorite = (teamId: string) => {
    const isFav = toggleFavoriteTeam(teamId);
    setPrefs(getNotificationPreferences());
    soundEffects.playWhistle();
    const teamObj = teamsMap[teamId];
    showToast(
      isFav
        ? `⭐ ${teamObj?.shortName || teamId} agregado a favoritos (recibirás alertas de todos sus partidos)`
        : `${teamObj?.shortName || teamId} quitado de favoritos`
    );
  };

  const handleActivateAllInJornada = (jornadaNum: number | 'ALL' | 'LIGUILLA') => {
    const targetMatches = matches.filter((m) => {
      if (jornadaNum === 'ALL') return true;
      if (jornadaNum === 'LIGUILLA') return m.jornada >= 18;
      return m.jornada === jornadaNum;
    });

    const updated = { ...prefs };
    targetMatches.forEach((m) => {
      updated.mutedMatchIds = updated.mutedMatchIds.filter((id) => id !== m.id);
      if (!updated.subscribedMatchIds.includes(m.id)) {
        updated.subscribedMatchIds.push(m.id);
      }
    });

    setPrefs(updated);
    saveNotificationPreferences(updated);
    soundEffects.playWhistle();
    showToast(`🔔 Alertas activadas para los ${targetMatches.length} partidos de esta jornada`);
  };

  const handleMuteAllInJornada = (jornadaNum: number | 'ALL' | 'LIGUILLA') => {
    const targetMatches = matches.filter((m) => {
      if (jornadaNum === 'ALL') return true;
      if (jornadaNum === 'LIGUILLA') return m.jornada >= 18;
      return m.jornada === jornadaNum;
    });

    const updated = { ...prefs };
    targetMatches.forEach((m) => {
      updated.subscribedMatchIds = updated.subscribedMatchIds.filter((id) => id !== m.id);
      if (!updated.mutedMatchIds.includes(m.id)) {
        updated.mutedMatchIds.push(m.id);
      }
    });

    setPrefs(updated);
    saveNotificationPreferences(updated);
    showToast(`🔕 Los ${targetMatches.length} partidos de esta jornada han sido silenciados`);
  };

  const handleTestNotification = () => {
    soundEffects.playGoalHorn();
    if (onTestGoalAlert) onTestGoalAlert();

    showNativeGoalNotification({
      title: '¡GOOOOL DE PRUEBA! ⚽',
      body: 'Club América 2 - 1 Guadalajara (Minuto 68\')',
      icon: '/teams/america.png',
      badge: '/icon.svg'
    });

    showToast('¡Notificación de prueba enviada con sonido y vibración!');
  };

  // Filtrado de partidos
  const filteredMatches = matches.filter((m) => {
    if (selectedJornada !== 'ALL') {
      if (selectedJornada === 'LIGUILLA') {
        if (m.jornada < 18) return false;
      } else {
        if (m.jornada !== selectedJornada) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const home = teamsMap[m.homeTeamId] || TEAMS_DATA[m.homeTeamId];
      const away = teamsMap[m.awayTeamId] || TEAMS_DATA[m.awayTeamId];
      const homeName = (home?.name || '').toLowerCase();
      const awayName = (away?.name || '').toLowerCase();
      const homeShort = (home?.shortName || '').toLowerCase();
      const awayShort = (away?.shortName || '').toLowerCase();
      const stadium = (m.stadium || '').toLowerCase();

      return (
        homeName.includes(q) ||
        awayName.includes(q) ||
        homeShort.includes(q) ||
        awayShort.includes(q) ||
        stadium.includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Configuración de Notificaciones Push y Alertas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Personaliza qué partidos y clubes te enviarán alertas de goles y sonido en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={handleTestNotification}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer self-start md:self-auto active:scale-95"
          >
            <BellRing className="w-4 h-4" />
            <span>Probar Notificación y Sonido</span>
          </button>
        </div>

        {/* Master Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          {/* Global Push Switch */}
          <div
            onClick={handleToggleGlobal}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
              prefs.globalEnabled
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl ${
                  prefs.globalEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.globalEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">Notificaciones Push</div>
                <div className="text-[10px] text-slate-400">
                  {prefs.globalEnabled ? 'Activadas' : 'Desactivadas'}
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.globalEnabled ? 'border-emerald-400 bg-emerald-400' : 'border-slate-700'
              }`}
            >
              {prefs.globalEnabled && <Check className="w-3 h-3 text-slate-950" />}
            </span>
          </div>

          {/* Sound Switch */}
          <div
            onClick={handleToggleSound}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
              prefs.soundEnabled
                ? 'bg-amber-500/15 border-amber-500/50 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl ${
                  prefs.soundEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {prefs.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">Sonidos de Estadio</div>
                <div className="text-[10px] text-slate-400">
                  {prefs.soundEnabled ? 'Sirena y silbato ON' : 'Silencio'}
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.soundEnabled ? 'border-amber-400 bg-amber-400' : 'border-slate-700'
              }`}
            >
              {prefs.soundEnabled && <Check className="w-3 h-3 text-slate-950" />}
            </span>
          </div>

          {/* Vibration Switch */}
          <div
            onClick={handleToggleVibration}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
              prefs.vibrationEnabled
                ? 'bg-blue-500/15 border-blue-500/50 text-white'
                : 'bg-slate-950/70 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl ${
                  prefs.vibrationEnabled ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">Vibración Háptica</div>
                <div className="text-[10px] text-slate-400">
                  {prefs.vibrationEnabled ? 'En cada GOL' : 'Desactivada'}
                </div>
              </div>
            </div>
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.vibrationEnabled ? 'border-blue-400 bg-blue-400' : 'border-slate-700'
              }`}
            >
              {prefs.vibrationEnabled && <Check className="w-3 h-3 text-slate-950" />}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          Modo de Filtrado de Alertas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => handleChangeMode('all_matches')}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              prefs.mode === 'all_matches'
                ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    prefs.mode === 'all_matches' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                  }`}
                >
                  {prefs.mode === 'all_matches' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </span>
                Todos los Partidos (Recomendado)
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded">
                COMPLETO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pl-5">
              Recibirás alertas de goles de todos los partidos del torneo, salvo los que decidas silenciar manualmente.
            </p>
          </div>

          <div
            onClick={() => handleChangeMode('selected_only')}
            className={`p-4 rounded-2xl border transition cursor-pointer space-y-1 ${
              prefs.mode === 'selected_only'
                ? 'bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    prefs.mode === 'selected_only' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                  }`}
                >
                  {prefs.mode === 'selected_only' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </span>
                Solo Partidos Específicos y Favoritos
              </span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/20 px-2 py-0.5 rounded">
                PERSONALIZADO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pl-5">
              Solo recibirás notificaciones de los partidos que marques con la campanita 🔔 o de tus clubes con estrella ⭐.
            </p>
          </div>
        </div>
      </div>

      {/* Favorite Teams Bar (18 Clubes) */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Clubes Favoritos ({prefs.favoriteTeamIds.length} seleccionados)
            </h3>
            <p className="text-[11px] text-slate-400">
              Haz clic en cualquier club para activar alertas automáticas de todos sus partidos.
            </p>
          </div>
          {prefs.favoriteTeamIds.length > 0 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-bold self-start sm:self-auto">
              Suscripción Automática Activa
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2 pt-2">
          {LIGA_MX_18_TEAMS.map((club) => {
            const isFav = prefs.favoriteTeamIds.includes(club.id);
            const teamObj = teamsMap[club.id] || club;

            return (
              <button
                key={club.id}
                onClick={() => handleToggleTeamFavorite(club.id)}
                className={`p-2.5 rounded-2xl border transition flex flex-col items-center justify-center gap-1.5 cursor-pointer relative group ${
                  isFav
                    ? 'bg-amber-500/20 border-amber-400 shadow-md ring-2 ring-amber-400/40'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
                title={isFav ? `Quitar ${teamObj.name} de favoritos` : `Marcar ${teamObj.name} como favorito`}
              >
                <img src={teamObj.badgeUrl} alt={teamObj.name} className="w-8 h-8 object-contain" />
                <span className="text-[10px] font-bold text-white truncate max-w-full">
                  {teamObj.shortName}
                </span>

                {isFav ? (
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 absolute top-1 right-1" />
                ) : (
                  <Star className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 absolute top-1 right-1 transition" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Per-Match Notification Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Alertas por Partido Específico (Torneo Apertura 2026)
            </h3>
            <p className="text-[11px] text-slate-400">
              Presiona la campanita 🔔 en cualquier partido para activar o silenciar sus notificaciones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleActivateAllInJornada(selectedJornada)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
            >
              Activar todos (Jornada)
            </button>
            <button
              onClick={() => handleMuteAllInJornada(selectedJornada)}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              Silenciar jornada
            </button>
          </div>
        </div>

        {/* Carousel & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin flex-1">
            <button
              onClick={() => setSelectedJornada('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedJornada === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({matches.length})
            </button>

            {Array.from({ length: 17 }, (_, i) => i + 1).map((jNum) => {
              const count = matches.filter((m) => m.jornada === jNum).length;
              if (count === 0) return null;
              return (
                <button
                  key={jNum}
                  onClick={() => setSelectedJornada(jNum)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                    selectedJornada === jNum
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  J{jNum}
                </button>
              );
            })}

            <button
              onClick={() => setSelectedJornada('LIGUILLA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedJornada === 'LIGUILLA'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              Liguilla
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar club o sede..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Matches Grid with Alert Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredMatches.map((m) => {
            const home = teamsMap[m.homeTeamId] || TEAMS_DATA[m.homeTeamId] || TEAMS_DATA['tbd'];
            const away = teamsMap[m.awayTeamId] || TEAMS_DATA[m.awayTeamId] || TEAMS_DATA['tbd'];
            const isSubscribed = isMatchNotificationEnabled(m.id, m.homeTeamId, m.awayTeamId);

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  isSubscribed
                    ? 'bg-slate-950/90 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                    : 'bg-slate-950/60 border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Match Header */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800/80">
                  <span className="font-bold text-slate-300">
                    {m.jornada >= 18 ? m.period : `Jornada ${m.jornada}`} • {m.date}
                  </span>
                  <span className="font-mono">{m.time}</span>
                </div>

                {/* Match Teams & Score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img src={home?.badgeUrl || '/teams/tbd.svg'} alt="" className="w-6 h-6 object-contain shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{home?.shortName}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-slate-900 font-mono font-black text-xs text-amber-400 border border-slate-800">
                    {m.homeScore} - {m.awayScore}
                  </span>

                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs font-bold text-white truncate text-right">{away?.shortName}</span>
                    <img src={away?.badgeUrl || '/teams/tbd.svg'} alt="" className="w-6 h-6 object-contain shrink-0" />
                  </div>
                </div>

                {/* Notification Toggle Button */}
                <button
                  type="button"
                  onClick={() => handleToggleMatch(m.id, m.homeTeamId, m.awayTeamId)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow ${
                    isSubscribed
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <Bell className="w-3.5 h-3.5 text-white" />
                      <span>Alerta Activada</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Alerta Silenciada</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
