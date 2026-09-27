/**
 * Servicio de Firebase Firestore para persistencia en tiempo real y Control Manual Total
 * Proyecto: appreultados
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Match, AppSettings } from '../types';

/**
 * Valida si las credenciales de Firebase en el archivo de configuración son válidas y no marcadores de posición.
 */
export function isFirebaseConfigValid(): boolean {
  if (!firebaseConfig) return false;
  const apiKey = firebaseConfig.apiKey || '';
  const projectId = firebaseConfig.projectId || '';
  const appId = firebaseConfig.appId || '';

  if (!apiKey || !projectId || !appId) return false;

  // Si tiene placeholders o valores por defecto no válidos
  if (
    apiKey.includes('YOUR-') ||
    apiKey.includes('<') ||
    apiKey === 'placeholder' ||
    projectId.includes('YOUR-') ||
    projectId.includes('<') ||
    projectId === 'placeholder' ||
    appId.includes('YOUR-') ||
    appId.includes('<') ||
    appId === 'placeholder'
  ) {
    return false;
  }
  return true;
}

export const configValid = isFirebaseConfigValid();

let app: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;
let authInstance: Auth | undefined;

if (configValid) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    dbInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
    authInstance = getAuth(app);
  } catch (err) {
    console.warn('Error inicializando Firebase:', err);
  }
}

export const db: Firestore = dbInstance as Firestore;
export const auth: Auth = authInstance as Auth;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Guarda o actualiza un partido completo en Firestore (Marcador, Minuto, Estado, Eventos, Estadísticas)
 */
export async function saveMatchToFirestore(match: Match): Promise<boolean> {
  if (!configValid || !db) return false;
  const pathForWrite = `matches/${match.id}`;
  try {
    const docRef = doc(db, 'matches', match.id);
    await setDoc(docRef, {
      ...match,
      isManualOverride: true,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    return false;
  }
}

/**
 * Guarda o actualiza múltiples partidos en Firestore
 */
export async function saveMatchesToFirestore(matches: Match[]): Promise<boolean> {
  if (!configValid || !db) return false;
  try {
    await Promise.all(matches.map(m => saveMatchToFirestore(m)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Elimina un partido de Firestore
 */
export async function deleteMatchFromFirestore(matchId: string): Promise<boolean> {
  if (!configValid || !db) return false;
  const pathForDelete = `matches/${matchId}`;
  try {
    const docRef = doc(db, 'matches', matchId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pathForDelete);
    return false;
  }
}

/**
 * Escucha cambios en todos los partidos desde Firestore en tiempo real
 */
export function subscribeToFirestoreMatches(onUpdate: (matches: Match[]) => void): () => void {
  if (!configValid || !db) return () => {};
  const pathForOnSnapshot = 'matches';
  try {
    const colRef = collection(db, 'matches');
    return onSnapshot(colRef, (snapshot) => {
      const list: Match[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.id && data.homeTeamId && data.awayTeamId) {
          list.push(data as Match);
        }
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    return () => {};
  }
}

/**
 * Guarda o actualiza el escudo de base de un equipo en Firestore
 */
export async function saveTeamBadgeToFirestore(teamId: string, badgeUrl: string): Promise<boolean> {
  if (!configValid || !db) return false;
  const pathForWrite = `teamBadges/${teamId}`;
  try {
    const docRef = doc(db, 'teamBadges', teamId);
    await setDoc(docRef, {
      teamId,
      badgeUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    return false;
  }
}

/**
 * Escucha cambios en los escudos de los equipos desde Firestore
 */
export function subscribeToFirestoreBadges(onUpdate: (badges: Record<string, string>) => void): () => void {
  if (!configValid || !db) return () => {};
  const pathForOnSnapshot = 'teamBadges';
  try {
    const colRef = collection(db, 'teamBadges');
    return onSnapshot(colRef, (snapshot) => {
      const badges: Record<string, string> = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data && data.teamId && data.badgeUrl) {
          badges[data.teamId] = data.badgeUrl;
        }
      });
      onUpdate(badges);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    return () => {};
  }
}

/**
 * Guarda configuración global de la app en Firestore
 */
export async function saveSettingsToFirestore(settings: Partial<AppSettings>): Promise<boolean> {
  if (!configValid || !db) return false;
  const pathForWrite = `settings/general`;
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    return false;
  }
}

/**
 * Escucha configuración global desde Firestore
 */
export function subscribeToFirestoreSettings(onUpdate: (settings: Partial<AppSettings>) => void): () => void {
  if (!configValid || !db) return () => {};
  const pathForOnSnapshot = 'settings/general';
  try {
    const docRef = doc(db, 'settings', 'general');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as Partial<AppSettings>);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    return () => {};
  }
}
