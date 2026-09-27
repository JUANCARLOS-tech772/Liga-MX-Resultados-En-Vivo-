/**
 * Servicio de Notificaciones Push y Alertas en Tiempo Real (Estilo SofaScore)
 * Soporta configuración por partidos específicos, clubes favoritos y preferencias guardadas en localStorage.
 */

const STORAGE_PREFS_KEY = 'ligamx_notification_preferences_v2';
const LEGACY_STORAGE_KEY = 'ligamx_notifications_enabled';

export interface NotificationPreferences {
  globalEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  mode: 'all_matches' | 'selected_only'; // 'all_matches' (notificar todos excepto silenciados) | 'selected_only' (notificar solo los marcados o favoritos)
  subscribedMatchIds: string[]; // Partidos específicos con alerta activa
  mutedMatchIds: string[]; // Partidos específicos silenciados
  favoriteTeamIds: string[]; // Clubes favoritos (reciben alerta automáticamente)
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  globalEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  mode: 'all_matches',
  subscribedMatchIds: [],
  mutedMatchIds: [],
  favoriteTeamIds: []
};

/**
 * Obtiene las preferencias completas de notificaciones desde localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_PREFS_KEY);
    if (!raw) {
      // Migración desde clave legacy si existe
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      const isLegacyEnabled = legacy !== null ? legacy === 'true' : true;
      const initial = { ...DEFAULT_PREFERENCES, globalEnabled: isLegacyEnabled };
      saveNotificationPreferences(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      subscribedMatchIds: Array.isArray(parsed.subscribedMatchIds) ? parsed.subscribedMatchIds : [],
      mutedMatchIds: Array.isArray(parsed.mutedMatchIds) ? parsed.mutedMatchIds : [],
      favoriteTeamIds: Array.isArray(parsed.favoriteTeamIds) ? parsed.favoriteTeamIds : []
    };
  } catch (err) {
    console.warn('Error reading notification preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Guarda las preferencias completas de notificaciones en localStorage
 */
export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
    localStorage.setItem(LEGACY_STORAGE_KEY, prefs.globalEnabled ? 'true' : 'false');
    // Disparar evento personalizado para sincronización reactiva en componentes
    window.dispatchEvent(new CustomEvent('ligamx_notification_prefs_changed', { detail: prefs }));
  } catch (err) {
    console.warn('Error saving notification preferences:', err);
  }
}

/**
 * Comprueba si las notificaciones globales están activadas
 */
export function isNotificationsEnabled(): boolean {
  return getNotificationPreferences().globalEnabled;
}

/**
 * Activa o desactiva las notificaciones globales
 */
export function setNotificationsEnabled(enabled: boolean): void {
  const prefs = getNotificationPreferences();
  prefs.globalEnabled = enabled;
  saveNotificationPreferences(prefs);
}

/**
 * Verifica si un partido específico tiene activadas las notificaciones según las reglas del usuario:
 * 1. Si globalEnabled es false -> false
 * 2. Si el partido está en mutedMatchIds -> false
 * 3. Si el modo es 'selected_only':
 *    - true si matchId está en subscribedMatchIds
 *    - true si alguno de los equipos (homeTeamId / awayTeamId) es club favorito
 *    - false en caso contrario
 * 4. Si el modo es 'all_matches' -> true (salvo que esté silenciado)
 */
export function isMatchNotificationEnabled(
  matchId: string,
  homeTeamId?: string,
  awayTeamId?: string
): boolean {
  const prefs = getNotificationPreferences();
  if (!prefs.globalEnabled) return false;

  // Si fue silenciado explícitamente
  if (prefs.mutedMatchIds.includes(matchId)) return false;

  // Si el partido está explícitamente suscrito
  if (prefs.subscribedMatchIds.includes(matchId)) return true;

  // Si alguno de los equipos es favorito
  if (
    (homeTeamId && prefs.favoriteTeamIds.includes(homeTeamId)) ||
    (awayTeamId && prefs.favoriteTeamIds.includes(awayTeamId))
  ) {
    return true;
  }

  // En modo todos los partidos, devuelve true por defecto
  if (prefs.mode === 'all_matches') {
    return true;
  }

  return false;
}

/**
 * Alterna la suscripción / silenciado de un partido específico
 * Retorna el nuevo estado (true = activo, false = inactivo)
 */
export function toggleMatchNotification(
  matchId: string,
  homeTeamId?: string,
  awayTeamId?: string
): boolean {
  const prefs = getNotificationPreferences();
  const currentlyActive = isMatchNotificationEnabled(matchId, homeTeamId, awayTeamId);

  if (currentlyActive) {
    // Desactivar: quitar de suscritos y agregar a silenciados
    prefs.subscribedMatchIds = prefs.subscribedMatchIds.filter(id => id !== matchId);
    if (!prefs.mutedMatchIds.includes(matchId)) {
      prefs.mutedMatchIds.push(matchId);
    }
  } else {
    // Activar: quitar de silenciados y agregar a suscritos
    prefs.mutedMatchIds = prefs.mutedMatchIds.filter(id => id !== matchId);
    if (!prefs.subscribedMatchIds.includes(matchId)) {
      prefs.subscribedMatchIds.push(matchId);
    }
  }

  saveNotificationPreferences(prefs);
  return !currentlyActive;
}

/**
 * Alterna un equipo como favorito (suscribe automáticamente a sus partidos)
 */
export function toggleFavoriteTeam(teamId: string): boolean {
  const prefs = getNotificationPreferences();
  const index = prefs.favoriteTeamIds.indexOf(teamId);
  let isFavorite = false;

  if (index >= 0) {
    prefs.favoriteTeamIds.splice(index, 1);
    isFavorite = false;
  } else {
    prefs.favoriteTeamIds.push(teamId);
    isFavorite = true;
  }

  saveNotificationPreferences(prefs);
  return isFavorite;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<{
  permission: NotificationPermission;
  isIframeBlocked: boolean;
}> {
  if (!isNotificationSupported()) {
    return { permission: 'denied', isIframeBlocked: false };
  }

  const inIframe = typeof window !== 'undefined' && window.self !== window.top;

  try {
    const permission = await Notification.requestPermission();
    return { permission, isIframeBlocked: inIframe && permission !== 'granted' };
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return { permission: 'denied', isIframeBlocked: inIframe };
  }
}

export interface ShowGoalNotificationParams {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  matchId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
}

/**
 * Dispara la Notificación Push nativa respetando las preferencias del usuario por partido
 */
export async function showNativeGoalNotification({
  title,
  body,
  icon,
  badge,
  url = '/',
  matchId,
  homeTeamId,
  awayTeamId
}: ShowGoalNotificationParams): Promise<boolean> {
  const prefs = getNotificationPreferences();

  // Verificar si las notificaciones están permitidas para este partido específico
  if (matchId && !isMatchNotificationEnabled(matchId, homeTeamId, awayTeamId)) {
    return false;
  }

  if (!prefs.globalEnabled) {
    return false;
  }

  // Vibrar en dispositivos móviles compatibles
  if (prefs.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([300, 100, 300, 100, 400]);
    } catch {}
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notificationOptions: any = {
    body,
    icon: icon || '/teams/america.png',
    badge: badge || '/icon.svg',
    tag: `goal-${matchId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 400],
    data: { url }
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.active) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }

    new Notification(title, notificationOptions);
    return true;
  } catch (err) {
    console.warn('Error displaying native push notification:', err);
    return false;
  }
}
