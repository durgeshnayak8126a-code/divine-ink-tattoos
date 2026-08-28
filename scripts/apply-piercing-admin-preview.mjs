import { mkdir, readFile, writeFile } from 'node:fs/promises';

async function read(path) {
  return readFile(path, 'utf8');
}

async function write(path, content) {
  await writeFile(path, content, 'utf8');
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) {
    throw new Error(`Could not apply ${label}: expected source text was not found.`);
  }
  return content.replace(search, replacement);
}

await mkdir('src/admin/piercing', { recursive: true });

const piercingData = `import lobePiercing from './assets/piercing/lobe.jpg';
import helixPiercing from './assets/piercing/helix.jpg';
import septumPiercing from './assets/piercing/septum.jpg';
import bellyPiercing from './assets/piercing/belly.jpg';
import lipPiercing from './assets/piercing/lip.jpg';
import tonguePiercing from './assets/piercing/tongue.jpg';
import nosePiercing from './assets/piercing/nose.jpg';
import eyebrowPiercing from './assets/piercing/eyebrow.jpg';

const builtinPiercingImages = Object.freeze({
  lobe: lobePiercing,
  helix: helixPiercing,
  septum: septumPiercing,
  nose: nosePiercing,
  belly: bellyPiercing,
  eyebrow: eyebrowPiercing,
  lip: lipPiercing,
  tongue: tonguePiercing,
});

export const defaultPiercingItems = Object.freeze([
  { id: 'builtin-lobe', title: 'Lobe Piercing', builtinKey: 'lobe', image: '', active: true, order: 0 },
  { id: 'builtin-helix', title: 'Helix Piercing', builtinKey: 'helix', image: '', active: true, order: 1 },
  { id: 'builtin-septum', title: 'Septum Piercing', builtinKey: 'septum', image: '', active: true, order: 2 },
  { id: 'builtin-nose', title: 'Nose Piercing', builtinKey: 'nose', image: '', active: true, order: 3 },
  { id: 'builtin-belly', title: 'Belly Piercing', builtinKey: 'belly', image: '', active: true, order: 4 },
  { id: 'builtin-eyebrow', title: 'Eyebrow Piercing', builtinKey: 'eyebrow', image: '', active: true, order: 5 },
  { id: 'builtin-lip', title: 'Lip Piercing', builtinKey: 'lip', image: '', active: true, order: 6 },
  { id: 'builtin-tongue', title: 'Tongue Piercing', builtinKey: 'tongue', image: '', active: true, order: 7 },
]);

export function normalizePiercingItems(items) {
  const source = Array.isArray(items) ? items : defaultPiercingItems;
  return source
    .map((item, index) => ({
      id: String(item?.id || \`piercing-\${index + 1}\`),
      title: String(item?.title || '').trim(),
      builtinKey: String(item?.builtinKey || '').trim(),
      image: String(item?.image || '').trim(),
      active: item?.active !== false,
      order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getPiercingImage(item) {
  return item?.image || builtinPiercingImages[item?.builtinKey] || '';
}

export function getPublicPiercingGallery(items) {
  return normalizePiercingItems(items)
    .filter((item) => item.active && item.title && getPiercingImage(item))
    .map((item) => [getPiercingImage(item), item.title]);
}
`;
await write('src/piercingData.js', piercingData);

const piercingService = `import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite';
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
    \`https://api.cloudinary.com/v1_1/\${encodeURIComponent(cloudName)}/image/upload\`,
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
    let assetPath = parsedUrl.pathname.slice(markerIndex + marker.length).replace(/^v\\d+\\//, '');
    return decodeURIComponent(assetPath.replace(/\\.[^/.]+$/, ''));
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
      Authorization: \`Bearer \${idToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || 'Piercing image deletion failed.');
  }
}
`;
await write('src/admin/piercing/piercingService.js', piercingService);

const piercingPage = `import { useEffect, useMemo, useState } from 'react';
import { defaultPiercingItems, getPiercingImage, normalizePiercingItems } from '../../piercingData.js';
import AdminMeta from '../AdminMeta.jsx';
import {
  deletePiercingImage,
  isPiercingPreviewMode,
  loadPiercingItems,
  savePiercingItems,
  uploadPiercingImage,
} from './piercingService.js';

function newPiercingId() {
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  return \`piercing-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`;
}

export default function PiercingPage() {
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [pendingFiles, setPendingFiles] = useState({});
  const [pendingPreviews, setPendingPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const previewMode = isPiercingPreviewMode();

  useEffect(() => {
    let active = true;
    loadPiercingItems()
      .then((loaded) => {
        if (!active) return;
        const normalized = normalizePiercingItems(loaded);
        setItems(normalized);
        setOriginalItems(normalized);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Piercing items could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const originalImageByKey = useMemo(
    () => Object.fromEntries(defaultPiercingItems.map((item) => [item.builtinKey, getPiercingImage(item)])),
    [],
  );

  const updateItem = (id, changes) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    setSuccess('');
  };

  const addItem = () => {
    const id = newPiercingId();
    setItems((current) => [
      ...current,
      { id, title: 'New Piercing', builtinKey: '', image: '', active: true, order: current.length },
    ]);
    setSuccess('');
  };

  const removeItem = (id) => {
    if (!window.confirm('Remove this piercing item from the website list?')) return;
    setItems((current) => current.filter((item) => item.id !== id).map((item, index) => ({ ...item, order: index })));
    setPendingFiles((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setPendingPreviews((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setSuccess('');
  };

  const moveItem = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, order }));
    });
    setSuccess('');
  };

  const selectPhoto = (item, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingFiles((current) => ({ ...current, [item.id]: file }));
    setPendingPreviews((current) => {
      if (current[item.id]?.startsWith('blob:')) URL.revokeObjectURL(current[item.id]);
      return { ...current, [item.id]: previewUrl };
    });
    setSuccess('');
  };

  const useOriginalPhoto = (item) => {
    if (!item.builtinKey) return;
    updateItem(item.id, { image: '' });
    setPendingFiles((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });
    setPendingPreviews((current) => {
      if (current[item.id]?.startsWith('blob:')) URL.revokeObjectURL(current[item.id]);
      const next = { ...current };
      delete next[item.id];
      return next;
    });
  };

  const saveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const uploadedUrls = [];
    try {
      let nextItems = normalizePiercingItems(items);
      for (const item of nextItems) {
        const file = pendingFiles[item.id];
        if (!file) continue;
        const image = await uploadPiercingImage(file);
        uploadedUrls.push(image);
        item.image = image;
      }

      for (const item of nextItems) {
        if (!item.title.trim()) throw new Error('Every piercing item needs a name.');
        const hasImage = item.image || item.builtinKey;
        if (!hasImage) throw new Error(\`Add a photo for “\${item.title}”.\`);
      }

      const saved = await savePiercingItems(nextItems);
      const oldCustomUrls = new Set(originalItems.map((item) => item.image).filter(Boolean));
      const nextCustomUrls = new Set(saved.map((item) => item.image).filter(Boolean));
      const urlsToDelete = [...oldCustomUrls].filter((url) => !nextCustomUrls.has(url));
      await Promise.all(urlsToDelete.map((url) => deletePiercingImage(url)));

      const normalized = normalizePiercingItems(saved);
      setItems(normalized);
      setOriginalItems(normalized);
      setPendingFiles({});
      Object.values(pendingPreviews).forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setPendingPreviews({});
      setSuccess(previewMode
        ? 'Preview saved locally in this browser only. Live website data was not changed.'
        : 'Piercing section saved successfully.');
    } catch (saveError) {
      await Promise.all(uploadedUrls.map((url) => deletePiercingImage(url).catch(() => undefined)));
      setError(saveError.message || 'Piercing changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-intro">Loading piercing items…</p>;

  return (
    <>
      <AdminMeta title="Piercing CMS | Divine Ink Tattoos" />
      <section aria-labelledby="piercing-cms-title">
        <div className="gallery-page-heading">
          <div>
            <p className="admin-kicker">Content management</p>
            <h1 id="piercing-cms-title">Piercing</h1>
            <p className="admin-intro">Add, rename, reorder, show/hide, remove and replace piercing photos.</p>
          </div>
          <button className="admin-primary-button" onClick={addItem} type="button">Add piercing</button>
        </div>

        {previewMode && (
          <p className="admin-success" role="status">
            Safe preview mode: changes here stay only in this preview/browser. Firestore and live website data are not modified.
          </p>
        )}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {success && <p className="admin-success" role="status">{success}</p>}

        <div className="gallery-admin-grid">
          {items.map((item, index) => {
            const previewImage = pendingPreviews[item.id] || item.image || originalImageByKey[item.builtinKey] || getPiercingImage(item);
            return (
              <article className="gallery-admin-card" key={item.id}>
                {previewImage ? (
                  <img src={previewImage} alt={item.title || 'Piercing'} loading="lazy" />
                ) : (
                  <div className="gallery-empty">No photo selected</div>
                )}
                <div className="gallery-admin-card-body">
                  <div className="gallery-status-row">
                    <span>#{index + 1}</span>
                    <span>{item.active ? 'Visible' : 'Hidden'}</span>
                  </div>
                  <label>
                    <span>Name</span>
                    <input
                      onChange={(event) => updateItem(item.id, { title: event.target.value })}
                      value={item.title}
                    />
                  </label>
                  <label>
                    <span>Photo</span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => selectPhoto(item, event.target.files?.[0])}
                      type="file"
                    />
                  </label>
                  <div className="gallery-card-actions">
                    <button disabled={index === 0} onClick={() => moveItem(index, -1)} type="button">Move up</button>
                    <button disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} type="button">Move down</button>
                    <button onClick={() => updateItem(item.id, { active: !item.active })} type="button">
                      {item.active ? 'Hide' : 'Show'}
                    </button>
                    {item.builtinKey && (
                      <button onClick={() => useOriginalPhoto(item)} type="button">Use original photo</button>
                    )}
                    <button className="gallery-delete-button" onClick={() => removeItem(item.id)} type="button">Remove</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {items.length === 0 && <div className="gallery-empty">No piercing items. Use “Add piercing” to create one.</div>}

        <div style={{ marginTop: 28 }}>
          <button className="admin-primary-button" disabled={saving} onClick={saveAll} type="button">
            {saving ? 'Uploading and saving…' : 'Save piercing changes'}
          </button>
        </div>
      </section>
    </>
  );
}
`;
await write('src/admin/piercing/PiercingPage.jsx', piercingPage);

let app = await read('src/App.jsx');
app = replaceRequired(
  app,
  `import { usePublicCms } from './usePublicCms.js';\n\nimport lobePiercing from './assets/piercing/lobe.jpg';\nimport helixPiercing from './assets/piercing/helix.jpg';\nimport septumPiercing from './assets/piercing/septum.jpg';\nimport belly from './assets/piercing/belly.jpg';\nimport lip from './assets/piercing/lip.jpg';\nimport tongue from './assets/piercing/tongue.jpg';\nimport nose from './assets/piercing/nose.jpg';\nimport eyebrow from './assets/piercing/eyebrow.jpg';`,
  `import { usePublicCms } from './usePublicCms.js';\nimport { getPublicPiercingGallery } from './piercingData.js';`,
  'piercing data import',
);
app = replaceRequired(
  app,
  `const piercingGallery = [\n  [lobePiercing, 'Lobe Piercing'], [helixPiercing, 'Helix Piercing'], [septumPiercing, 'Septum Piercing'],\n  [nose, 'Nose Piercing'], [belly, 'Belly Piercing'], [eyebrow, 'Eyebrow Piercing'],\n  [lip, 'Lip Piercing'], [tongue, 'Tongue Piercing']\n];\n\n`,
  '',
  'hardcoded piercing gallery removal',
);
app = replaceRequired(
  app,
  `  const { homepage: homepageSettings } = usePublicCms();\n\n  const aboutImages = Array.isArray(homepageSettings?.featuredImages)`,
  `  const { homepage: homepageSettings } = usePublicCms();\n  const piercingGallery = getPublicPiercingGallery(homepageSettings?.piercingItems);\n\n  const aboutImages = Array.isArray(homepageSettings?.featuredImages)`,
  'managed piercing gallery binding',
);
await write('src/App.jsx', app);

let adminApp = await read('src/admin/AdminApp.jsx');
adminApp = replaceRequired(
  adminApp,
  `const ArtistsPage = lazy(() => import('./artists/ArtistsPage.jsx'));\nconst CollectionCmsPage`,
  `const ArtistsPage = lazy(() => import('./artists/ArtistsPage.jsx'));\nconst PiercingPage = lazy(() => import('./piercing/PiercingPage.jsx'));\nconst CollectionCmsPage`,
  'PiercingPage lazy import',
);
adminApp = replaceRequired(
  adminApp,
  `            <Route\n              path="artists/"\n              element={\n                <LazyPage>\n                  <ArtistsPage />\n                </LazyPage>\n              }\n            />\n            {[\'services\', \'reviews\', \'faqs\', \'offers\'].map((moduleName) => (`,
  `            <Route\n              path="artists/"\n              element={\n                <LazyPage>\n                  <ArtistsPage />\n                </LazyPage>\n              }\n            />\n            <Route\n              path="piercing/"\n              element={\n                <LazyPage>\n                  <PiercingPage />\n                </LazyPage>\n              }\n            />\n            {['services', 'reviews', 'faqs', 'offers'].map((moduleName) => (`,
  'admin piercing route',
);
await write('src/admin/AdminApp.jsx', adminApp);

let adminLayout = await read('src/admin/AdminLayout.jsx');
adminLayout = replaceRequired(
  adminLayout,
  `          <NavLink to="/admin/artists/">Artists</NavLink>\n          <NavLink to="/admin/services/">Services</NavLink>`,
  `          <NavLink to="/admin/artists/">Artists</NavLink>\n          <NavLink to="/admin/piercing/">Piercing</NavLink>\n          <NavLink to="/admin/services/">Services</NavLink>`,
  'admin piercing navigation',
);
await write('src/admin/AdminLayout.jsx', adminLayout);

let generateAdmin = await read('scripts/generate-admin-html.mjs');
generateAdmin = replaceRequired(
  generateAdmin,
  `  ['admin/artists', 'Artists CMS', 'Private artist profile management for Divine Ink Tattoos.'],\n  ['admin/services', 'Services CMS', 'Private service content management for Divine Ink Tattoos.'],`,
  `  ['admin/artists', 'Artists CMS', 'Private artist profile management for Divine Ink Tattoos.'],\n  ['admin/piercing', 'Piercing CMS', 'Private piercing content and photo management for Divine Ink Tattoos.'],\n  ['admin/services', 'Services CMS', 'Private service content management for Divine Ink Tattoos.'],`,
  'generated admin piercing route',
);
await write('scripts/generate-admin-html.mjs', generateAdmin);

let verifier = await read('scripts/verify-production-build.mjs');
verifier = replaceRequired(
  verifier,
  `  'admin/artists',\n  'admin/services',`,
  `  'admin/artists',\n  'admin/piercing',\n  'admin/services',`,
  'regression admin piercing route',
);
verifier = replaceRequired(
  verifier,
  `expect(appSource.includes('data-embed-id="25698491"'), 'Google Reviews embed ID changed unexpectedly.');`,
  `expect(appSource.includes('data-embed-id="25698491"'), 'Google Reviews embed ID changed unexpectedly.');\nexpect(appSource.includes('getPublicPiercingGallery(homepageSettings?.piercingItems)'), 'Public piercing section must remain connected to managed piercing data with built-in fallback.');`,
  'regression piercing binding',
);
await write('scripts/verify-production-build.mjs', verifier);

console.log('Piercing admin preview implementation prepared.');
