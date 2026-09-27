import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, onValue, set, update } from 'firebase/database';
import { isFirebaseConfigValid } from './firebaseFirestore';

export interface FirebaseCustomConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Configuración opcional desde variables de entorno
const envConfig: FirebaseCustomConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let firebaseApp: FirebaseApp | null = null;
let firebaseDb: Database | null = null;

export function initFirebase(customConfig?: FirebaseCustomConfig): Database | null {
  if (!isFirebaseConfigValid()) {
    return null;
  }
  const config = { ...envConfig, ...customConfig };

  if (!config.databaseURL && !config.projectId) {
    return null;
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config as any);
    } else {
      firebaseApp = getApps()[0];
    }

    if (config.databaseURL) {
      firebaseDb = getDatabase(firebaseApp, config.databaseURL);
    } else {
      firebaseDb = getDatabase(firebaseApp);
    }

    return firebaseDb;
  } catch (err) {
    console.warn('Firebase RTDB inicialización notice:', err);
    return null;
  }
}

export function getActiveFirebaseDb(): Database | null {
  if (firebaseDb) return firebaseDb;
  return initFirebase();
}

/**
 * Escucha cambios en tiempo real en la colección 'matches' de Firebase Realtime Database
 */
export function subscribeToFirebaseMatches(callback: (matches: any[]) => void): (() => void) | null {
  const db = getActiveFirebaseDb();
  if (!db) return null;

  try {
    const matchesRef = ref(db, 'ligamx/matches');
    const unsubscribe = onValue(matchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Array.isArray(data) ? data : Object.values(data);
        callback(list);
      }
    });
    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to Firebase RTDB:', err);
    return null;
  }
}

/**
 * Actualiza un partido en Firebase Realtime Database
 */
export async function updateFirebaseMatch(matchId: string, matchData: any): Promise<boolean> {
  const db = getActiveFirebaseDb();
  if (!db) return false;

  try {
    const matchRef = ref(db, `ligamx/matches/${matchId}`);
    await update(matchRef, {
      ...matchData,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('Error updating Firebase RTDB match:', err);
    return false;
  }
}
