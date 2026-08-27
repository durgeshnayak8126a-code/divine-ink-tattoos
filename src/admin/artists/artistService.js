import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore/lite';
import { normalizeArtists } from '../../artists.js';
import { getFirestoreDb } from '../../firebase/config.js';
import { FIRESTORE_COLLECTIONS } from '../../firebase/firestoreSchema.js';
import { getSettingsDocument } from '../cms/cmsService.js';

function cleanArtist(artist) {
  return {
    id: String(artist.id || '').trim(),
    name: String(artist.name || '').trim(),
    role: String(artist.role || '').trim(),
    bio: String(artist.bio || '').trim(),
    image: String(artist.image || '').trim(),
    active: artist.active !== false,
  };
}

export async function loadArtists() {
  const homepage = await getSettingsDocument('homepage');
  return normalizeArtists(homepage?.artists);
}

export async function saveArtists(nextArtists, previousArtists) {
  const cleanedArtists = nextArtists.map(cleanArtist);
  const names = cleanedArtists.map((artist) => artist.name.toLowerCase());

  if (cleanedArtists.some((artist) => !artist.id || !artist.name)) {
    throw new Error('Every artist needs a name.');
  }
  if (new Set(names).size !== names.length) {
    throw new Error('Artist names must be unique.');
  }

  const db = await getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured.');

  const previousById = new Map(previousArtists.map((artist) => [artist.id, artist]));
  const nextById = new Map(cleanedArtists.map((artist) => [artist.id, artist]));
  const reassignmentMap = new Map();

  previousById.forEach((previousArtist, artistId) => {
    const nextArtist = nextById.get(artistId);
    if (!nextArtist) {
      if (previousArtist.name) reassignmentMap.set(previousArtist.name, '');
      return;
    }
    if (previousArtist.name && previousArtist.name !== nextArtist.name) {
      reassignmentMap.set(previousArtist.name, nextArtist.name);
    }
  });

  const batch = writeBatch(db);
  batch.set(
    doc(db, FIRESTORE_COLLECTIONS.siteSettings, 'homepage'),
    {
      artists: cleanedArtists,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  for (const [oldName, newName] of reassignmentMap.entries()) {
    const snapshot = await getDocs(
      query(
        collection(db, FIRESTORE_COLLECTIONS.gallery),
        where('artist', '==', oldName),
      ),
    );
    snapshot.docs.forEach((galleryDocument) => {
      batch.update(galleryDocument.ref, {
        artist: newName,
        updatedAt: serverTimestamp(),
      });
    });
  }

  await batch.commit();
  try {
    sessionStorage.removeItem('divine-ink-gallery-cache-v1');
    sessionStorage.removeItem('divine-ink-gallery-cache-v2');
  } catch {
    // Cache invalidation is best-effort.
  }

  return cleanedArtists;
}
