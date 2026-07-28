import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore/lite';
import { getFirestoreDb } from '../../firebase/config.js';

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
}

async function requireDb() {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');
  return db;
}

export async function listCmsDocuments(collectionName) {
  const db = await requireDb();
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

export async function createCmsDocument(collectionName, values) {
  const db = await requireDb();
  return addDoc(collection(db, collectionName), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCmsDocument(collectionName, id, values) {
  const db = await requireDb();
  return updateDoc(doc(db, collectionName, id), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCmsDocument(collectionName, id) {
  const db = await requireDb();
  return deleteDoc(doc(db, collectionName, id));
}

export async function getSettingsDocument(documentId) {
  const db = await requireDb();
  const snapshot = await getDoc(doc(db, 'siteSettings', documentId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveSettingsDocument(documentId, values) {
  const db = await requireDb();
  return setDoc(
    doc(db, 'siteSettings', documentId),
    { ...values, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
