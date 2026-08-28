import { useEffect, useState } from 'react';
import {
  getOriginalPiercingImage,
  getPiercingImages,
  normalizePiercingItems,
} from '../../piercingData.js';
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
  return `piercing-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

  useEffect(() => () => {
    Object.values(pendingPreviews).flat().forEach((url) => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, [pendingPreviews]);

  const updateItem = (id, changes) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    setSuccess('');
  };

  const addItem = () => {
    const id = newPiercingId();
    setItems((current) => [
      ...current,
      {
        id,
        title: 'New Piercing',
        builtinKey: '',
        images: [],
        includeOriginal: false,
        active: true,
        order: current.length,
      },
    ]);
    setSuccess('');
  };

  const removeItem = (id) => {
    if (!window.confirm('Remove this piercing type and all of its added photos from the website list?')) return;
    setItems((current) => current
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, order: index })));
    (pendingPreviews[id] || []).forEach((url) => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });
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

  const selectPhotos = (item, files) => {
    const nextFiles = [...(files || [])];
    if (nextFiles.length === 0) return;
    const previewUrls = nextFiles.map((file) => URL.createObjectURL(file));
    setPendingFiles((current) => ({
      ...current,
      [item.id]: [...(current[item.id] || []), ...nextFiles],
    }));
    setPendingPreviews((current) => ({
      ...current,
      [item.id]: [...(current[item.id] || []), ...previewUrls],
    }));
    setSuccess('');
  };

  const removePendingPhoto = (itemId, photoIndex) => {
    const previewUrl = pendingPreviews[itemId]?.[photoIndex];
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPendingFiles((current) => ({
      ...current,
      [itemId]: (current[itemId] || []).filter((_, index) => index !== photoIndex),
    }));
    setPendingPreviews((current) => ({
      ...current,
      [itemId]: (current[itemId] || []).filter((_, index) => index !== photoIndex),
    }));
  };

  const removeSavedPhoto = async (item, photoUrl) => {
    if (!window.confirm('Remove this photo from this piercing type?')) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const nextItems = normalizePiercingItems(items).map((currentItem) => ({
        ...currentItem,
        images: currentItem.id === item.id
          ? currentItem.images.filter((url) => url !== photoUrl)
          : [...currentItem.images],
      }));
      const saved = await savePiercingItems(nextItems);
      const normalized = normalizePiercingItems(saved);
      setItems(normalized);
      setOriginalItems(normalized);
      setSuccess(previewMode
        ? 'Photo removed from this preview piercing type.'
        : 'Photo removed from the live piercing section.');
      try {
        await deletePiercingImage(photoUrl);
      } catch {
        setError('The photo was removed from the website, but its Cloudinary file could not be cleaned up.');
      }
    } catch (removeError) {
      setError(removeError.message || 'Photo could not be removed.');
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const uploadedUrls = [];
    try {
      const nextItems = normalizePiercingItems(items).map((item) => ({
        ...item,
        images: [...item.images],
      }));

      for (const item of nextItems) {
        for (const file of pendingFiles[item.id] || []) {
          const image = await uploadPiercingImage(file);
          uploadedUrls.push(image);
          item.images.push(image);
        }
      }

      for (const item of nextItems) {
        if (!item.title.trim()) throw new Error('Every piercing type needs a name.');
        if (item.active && getPiercingImages(item).length === 0) {
          throw new Error(`Add at least one photo for “${item.title}” or hide it.`);
        }
      }

      const saved = await savePiercingItems(nextItems);
      const oldCustomUrls = new Set(originalItems.flatMap((item) => item.images || []).filter(Boolean));
      const nextCustomUrls = new Set(saved.flatMap((item) => item.images || []).filter(Boolean));
      const urlsToDelete = [...oldCustomUrls].filter((url) => !nextCustomUrls.has(url));
      await Promise.all(urlsToDelete.map((url) => deletePiercingImage(url)));

      const normalized = normalizePiercingItems(saved);
      setItems(normalized);
      setOriginalItems(normalized);
      Object.values(pendingPreviews).flat().forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setPendingFiles({});
      setPendingPreviews({});
      setSuccess(previewMode
        ? 'Preview saved in this browser only. Open the preview website to see these piercing photos. Live data was not changed.'
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
            <p className="admin-intro">
              Manage each piercing type separately and add multiple photos inside Lobe, Septum, Helix or any other piercing type.
            </p>
          </div>
          <button className="admin-primary-button" onClick={addItem} type="button">Add piercing type</button>
        </div>

        {previewMode && (
          <p className="admin-success" role="status">
            Safe preview mode: saves stay only in this preview/browser. Production Firestore and Cloudinary are not modified.
          </p>
        )}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {success && <p className="admin-success" role="status">{success}</p>}

        <div className="gallery-admin-grid">
          {items.map((item, index) => {
            const originalPhoto = getOriginalPiercingImage(item);
            const pending = pendingPreviews[item.id] || [];
            return (
              <article className="gallery-admin-card" key={item.id}>
                <div className="gallery-admin-card-body">
                  <div className="gallery-status-row">
                    <span>#{index + 1}</span>
                    <span>{item.active ? 'Visible' : 'Hidden'}</span>
                    <span>{getPiercingImages(item).length + pending.length} photo(s)</span>
                  </div>

                  <label>
                    <span>Piercing name</span>
                    <input
                      onChange={(event) => updateItem(item.id, { title: event.target.value })}
                      value={item.title}
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginTop: 16 }}>
                    {originalPhoto && (
                      <div>
                        <img src={originalPhoto} alt={`${item.title} original`} loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                        <small>Original website photo</small>
                        <button
                          className="admin-secondary-button"
                          onClick={() => updateItem(item.id, { includeOriginal: !item.includeOriginal })}
                          style={{ width: '100%', marginTop: 8 }}
                          type="button"
                        >
                          {item.includeOriginal ? 'Hide original' : 'Show original'}
                        </button>
                      </div>
                    )}

                    {item.images.map((photoUrl, photoIndex) => (
                      <div key={`${photoUrl}-${photoIndex}`}>
                        <img src={photoUrl} alt={`${item.title} ${photoIndex + 1}`} loading="lazy" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                        <small>Added photo {photoIndex + 1}</small>
                        <button
                          className="gallery-delete-button"
                          onClick={() => removeSavedPhoto(item, photoUrl)}
                          style={{ width: '100%', marginTop: 8 }}
                          type="button"
                        >
                          Remove photo
                        </button>
                      </div>
                    ))}

                    {pending.map((photoUrl, photoIndex) => (
                      <div key={photoUrl}>
                        <img src={photoUrl} alt={`${item.title} new ${photoIndex + 1}`} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                        <small>New photo — not saved yet</small>
                        <button
                          className="gallery-delete-button"
                          onClick={() => removePendingPhoto(item.id, photoIndex)}
                          style={{ width: '100%', marginTop: 8 }}
                          type="button"
                        >
                          Cancel photo
                        </button>
                      </div>
                    ))}
                  </div>

                  <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
                    <span>Add more photos to {item.title || 'this piercing'}</span>
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) => {
                        selectPhotos(item, event.target.files);
                        event.target.value = '';
                      }}
                      type="file"
                    />
                  </label>

                  <div className="gallery-card-actions" style={{ marginTop: 18 }}>
                    <button disabled={index === 0} onClick={() => moveItem(index, -1)} type="button">Move up</button>
                    <button disabled={index === items.length - 1} onClick={() => moveItem(index, 1)} type="button">Move down</button>
                    <button onClick={() => updateItem(item.id, { active: !item.active })} type="button">
                      {item.active ? 'Hide piercing' : 'Show piercing'}
                    </button>
                    <button className="gallery-delete-button" onClick={() => removeItem(item.id)} type="button">Remove piercing type</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {items.length === 0 && <div className="gallery-empty">No piercing types. Use “Add piercing type” to create one.</div>}

        <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="admin-primary-button" disabled={saving} onClick={saveAll} type="button">
            {saving ? 'Uploading and saving…' : 'Save piercing changes'}
          </button>
          {previewMode && (
            <a className="admin-secondary-button" href="/#piercing" target="_blank" rel="noreferrer">
              View piercing on preview website
            </a>
          )}
        </div>
      </section>
    </>
  );
}
