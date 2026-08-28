import { readFile, writeFile } from 'node:fs/promises';

async function update(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No change applied to ${path}`);
  await writeFile(path, after, 'utf8');
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error(`Missing expected source for ${label}`);
  return content.replace(search, replacement);
}

await update('src/piercingData.js', (source) => replaceRequired(
  source,
  `export function getPublicPiercingGallery(items) {\n  return normalizePiercingItems(items)\n    .filter((item) => item.active && item.title)\n    .flatMap((item) => getPiercingImages(item).map((src, photoIndex) => ({\n      id: \`\${item.id}-\${photoIndex}\`,\n      src,\n      title: item.title,\n    })));\n}`,
  `export function getPublicPiercingGallery(items) {\n  return normalizePiercingItems(items)\n    .filter((item) => item.active && item.title)\n    .map((item) => {\n      const images = getPiercingImages(item);\n      return {\n        id: item.id,\n        src: images[0] || '',\n        images,\n        title: item.title,\n      };\n    })\n    .filter((item) => item.images.length > 0);\n}`,
  'grouped public piercing data',
));

await update('src/App.jsx', (source) => {
  let app = source;
  app = replaceRequired(
    app,
    `  const [lightbox, setLightbox] = useState(null);\n  const [openFaq, setOpenFaq] = useState(0);`,
    `  const [lightbox, setLightbox] = useState(null);\n  const [piercingLightbox, setPiercingLightbox] = useState(null);\n  const [openFaq, setOpenFaq] = useState(0);`,
    'piercing lightbox state',
  );

  app = replaceRequired(
    app,
    `  const showAdjacentLightboxItem = (direction) => {\n    if (!lightbox || filtered.length < 2) return;\n    const currentIndex = filtered.findIndex((item) => item.id === lightbox.id);\n    const safeIndex = currentIndex < 0 ? 0 : currentIndex;\n    const nextIndex = (safeIndex + direction + filtered.length) % filtered.length;\n    const nextItem = filtered[nextIndex];\n    setLightbox({\n      id: nextItem.id,\n      src: nextItem.image,\n      category: nextItem.category,\n      altText: nextItem.altText,\n    });\n  };\n\n  useEffect(() => {`,
    `  const showAdjacentLightboxItem = (direction) => {\n    if (!lightbox || filtered.length < 2) return;\n    const currentIndex = filtered.findIndex((item) => item.id === lightbox.id);\n    const safeIndex = currentIndex < 0 ? 0 : currentIndex;\n    const nextIndex = (safeIndex + direction + filtered.length) % filtered.length;\n    const nextItem = filtered[nextIndex];\n    setLightbox({\n      id: nextItem.id,\n      src: nextItem.image,\n      category: nextItem.category,\n      altText: nextItem.altText,\n    });\n  };\n\n  const showAdjacentPiercingImage = (direction) => {\n    setPiercingLightbox((current) => {\n      if (!current || current.images.length < 2) return current;\n      const index = (current.index + direction + current.images.length) % current.images.length;\n      return { ...current, index };\n    });\n  };\n\n  useEffect(() => {`,
    'piercing lightbox navigation',
  );

  app = replaceRequired(
    app,
    `  }, [lightbox, filtered]);\n\n  useEffect(() => {\n    if (!menuOpen) return undefined;`,
    `  }, [lightbox, filtered]);\n\n  useEffect(() => {\n    if (!piercingLightbox) return undefined;\n    const handlePiercingKeyDown = (event) => {\n      if (event.key === 'Escape') setPiercingLightbox(null);\n      if (event.key === 'ArrowLeft') showAdjacentPiercingImage(-1);\n      if (event.key === 'ArrowRight') showAdjacentPiercingImage(1);\n    };\n    document.addEventListener('keydown', handlePiercingKeyDown);\n    return () => document.removeEventListener('keydown', handlePiercingKeyDown);\n  }, [piercingLightbox]);\n\n  useEffect(() => {\n    if (!menuOpen) return undefined;`,
    'piercing lightbox keyboard controls',
  );

  app = replaceRequired(
    app,
    `{piercingGallery.map(({ id, src, title }) => <figure key={id}><img src={src} alt={title} loading="lazy"/><figcaption>{title}</figcaption></figure>)}`,
    `{piercingGallery.map(({ id, src, title, images }) => (\n              <figure key={id}>\n                <button\n                  className="piercing-card-open"\n                  onClick={() => setPiercingLightbox({ id, title, images, index: 0 })}\n                  type="button"\n                  aria-label={\`Open \${title} photos\`}\n                >\n                  <img src={src} alt={title} loading="lazy"/>\n                  {images.length > 1 && <span className="piercing-photo-count">{images.length} photos</span>}\n                </button>\n                <figcaption>{title}</figcaption>\n              </figure>\n            ))}`,
    'grouped piercing cards',
  );

  app = replaceRequired(
    app,
    `      {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={\`\${lightbox.category || 'Gallery'} image preview\`} onClick={() => setLightbox(null)}>\n        <button ref={lightboxCloseRef} onClick={() => setLightbox(null)} aria-label="Close image"><X/></button>\n        {filtered.length > 1 && <button aria-label="Previous image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}\n        <img src={lightbox.src} alt={lightbox.altText || lightbox.category || 'Tattoo portfolio image'} onClick={(event) => event.stopPropagation()}/>\n        {filtered.length > 1 && <button aria-label="Next image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}\n      </div>}\n    </div>`,
    `      {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={\`\${lightbox.category || 'Gallery'} image preview\`} onClick={() => setLightbox(null)}>\n        <button ref={lightboxCloseRef} onClick={() => setLightbox(null)} aria-label="Close image"><X/></button>\n        {filtered.length > 1 && <button aria-label="Previous image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}\n        <img src={lightbox.src} alt={lightbox.altText || lightbox.category || 'Tattoo portfolio image'} onClick={(event) => event.stopPropagation()}/>\n        {filtered.length > 1 && <button aria-label="Next image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}\n      </div>}\n\n      {piercingLightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={\`\${piercingLightbox.title} photo preview\`} onClick={() => setPiercingLightbox(null)}>\n        <button onClick={() => setPiercingLightbox(null)} aria-label="Close piercing photos"><X/></button>\n        {piercingLightbox.images.length > 1 && <button aria-label="Previous piercing photo" onClick={(event) => { event.stopPropagation(); showAdjacentPiercingImage(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}\n        <div className="piercing-lightbox-content" onClick={(event) => event.stopPropagation()}>\n          <img src={piercingLightbox.images[piercingLightbox.index]} alt={\`\${piercingLightbox.title} \${piercingLightbox.index + 1}\`}/>\n          <p>{piercingLightbox.title}{piercingLightbox.images.length > 1 ? \` · \${piercingLightbox.index + 1}/\${piercingLightbox.images.length}\` : ''}</p>\n        </div>\n        {piercingLightbox.images.length > 1 && <button aria-label="Next piercing photo" onClick={(event) => { event.stopPropagation(); showAdjacentPiercingImage(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}\n      </div>}\n    </div>`,
    'piercing grouped lightbox',
  );

  return app;
});

await update('src/App.css', (source) => replaceRequired(
  source,
  `.piercing-grid figure { margin:0; background:#111; border:1px solid rgba(255,255,255,.07); }\n.piercing-grid img { width:100%; aspect-ratio:3/4; object-fit:cover; }\n.piercing-grid figcaption { padding:14px 10px; text-align:center; color:#d7d0c5; font-size:13px; }`,
  `.piercing-grid figure { margin:0; background:#111; border:1px solid rgba(255,255,255,.07); }\n.piercing-card-open { position:relative; display:block; width:100%; padding:0; border:0; background:#111; color:inherit; cursor:pointer; }\n.piercing-grid img { width:100%; aspect-ratio:3/4; object-fit:cover; display:block; }\n.piercing-photo-count { position:absolute; right:8px; bottom:8px; padding:5px 8px; background:rgba(0,0,0,.78); color:var(--gold); font-size:11px; font-weight:700; border:1px solid rgba(255,255,255,.12); }\n.piercing-grid figcaption { padding:14px 10px; text-align:center; color:#d7d0c5; font-size:13px; }\n.piercing-lightbox-content { display:grid; place-items:center; }\n.piercing-lightbox-content p { text-align:center; }`,
  'piercing grouped card styles',
));

await update('src/admin/piercing/PiercingPage.jsx', (source) => replaceRequired(
  source,
  `  const removeSavedPhoto = (item, photoUrl) => {\n    updateItem(item.id, { images: item.images.filter((url) => url !== photoUrl) });\n  };`,
  `  const removeSavedPhoto = async (item, photoUrl) => {\n    if (!window.confirm('Remove this photo from this piercing type?')) return;\n    setSaving(true);\n    setError('');\n    setSuccess('');\n    try {\n      const nextItems = normalizePiercingItems(items).map((currentItem) => ({\n        ...currentItem,\n        images: currentItem.id === item.id\n          ? currentItem.images.filter((url) => url !== photoUrl)\n          : [...currentItem.images],\n      }));\n      const saved = await savePiercingItems(nextItems);\n      const normalized = normalizePiercingItems(saved);\n      setItems(normalized);\n      setOriginalItems(normalized);\n      setSuccess(previewMode\n        ? 'Photo removed from this preview piercing type.'\n        : 'Photo removed from the live piercing section.');\n      try {\n        await deletePiercingImage(photoUrl);\n      } catch {\n        setError('The photo was removed from the website, but its Cloudinary file could not be cleaned up.');\n      }\n    } catch (removeError) {\n      setError(removeError.message || 'Photo could not be removed.');\n    } finally {\n      setSaving(false);\n    }\n  };`,
  'immediate saved photo removal',
));

await update('src/admin/piercing/piercingService.js', (source) => {
  let service = source;
  service = replaceRequired(
    service,
    `const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();`,
    `const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();\nconst PIERCING_UPDATE_KEY = 'divine-ink-piercing-updated-at';\n\nfunction notifyPiercingUpdate() {\n  try {\n    localStorage.setItem(PIERCING_UPDATE_KEY, String(Date.now()));\n  } catch {\n    // Storage notifications are best-effort only.\n  }\n}`,
    'piercing update notification helper',
  );
  service = replaceRequired(
    service,
    `  if (isPiercingPreviewMode()) {\n    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload));\n    return payload;\n  }`,
    `  if (isPiercingPreviewMode()) {\n    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload));\n    notifyPiercingUpdate();\n    return payload;\n  }`,
    'preview update notification',
  );
  service = replaceRequired(
    service,
    `  await setDoc(\n    doc(db, 'siteSettings', 'homepage'),\n    { piercingItems: payload, updatedAt: serverTimestamp() },\n    { merge: true },\n  );\n  return payload;`,
    `  await setDoc(\n    doc(db, 'siteSettings', 'homepage'),\n    { piercingItems: payload, updatedAt: serverTimestamp() },\n    { merge: true },\n  );\n  notifyPiercingUpdate();\n  return payload;`,
    'production update notification',
  );
  return service;
});

await update('src/usePublicCms.js', (source) => {
  let cms = source;
  cms = replaceRequired(
    cms,
    `const initialState = {`,
    `const PIERCING_UPDATE_KEY = 'divine-ink-piercing-updated-at';\n\nconst initialState = {`,
    'public piercing update key',
  );
  cms = replaceRequired(
    cms,
    `    load();\n    return () => { active = false; };`,
    `    const handleStorage = (event) => {\n      if (event.key === PIERCING_UPDATE_KEY) load();\n    };\n    window.addEventListener('storage', handleStorage);\n    load();\n    return () => {\n      active = false;\n      window.removeEventListener('storage', handleStorage);\n    };`,
    'public cross-tab piercing refresh',
  );
  return cms;
});

await update('scripts/verify-production-build.mjs', (source) => {
  const needle = `expect(appSource.includes('getPreviewPiercingItems(homepageSettings?.piercingItems)'), 'Public piercing section must remain connected to managed piercing data with built-in fallback.');`;
  const replacement = `${needle}\nexpect(appSource.includes('piercingGallery.map(({ id, src, title, images })'), 'Piercing types must render as one grouped public card per type.');\nexpect(appSource.includes('piercingLightbox.images[piercingLightbox.index]'), 'Grouped piercing photos must be viewable inside the piercing lightbox.');\nconst piercingDataSource = await read(resolve('src', 'piercingData.js'));\nexpect(!piercingDataSource.includes('.flatMap((item) => getPiercingImages(item)'), 'Piercing photos must not flatten into separate public category cards.');\nconst piercingAdminSource = await read(resolve('src', 'admin', 'piercing', 'PiercingPage.jsx'));\nexpect(piercingAdminSource.includes('Photo removed from the live piercing section.'), 'Saved piercing photo removal must persist immediately.');\nconst publicCmsSource = await read(resolve('src', 'usePublicCms.js'));\nexpect(publicCmsSource.includes('divine-ink-piercing-updated-at'), 'Public site must refresh piercing data when another live tab saves piercing changes.');`;
  return replaceRequired(source, needle, replacement, 'piercing grouping regression checks');
});

console.log('Piercing grouping and removal fix applied.');
