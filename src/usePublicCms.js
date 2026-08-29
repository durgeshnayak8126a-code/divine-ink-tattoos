import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from './firebase/env.js';

const PIERCING_UPDATE_KEY = 'divine-ink-piercing-updated-at';
const CMS_PREVIEW_UPDATE_KEY = 'divine-ink-cms-preview-updated-at';
const PREVIEW_PREFIX = 'divine-ink-cms-preview-v1';

const initialState = {
  homepage: null,
  contact: null,
  seo: null,
  services: [],
  faqs: [],
  reviews: [],
  offers: [],
};

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  if (typeof value === 'number') return value;
  return 0;
}

function isPreviewHost() {
  if (typeof window === 'undefined') return false;
  return !['divineinktattoos.in', 'www.divineinktattoos.in'].includes(window.location.hostname);
}

function readPreviewValue(key) {
  if (!isPreviewHost()) return null;
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function previewCollection(name, fallback) {
  const stored = readPreviewValue(`${PREVIEW_PREFIX}:collection:${name}`);
  return Array.isArray(stored) ? stored : fallback;
}

function previewSettings(name, fallback) {
  const stored = readPreviewValue(`${PREVIEW_PREFIX}:settings:${name}`);
  return stored && typeof stored === 'object' ? stored : fallback;
}

export function usePublicCms() {
  const [content, setContent] = useState(initialState);

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    let active = true;

    async function load() {
      try {
        const [{ collection, doc, getDoc, getDocs, query, where }, { getFirestoreDb }] =
          await Promise.all([
            import('firebase/firestore/lite'),
            import('./firebase/config.js'),
          ]);
        const db = await getFirestoreDb();
        if (!db) return;
        const [homepage, contact, seo, serviceSnapshot, faqSnapshot, reviewSnapshot, offerSnapshot] = await Promise.all([
          getDoc(doc(db, 'siteSettings', 'homepage')),
          getDoc(doc(db, 'siteSettings', 'contact')),
          getDoc(doc(db, 'siteSettings', 'seo')),
          getDocs(query(collection(db, 'services'), where('active', '==', true))),
          getDocs(query(collection(db, 'faqs'), where('published', '==', true))),
          getDocs(query(collection(db, 'reviews'), where('published', '==', true))),
          getDocs(query(collection(db, 'offers'), where('active', '==', true))),
        ]);
        if (!active) return;

        const remoteServices = serviceSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const remoteFaqs = faqSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const remoteReviews = reviewSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        const remoteOffers = offerSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

        setContent({
          homepage: previewSettings('homepage', homepage.exists() ? homepage.data() : null),
          contact: previewSettings('contact', contact.exists() ? contact.data() : null),
          seo: previewSettings('seo', seo.exists() ? seo.data() : null),
          services: previewCollection('services', remoteServices)
            .filter((item) => item.active !== false)
            .sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt)),
          faqs: previewCollection('faqs', remoteFaqs)
            .filter((item) => item.published !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
          reviews: previewCollection('reviews', remoteReviews)
            .filter((item) => item.published !== false)
            .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || timestampValue(b.updatedAt) - timestampValue(a.updatedAt)),
          offers: previewCollection('offers', remoteOffers)
            .filter((item) => item.active !== false)
            .sort((a, b) => String(a.endDate || '').localeCompare(String(b.endDate || ''))),
        });
      } catch {
        // The production fallback remains unchanged if CMS data is unavailable.
      }
    }

    const handleStorage = (event) => {
      if (event.key === PIERCING_UPDATE_KEY || event.key === CMS_PREVIEW_UPDATE_KEY) load();
    };
    window.addEventListener('storage', handleStorage);
    load();
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return content;
}

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element && value) element.setAttribute(attribute, value);
}

function safeCanonical(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.startsWith('https://divineinktattoos.in/') ? trimmed : '';
}

function safeRobots(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.includes('noindex') || normalized.includes('nofollow')) return '';
  return value.trim();
}

export function useManagedSeo(seo) {
  useEffect(() => {
    if (!seo) return undefined;

    const previousTitle = document.title;
    const canonicalElement = document.head.querySelector('link[rel="canonical"]');
    const previousCanonical = canonicalElement?.getAttribute('href') || '';
    const robotsElement = document.head.querySelector('meta[name="robots"]');
    const previousRobots = robotsElement?.getAttribute('content') || '';

    if (seo.metaTitle) document.title = seo.metaTitle;
    setMeta('meta[name="description"]', 'content', seo.metaDescription);
    setMeta('meta[property="og:title"]', 'content', seo.metaTitle);
    setMeta('meta[property="og:description"]', 'content', seo.metaDescription);
    if (typeof seo.ogImage === 'string' && seo.ogImage.trim().startsWith('https://')) {
      setMeta('meta[property="og:image"]', 'content', seo.ogImage.trim());
    }

    const canonical = safeCanonical(seo.canonical);
    if (canonical && canonicalElement) canonicalElement.setAttribute('href', canonical);
    const robots = safeRobots(seo.robots);
    if (robots && robotsElement) robotsElement.setAttribute('content', robots);

    const existingManagedSchema = document.head.querySelector('#admin-managed-seo-schema');
    existingManagedSchema?.remove();
    let managedSchema = null;
    if (seo.schema && typeof seo.schema === 'object') {
      managedSchema = document.createElement('script');
      managedSchema.id = 'admin-managed-seo-schema';
      managedSchema.type = 'application/ld+json';
      managedSchema.textContent = JSON.stringify(seo.schema).replaceAll('<', '\\u003c');
      document.head.appendChild(managedSchema);
    }

    return () => {
      document.title = previousTitle;
      if (canonicalElement && previousCanonical) canonicalElement.setAttribute('href', previousCanonical);
      if (robotsElement && previousRobots) robotsElement.setAttribute('content', previousRobots);
      managedSchema?.remove();
    };
  }, [seo]);
}
