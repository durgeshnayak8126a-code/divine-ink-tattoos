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

export const CMS_PREVIEW_UPDATE_KEY = 'divine-ink-cms-preview-updated-at';
const PREVIEW_PREFIX = 'divine-ink-cms-preview-v1';

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  if (typeof value === 'number') return value;
  return 0;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function isCmsPreviewMode() {
  if (typeof window === 'undefined') return false;
  return !['divineinktattoos.in', 'www.divineinktattoos.in'].includes(window.location.hostname);
}

function collectionStorageKey(collectionName) {
  return `${PREVIEW_PREFIX}:collection:${collectionName}`;
}

function settingsStorageKey(documentId) {
  return `${PREVIEW_PREFIX}:settings:${documentId}`;
}

function readStored(key) {
  if (!canUseStorage()) return null;
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function writeStored(key, value) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem(CMS_PREVIEW_UPDATE_KEY, String(Date.now()));
}

async function requireDb() {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');
  return db;
}

async function listRemoteDocuments(collectionName) {
  const db = await requireDb();
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function sortDocuments(items) {
  return [...items].sort((a, b) => timestampValue(b.updatedAt) - timestampValue(a.updatedAt));
}

export async function listCmsDocuments(collectionName) {
  const remote = await listRemoteDocuments(collectionName);
  if (!isCmsPreviewMode()) return sortDocuments(remote);
  const stored = readStored(collectionStorageKey(collectionName));
  return sortDocuments(Array.isArray(stored) ? stored : remote);
}

export async function createCmsDocument(collectionName, values) {
  if (isCmsPreviewMode()) {
    const current = await listCmsDocuments(collectionName);
    const now = Date.now();
    const created = {
      id: `preview-${now}-${Math.random().toString(36).slice(2, 8)}`,
      ...values,
      createdAt: now,
      updatedAt: now,
    };
    writeStored(collectionStorageKey(collectionName), [created, ...current]);
    return created;
  }

  const db = await requireDb();
  return addDoc(collection(db, collectionName), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCmsDocument(collectionName, id, values) {
  if (isCmsPreviewMode()) {
    const current = await listCmsDocuments(collectionName);
    const next = current.map((item) => item.id === id ? { ...item, ...values, updatedAt: Date.now() } : item);
    writeStored(collectionStorageKey(collectionName), next);
    return;
  }

  const db = await requireDb();
  return updateDoc(doc(db, collectionName, id), {
    ...values,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCmsDocument(collectionName, id) {
  if (isCmsPreviewMode()) {
    const current = await listCmsDocuments(collectionName);
    writeStored(collectionStorageKey(collectionName), current.filter((item) => item.id !== id));
    return;
  }

  const db = await requireDb();
  return deleteDoc(doc(db, collectionName, id));
}

async function getRemoteSettingsDocument(documentId) {
  const db = await requireDb();
  const snapshot = await getDoc(doc(db, 'siteSettings', documentId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function getSettingsDocument(documentId) {
  const remote = await getRemoteSettingsDocument(documentId);
  if (!isCmsPreviewMode()) return remote;
  const stored = readStored(settingsStorageKey(documentId));
  return stored && typeof stored === 'object' ? stored : remote;
}

export async function saveSettingsDocument(documentId, values) {
  if (isCmsPreviewMode()) {
    const current = await getSettingsDocument(documentId);
    const next = { ...(current || {}), ...values, updatedAt: Date.now() };
    writeStored(settingsStorageKey(documentId), next);
    return next;
  }

  const db = await requireDb();
  return setDoc(
    doc(db, 'siteSettings', documentId),
    { ...values, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
