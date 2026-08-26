import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore/lite';
import { firebaseAuth, getFirestoreDb } from '../../firebase/config.js';
import { FIRESTORE_COLLECTIONS } from '../../firebase/firestoreSchema.js';
import { isValidGalleryCategory } from './galleryCategories.js';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
const GALLERY_MIGRATION_VERSION = 1;
const LEGACY_ORDER_BASE = Date.UTC(2000, 0, 1);

export const GALLERY_UPLOAD_FOLDERS = Object.freeze({
  gallery: 'gallery',
  beforeAfter: 'before-after',
  featured: 'featured',
});

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
}

function invalidatePublicCache() {
  try {
    sessionStorage.removeItem('divine-ink-gallery-cache-v1');
    sessionStorage.removeItem('divine-ink-gallery-cache-v2');
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

export async function migrateFallbackGalleryItems(fallbackItems) {
  const db = await getFirestoreDb();
  if (!db) throw new Error('Firebase is not configured.');

  const homepageRef = doc(db, FIRESTORE_COLLECTIONS.siteSettings, 'homepage');
  const homepageSnapshot = await getDoc(homepageRef);
  const migrationVersion = Number(homepageSnapshot.data()?.galleryMigrationVersion || 0);
  if (migrationVersion >= GALLERY_MIGRATION_VERSION) {
    return { migrated: 0, complete: true };
  }

  const gallerySnapshot = await getDocs(
    collection(db, FIRESTORE_COLLECTIONS.gallery),
  );
  const existingIds = new Set(gallerySnapshot.docs.map((item) => item.id));
  const existingImages = new Set(
    gallerySnapshot.docs.map((item) => item.data()?.image).filter(Boolean),
  );

  const missingItems = fallbackItems.filter(
    (item) => !existingIds.has(item.id) && !existingImages.has(item.image),
  );

  const batch = writeBatch(db);
  missingItems.forEach((item, index) => {
    const legacyTimestamp = Timestamp.fromMillis(LEGACY_ORDER_BASE - index);
    batch.set(doc(db, FIRESTORE_COLLECTIONS.gallery, item.id), {
      image: item.image,
      beforeImage: '',
      afterImage: '',
      title: item.title || item.category || 'Gallery item',
      category: item.category || 'Tattoo',
      bodyPart: '',
      tattooStyle: '',
      artist: '',
      price: '',
      altText: item.altText || item.title || item.category || 'Gallery image',
      description: '',
      featured: false,
      createdAt: legacyTimestamp,
      updatedAt: legacyTimestamp,
      published: true,
    });
  });

  batch.set(
    homepageRef,
    {
      galleryMigrationVersion: GALLERY_MIGRATION_VERSION,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  invalidatePublicCache();
  return { migrated: missingItems.length, complete: true };
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
  if (!isValidGalleryCategory(values.category)) {
    throw new Error('Select a valid gallery category.');
  }
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
  if (
    Object.prototype.hasOwnProperty.call(values, 'category') &&
    !isValidGalleryCategory(values.category)
  ) {
    throw new Error('Select a valid gallery category.');
  }
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

  const currentUser = firebaseAuth?.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as an admin to delete images.');
  }
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
