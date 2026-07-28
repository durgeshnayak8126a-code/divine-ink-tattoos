import { useCallback, useEffect, useState } from 'react';
import AdminMeta from '../AdminMeta.jsx';
import CmsFields, { initialValues, serializeValues } from './CmsFields.jsx';
import {
  createCmsDocument,
  deleteCmsDocument,
  listCmsDocuments,
  updateCmsDocument,
} from './cmsService.js';

export default function CollectionCmsPage({ config }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(() => initialValues(config.fields));
  const [editorOpen, setEditorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setItems(await listCmsDocuments(config.collection));
    } catch (loadError) {
      setError(loadError.message || `${config.title} could not be loaded.`);
    }
  }, [config]);

  useEffect(() => { load(); }, [load]);

  const openEditor = (item = null) => {
    setEditing(item);
    setValues(initialValues(config.fields, item));
    setEditorOpen(true);
    setError('');
  };

  const onChange = (event) => {
    const { checked, name, type, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = serializeValues(config.fields, values);
      if (editing?.id) await updateCmsDocument(config.collection, editing.id, payload);
      else await createCmsDocument(config.collection, payload);
      setEditorOpen(false);
      setEditing(null);
      await load();
    } catch (saveError) {
      setError(saveError.message || 'Changes could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    const label = item.title || item.question || item.author || item.slug || 'this item';
    if (!window.confirm(`Delete “${label}”?`)) return;
    setBusy(true);
    try {
      await deleteCmsDocument(config.collection, item.id);
      await load();
    } catch (deleteError) {
      setError(deleteError.message || 'Item could not be deleted.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminMeta title={`${config.title} CMS | Divine Ink Tattoos`} />
      <section>
        <div className="gallery-page-heading">
          <div>
            <p className="admin-kicker">Content management</p>
            <h1>{config.title}</h1>
            <p className="admin-intro">{config.intro}</p>
          </div>
          <button className="admin-primary-button" onClick={() => openEditor()} type="button">
            Add {config.title.toLowerCase().replace(/s$/, '')}
          </button>
        </div>

        {editorOpen && (
          <form className="cms-editor" onSubmit={save}>
            <div className="gallery-editor-heading">
              <h2>{editing ? 'Edit item' : 'New item'}</h2>
              <button className="admin-secondary-button" onClick={() => setEditorOpen(false)} type="button">Cancel</button>
            </div>
            <CmsFields fields={config.fields} onChange={onChange} values={values} />
            <button className="admin-primary-button" disabled={busy} type="submit">
              {busy ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}

        {error && <p className="admin-error" role="alert">{error}</p>}
        <div className="cms-list">
          {items.map((item) => (
            <article key={item.id}>
              <div>
                <h2>{item.title || item.question || item.author || item.slug}</h2>
                <p>{item.description || item.answer || item.text || item.pricing}</p>
              </div>
              <div className="gallery-card-actions">
                <button onClick={() => openEditor(item)} type="button">Edit</button>
                <button className="gallery-delete-button" disabled={busy} onClick={() => remove(item)} type="button">Delete</button>
              </div>
            </article>
          ))}
          {!items.length && !error && <p className="gallery-empty">No items yet.</p>}
        </div>
      </section>
    </>
  );
}
