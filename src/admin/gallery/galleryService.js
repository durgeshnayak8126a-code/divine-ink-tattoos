import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore/lite';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { getFirestoreDb, getFirebaseStorage } from '../../firebase/config.js';
import { FIRESTORE_COLLECTIONS } from '../../firebase/firestoreSchema.js';
import { galleryStoragePath } from '../../firebase/storagePaths.js';

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
}

function invalidatePublicCache() {
  try {
    sessionStorage.removeItem('divine-ink-gallery-cache-v1');
  } catch {
    // Cache invalidation is best-effort.
  }
}

export async function listGalleryItems() {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');

  const snapshot = await getDocs(
    collection(db, FIRESTORE_COLLECTIONS.gallery),
  );
  return snapshot.docs
    .map((galleryDocument) => ({
      id: galleryDocument.id,
      ...galleryDocument.data(),
    }))
    .sort(
      (a, b) =>
        timestampValue(b.updatedAt || b.createdAt) -
        timestampValue(a.updatedAt || a.createdAt),
    );
}

export async function uploadGalleryImage(file, folder) {
  const storage = await getFirebaseStorage();
  if (!storage) throw new Error('Firebase Storage is not configured.');

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const storageRef = ref(storage, galleryStoragePath(folder, uniqueName));
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    cacheControl: 'public,max-age=31536000,immutable',
  });
  return getDownloadURL(storageRef);
}

export async function createGalleryItem(values) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured.');

  const result = await addDoc(collection(db, FIRESTORE_COLLECTIONS.gallery), {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidatePublicCache();
  return result.id;
}

export async function updateGalleryItem(itemId, values) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured.');

  await updateDoc(doc(db, FIRESTORE_COLLECTIONS.gallery, itemId), {
    ...values,
    updatedAt: serverTimestamp(),
  });
  invalidatePublicCache();
}

async function deleteStoredImage(url) {
  if (!url) return;
  const storage = await getFirebaseStorage();
  if (!storage) throw new Error('Firebase Storage is not configured.');

  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') throw error;
  }
}

export async function deleteGalleryItem(item) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured.');

  await Promise.all([
    deleteStoredImage(item.image),
    deleteStoredImage(item.beforeImage),
    deleteStoredImage(item.afterImage),
  ]);
  await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.gallery, item.id));
  invalidatePublicCache();
}

export async function deleteReplacedImages(urls) {
  await Promise.all(urls.filter(Boolean).map(deleteStoredImage));
}
