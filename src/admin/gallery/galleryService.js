import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore/lite';
import { getFirestoreDb } from '../../firebase/config.js';
import { FIRESTORE_COLLECTIONS } from '../../firebase/firestoreSchema.js';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

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

function cloudinaryPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return '';

  try {
    const parsedUrl = new URL(url);
    const uploadMarker = '/upload/';
    const markerIndex = parsedUrl.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) return '';

    let assetPath = parsedUrl.pathname.slice(markerIndex + uploadMarker.length);
    assetPath = assetPath.replace(/^v\d+\//, '');
    return decodeURIComponent(assetPath.replace(/\.[^/.]+$/, ''));
  } catch {
    return '';
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
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `divine-ink-tattoos/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url) {
    throw new Error(result?.error?.message || 'Cloudinary image upload failed.');
  }

  return result.secure_url;
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
  const publicId = cloudinaryPublicIdFromUrl(url);
  if (!publicId) return;

  const response = await fetch('/.netlify/functions/delete-cloudinary-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Cloudinary image deletion failed.');
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
