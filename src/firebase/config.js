import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './env.js';

export { isFirebaseConfigured } from './env.js';

export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export async function getFirestoreDb() {
  if (!firebaseApp) return null;
  const { getFirestore } = await import('firebase/firestore/lite');
  return getFirestore(firebaseApp);
}

export async function getFirebaseStorage() {
  if (!firebaseApp) return null;
  const { getStorage } = await import('firebase/storage');
  return getStorage(firebaseApp);
}
