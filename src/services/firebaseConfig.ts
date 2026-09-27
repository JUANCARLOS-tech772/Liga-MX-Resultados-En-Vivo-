/**
 * Servicio Mock de Firebase Realtime Database para persistencia en tiempo real y Control Manual Total
 * Proyecto desvinculado de Firebase para evitar hilos colgando, timeouts y dependencias lentas.
 */

export interface FirebaseCustomConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function initFirebase(customConfig?: FirebaseCustomConfig): any {
  return null;
}

export function getActiveFirebaseDb(): any {
  return null;
}

/**
 * Escucha cambios en tiempo real (Mocked: toda la transmisión en tiempo real se realiza mediante Server-Sent Events / SSE)
 */
export function subscribeToFirebaseMatches(callback: (matches: any[]) => void): (() => void) | null {
  return null;
}

/**
 * Actualiza un partido en Firebase (Mocked)
 */
export async function updateFirebaseMatch(matchId: string, matchData: any): Promise<boolean> {
  return true;
}
