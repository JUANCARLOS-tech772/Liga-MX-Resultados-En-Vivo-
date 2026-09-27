/**
 * Servicio Mock/Local de Firebase Firestore para persistencia en tiempo real y Control Manual Total
 * Proyecto desvinculado de Firebase para evitar dependencias lentas, timeouts e hilos de red colgados.
 */

import { Match, AppSettings } from '../types';

export const configValid = false;
export const db = null as any;
export const auth = null as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function isFirebaseConfigValid(): boolean {
  return false;
}

/**
 * Guarda o actualiza un partido completo (Marcador, Minuto, Estado, Eventos, Estadísticas)
 * Guardamos a la API de nuestro servidor Express local.
 */
export async function saveMatchToFirestore(match: Match): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/match/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'ligamx2026', // Contraseña admin por defecto
        matchId: match.id,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        minute: match.minute,
        status: match.status,
        period: match.period,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        stadium: match.stadium,
        date: match.date,
        time: match.time
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Guarda o actualiza múltiples partidos
 */
export async function saveMatchesToFirestore(matches: Match[]): Promise<boolean> {
  try {
    await Promise.all(matches.map(m => saveMatchToFirestore(m)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un partido
 */
export async function deleteMatchFromFirestore(matchId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/match/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'ligamx2026',
        matchId
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Escucha cambios en todos los partidos desde Firestore (Mocked: usamos las actualizaciones SSE directo de Express)
 */
export function subscribeToFirestoreMatches(onUpdate: (matches: Match[]) => void): () => void {
  return () => {};
}

/**
 * Guarda o actualiza el escudo de base de un equipo
 */
export async function saveTeamBadgeToFirestore(teamId: string, badgeUrl: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/badge/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'ligamx2026',
        teamId,
        badgeUrl
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Escucha cambios en los escudos de los equipos (Mocked)
 */
export function subscribeToFirestoreBadges(onUpdate: (badges: Record<string, string>) => void): () => void {
  return () => {};
}

/**
 * Guarda configuración global de la app
 */
export async function saveSettingsToFirestore(settings: Partial<AppSettings>): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'ligamx2026',
        showAdminToPublic: settings.showAdminToPublic
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Escucha configuración global (Mocked)
 */
export function subscribeToFirestoreSettings(onUpdate: (settings: Partial<AppSettings>) => void): () => void {
  return () => {};
}
