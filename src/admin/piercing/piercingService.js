import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
import { firebaseAuth, getFirestoreDb } from '../../firebase/config.js';
import { defaultPiercingItems, normalizePiercingItems } from '../../piercingData.js';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
const PREVIEW_STORAGE_KEY = 'divine-ink-piercing-preview-v1';

export function isPiercingPreviewMode() {
  if (typeof window === 'undefined') return true;
  return !['divineinktattoos.in', 'www.divineinktattoos.in'].includes(window.location.hostname);
}

function sanitizeItems(items) {
  return normalizePiercingItems(items).map((item, index) => ({
    id: item.id,
    title: item.title,
    builtinKey: item.builtinKey,
    image: item.image,
    active: Boolean(item.active),
    order: index,
  }));
}

function loadPreviewItems() {
  try {
    const stored = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? normalizePiercingItems(stored) : normalizePiercingItems(defaultPiercingItems);
  } catch {
    return normalizePiercingItems(defaultPiercingItems);
  }
}

export async function loadPiercingItems() {
  if (isPiercingPreviewMode()) return loadPreviewItems();

  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');
  const snapshot = await getDoc(doc(db, 'siteSettings', 'homepage'));
  const storedItems = snapshot.data()?.piercingItems;
  return normalizePiercingItems(Array.isArray(storedItems) ? storedItems : defaultPiercingItems);
}

export async function savePiercingItems(items) {
  const payload = sanitizeItems(items);

  if (isPiercingPreviewMode()) {
    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  }

  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');
  await setDoc(
    doc(db, 'siteSettings', 'homepage'),
    { piercingItems: payload, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return payload;
}

export async function uploadPiercingImage(file) {
  if (isPiercingPreviewMode()) {
    return URL.createObjectURL(file);
  }

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'divine-ink-tattoos/piercing');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: formData },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url) {
    throw new Error(result?.error?.message || 'Piercing image upload failed.');
  }
  return result.secure_url;
}

function cloudinaryPublicIdFromUrl(url) {
  if (!url || !url.includes('res.cloudinary.com')) return '';
  try {
    const parsedUrl = new URL(url);
    const marker = '/upload/';
    const markerIndex = parsedUrl.pathname.indexOf(marker);
    if (markerIndex === -1) return '';
    let assetPath = parsedUrl.pathname.slice(markerIndex + marker.length).replace(/^v\d+\//, '');
    return decodeURIComponent(assetPath.replace(/\.[^/.]+$/, ''));
  } catch {
    return '';
  }
}

export async function deletePiercingImage(url) {
  if (isPiercingPreviewMode()) {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    return;
  }

  const publicId = cloudinaryPublicIdFromUrl(url);
  if (!publicId) return;
  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) throw new Error('You must be signed in as an admin to delete images.');
  const idToken = await currentUser.getIdToken(true);
  const response = await fetch('/.netlify/functions/delete-cloudinary-image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Piercing image deletion failed.');
  }
}
