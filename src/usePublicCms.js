import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from './firebase/env.js';

const initialState = {
  homepage: null,
  contact: null,
  seo: null,
  services: [],
  faqs: [],
};

function timestampValue(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  return 0;
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
        const [homepage, contact, seo, serviceSnapshot, faqSnapshot] = await Promise.all([
          getDoc(doc(db, 'siteSettings', 'homepage')),
          getDoc(doc(db, 'siteSettings', 'contact')),
          getDoc(doc(db, 'siteSettings', 'seo')),
          getDocs(query(collection(db, 'services'), where('active', '==', true))),
          getDocs(query(collection(db, 'faqs'), where('published', '==', true))),
        ]);
        if (!active) return;
        setContent({
          homepage: homepage.exists() ? homepage.data() : null,
          contact: contact.exists() ? contact.data() : null,
          seo: seo.exists() ? seo.data() : null,
          services: serviceSnapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt)),
          faqs: faqSnapshot.docs
            .map((item) => ({ id: item.id, ...item.data() }))
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
        });
      } catch {
        // The production fallback remains unchanged if CMS data is unavailable.
      }
    }

    load();
    return () => { active = false; };
  }, []);

  return content;
}

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element && value) element.setAttribute(attribute, value);
}

export function useManagedSeo(seo) {
  useEffect(() => {
    if (!seo) return;
    if (seo.metaTitle) document.title = seo.metaTitle;
    setMeta('meta[name="description"]', 'content', seo.metaDescription);
    setMeta('meta[property="og:title"]', 'content', seo.metaTitle);
    setMeta('meta[property="og:description"]', 'content', seo.metaDescription);
    setMeta('meta[property="og:image"]', 'content', seo.ogImage);
    setMeta('meta[name="robots"]', 'content', seo.robots);
    setMeta('link[rel="canonical"]', 'href', seo.canonical);
    if (seo.schema && typeof seo.schema === 'object') {
      const schemaElement = document.head.querySelector('script[type="application/ld+json"]');
      if (schemaElement) schemaElement.textContent = JSON.stringify(seo.schema).replaceAll('<', '\\u003c');
    }
  }, [seo]);
}
