import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Team, Match, AppSettings, GoalAlertPayload } from '../types';
import { TEAMS_DATA } from '../teamsData';
import { APERTURA_2026_MATCHES } from '../fixturesApertura2026';
import { soundEffects } from '../services/soundEffects';
import { showNativeGoalNotification, getNotificationPermission, isNotificationsEnabled, isMatchNotificationEnabled } from '../services/notifications';

export function useRealtimeSync() {
  const [teams, setTeams] = useState<Record<string, Team>>(TEAMS_DATA);
  const [matches, setMatches] = useState<Match[]>(APERTURA_2026_MATCHES);
  const [settings, setSettings] = useState<AppSettings>({
    showAdminToPublic: true,
    lastApiSync: new Date().toISOString(),
    apiStatus: 'active',
    connectedClients: 1
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activeGoalAlert, setActiveGoalAlert] = useState<GoalAlertPayload | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  // Disparar celebración visual y sonora de gol
  const triggerGoalCelebration = useCallback((payload: GoalAlertPayload) => {
    // Verificar si el usuario tiene activadas las notificaciones para este partido específico
    if (payload.matchId && !payload.isTest && !isMatchNotificationEnabled(payload.matchId)) {
      return;
    }

    setActiveGoalAlert(payload);

    // Sonido estilo bocina de estadio / sirena
    soundEffects.playGoalHorn();

    // Confetti multicolor con tonos verdes/dorados de Liga MX
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#fbbf24', '#ef4444', '#3b82f6', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch {
      // Confetti fallback
    }

    // Notificación Push Nativa a la bandeja del sistema operativo
    if (getNotificationPermission() === 'granted') {
      showNativeGoalNotification({
        title: payload.title,
        body: payload.body,
        icon: payload.badgeUrl || '/icon.svg',
        badge: '/icon.svg',
        matchId: payload.matchId
      });
    }

    // Ocultar banner de gol tras 7 segundos
    setTimeout(() => {
      setActiveGoalAlert((current) => (current === payload ? null : current));
    }, 7000);
  }, []);

  // Función para obtener estado inicial vía REST API
  const fetchInitialData = useCallback(async () => {
    try {
      const [resMatches, resTeams] = await Promise.all([
        fetch('/api/matches').catch(() => null),
        fetch('/api/teams').catch(() => null)
      ]);

      if (resMatches && resMatches.ok) {
        const data = await resMatches.json();
        if (data.matches) {
          setMatches(data.matches);
        }
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
        setLastUpdatedTime(new Date().toLocaleTimeString('es-MX'));
      }

      if (resTeams && resTeams.ok) {
        const data = await resTeams.json();
        if (data.teams && Array.isArray(data.teams)) {
          setTeams((prev) => {
            const updated = { ...prev };
            data.teams.forEach((t: Team) => {
              if (updated[t.id]) {
                updated[t.id] = { ...updated[t.id], badgeUrl: t.badgeUrl };
              }
            });
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching initial data:', err);
    }
  }, []);

  // Conectar al flujo de Eventos del Servidor (SSE)
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/events');
    eventSourceRef.current = es;

    es.addEventListener('open', () => {
      setIsConnected(true);
    });

    es.addEventListener('init', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.matches) setMatches(data.matches);
        if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
        if (data.teams && Array.isArray(data.teams)) {
          setTeams((prev) => {
            const updated = { ...prev };
            data.teams.forEach((t: Team) => {
              if (updated[t.id]) {
                updated[t.id] = { ...updated[t.id], badgeUrl: t.badgeUrl };
              }
            });
            return updated;
          });
        }
        setLastUpdatedTime(new Date().toLocaleTimeString('es-MX'));
      } catch (err) {
        console.error('Error parsing SSE init:', err);
      }
    });

    es.addEventListener('teams_update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setTeams((prev) => {
          const updated = { ...prev };
          if (data.teams && Array.isArray(data.teams)) {
            data.teams.forEach((t: Team) => {
              if (updated[t.id]) {
                updated[t.id] = { ...updated[t.id], badgeUrl: t.badgeUrl };
              }
            });
          } else if (data.updatedTeamId && data.badgeUrl) {
            if (updated[data.updatedTeamId]) {
              updated[data.updatedTeamId] = {
                ...updated[data.updatedTeamId],
                badgeUrl: data.badgeUrl
              };
            }
          }
          return updated;
        });
      } catch (err) {
        console.error('Error parsing teams_update:', err);
      }
    });

    es.addEventListener('match_update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.matches) {
          setMatches(data.matches);
        } else if (data.match) {
          setMatches((prev) =>
            prev.map((m) => (m.id === data.match.id ? data.match : m))
          );
        }
        setLastUpdatedTime(new Date().toLocaleTimeString('es-MX'));
      } catch (err) {
        console.error('Error parsing match_update:', err);
      }
    });

    es.addEventListener('ticker_update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.matches) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error('Error parsing ticker_update:', err);
      }
    });

    es.addEventListener('goal_alert', (e: MessageEvent) => {
      try {
        const payload: GoalAlertPayload = JSON.parse(e.data);
        triggerGoalCelebration(payload);
      } catch (err) {
        console.error('Error parsing goal_alert:', err);
      }
    });

    es.addEventListener('settings_update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setSettings((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Error parsing settings_update:', err);
      }
    });

    es.addEventListener('client_count', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (typeof data.count === 'number') {
          setSettings((prev) => ({ ...prev, connectedClients: data.count }));
        }
      } catch {
        // Ignored
      }
    });

    es.addEventListener('api_sync', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.lastApiSync) {
          setSettings((prev) => ({ ...prev, lastApiSync: data.lastApiSync }));
        }
      } catch {
        // Ignored
      }
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reintento automático en 3 segundos
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(connectSSE, 3000);
    };
  }, [triggerGoalCelebration]);

  useEffect(() => {
    // Restaurar escudos personalizados guardados localmente
    try {
      const localCustom = JSON.parse(localStorage.getItem('ligamx_custom_badges') || '{}');
      if (Object.keys(localCustom).length > 0) {
        setTeams((prev) => {
          const updated = { ...prev };
          for (const [id, url] of Object.entries(localCustom)) {
            if (updated[id]) {
              updated[id] = { ...updated[id], badgeUrl: url as string };
            }
          }
          return updated;
        });
      }
    } catch {}

    fetchInitialData();
    connectSSE();

    // Registrar Service Worker para notificaciones en segundo plano
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Service worker registrado con alcance:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Service worker fallo de registro:', err);
        });
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [fetchInitialData, connectSSE]);

  return {
    teams,
    setTeams,
    matches,
    setMatches,
    settings,
    setSettings,
    isConnected,
    activeGoalAlert,
    setActiveGoalAlert,
    lastUpdatedTime,
    triggerGoalCelebration,
    refreshData: fetchInitialData
  };
}
