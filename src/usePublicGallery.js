import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from './firebase/env.js';

const CACHE_KEY = 'divine-ink-gallery-cache-v1';
const CACHE_TTL = 5 * 60 * 1000;
let memoryCache = null;

function readCache() {
  if (memoryCache && Date.now() - memoryCache.savedAt < CACHE_TTL) {
    return memoryCache.items;
  }

  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    if (
      Array.isArray(cached?.items) &&
      Date.now() - cached.savedAt < CACHE_TTL
    ) {
      memoryCache = cached;
      return cached.items;
    }
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
  }

  return null;
}

function writeCache(items) {
  memoryCache = { items, savedAt: Date.now() };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
  } catch {
    // Memory caching remains available when sessionStorage is unavailable.
  }
}

function clearCache() {
  memoryCache = null;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Memory cache is still cleared when sessionStorage is unavailable.
  }
}

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
}

export function usePublicGallery(fallbackItems) {
  const [items, setItems] = useState(() => readCache() || fallbackItems);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;

    let active = true;

    async function loadGallery() {
      try {
        const [{ collection, getDocs, query, where }, { getFirestoreDb }] =
          await Promise.all([
            import('firebase/firestore/lite'),
            import('./firebase/config.js'),
          ]);
        const db = await getFirestoreDb();
        if (!db) return;

        const snapshot = await getDocs(
          query(collection(db, 'gallery'), where('published', '==', true)),
        );
        const publishedItems = snapshot.docs
          .map((document) => ({ id: document.id, ...document.data() }))
          .filter((item) => Boolean(item.image && item.title && item.altText))
          .sort((a, b) => {
            if (a.featured !== b.featured) return a.featured ? -1 : 1;
            return timestampValue(b.createdAt) - timestampValue(a.createdAt);
          });

        if (!active) return;

        if (publishedItems.length > 0) {
          writeCache(publishedItems);
          setItems(publishedItems);
          return;
        }

        clearCache();
        setItems(fallbackItems);
      } catch {
        // Preserve the current production gallery if Firebase is unavailable.
      }
    }

    loadGallery();
    return () => {
      active = false;
    };
  }, [fallbackItems]);

  return items;
}
