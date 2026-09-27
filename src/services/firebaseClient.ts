import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, onSnapshot, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: The app uses the provisioned firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Validar conexión a Firestore al inicio
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'public'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Verificando configuración de Firestore.");
    }
  }
}
testFirestoreConnection();

/**
 * Escucha en tiempo real partidos sincronizados en Firestore
 */
export function subscribeFirestoreMatches(callback: (matches: any[]) => void) {
  try {
    const unsub = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        const matches: any[] = [];
        snapshot.forEach((doc) => {
          matches.push({ id: doc.id, ...doc.data() });
        });
        if (matches.length > 0) {
          callback(matches);
        }
      },
      (error) => {
        console.warn('Firestore snapshot notice:', error.message);
      }
    );
    return unsub;
  } catch (err) {
    console.warn('Error subscribing to Firestore:', err);
    return () => {};
  }
}
