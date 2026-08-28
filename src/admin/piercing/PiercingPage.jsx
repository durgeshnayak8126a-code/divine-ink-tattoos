import { useEffect, useMemo, useState } from 'react';
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
        if (!hasImage) throw new Error(`Add a photo for “${item.title}”.`);
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
