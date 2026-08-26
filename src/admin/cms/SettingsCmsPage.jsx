import { useEffect, useMemo, useState } from 'react';
import AdminMeta from '../AdminMeta.jsx';
import { uploadGalleryImage } from '../gallery/galleryService.js';
import CmsFields, { initialValues, serializeValues } from './CmsFields.jsx';
import { getSettingsDocument, saveSettingsDocument } from './cmsService.js';

function normalizeImageUrls(value) {
  if (Array.isArray(value)) return [value[0] || '', value[1] || ''];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return [parsed[0] || '', parsed[1] || ''];
    } catch {
      return ['', ''];
    }
  }
  return ['', ''];
}

export default function SettingsCmsPage({ config }) {
  const isHomepage = config.documentId === 'homepage';
  const [values, setValues] = useState(() => initialValues(config.fields));
  const [aboutFiles, setAboutFiles] = useState([null, null]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  const visibleFields = useMemo(
    () => (isHomepage ? config.fields.filter((field) => field.name !== 'featuredImages') : config.fields),
    [config.fields, isHomepage],
  );

  useEffect(() => {
    getSettingsDocument(config.documentId)
      .then((record) => {
        const nextValues = initialValues(config.fields, record);
        if (isHomepage) {
          nextValues.featuredImages = normalizeImageUrls(record?.featuredImages);
        }
        setValues(nextValues);
        setAboutFiles([null, null]);
      })
      .catch((loadError) => setError(loadError.message || 'Settings could not be loaded.'));
  }, [config, isHomepage]);

  const onChange = (event) => {
    const { checked, name, type, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const setAboutFile = (index, file) => {
    setAboutFiles((current) => {
      const next = [...current];
      next[index] = file || null;
      return next;
    });
    setSaved('');
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const payload = serializeValues(visibleFields, values);

      if (isHomepage) {
        const nextImages = normalizeImageUrls(values.featuredImages);
        for (let index = 0; index < aboutFiles.length; index += 1) {
          const file = aboutFiles[index];
          if (file) {
            nextImages[index] = await uploadGalleryImage(file, 'homepage-about');
          }
        }
        payload.featuredImages = nextImages;
        setValues((current) => ({ ...current, featuredImages: nextImages }));
        setAboutFiles([null, null]);
      }

      await saveSettingsDocument(config.documentId, payload);
      setSaved(isHomepage ? 'Homepage settings saved. About images will use your latest uploads.' : 'Settings saved.');
    } catch (saveError) {
      setError(saveError.message || 'Settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const currentAboutImages = isHomepage ? normalizeImageUrls(values.featuredImages) : ['', ''];

  return (
    <>
      <AdminMeta title={`${config.title} | Divine Ink Tattoos`} />
      <section>
        <p className="admin-kicker">Website settings</p>
        <h1>{config.title}</h1>
        <p className="admin-intro">{config.intro}</p>
        <form className="cms-editor" onSubmit={save}>
          {isHomepage && (
            <div>
              <p className="admin-kicker">About section images</p>
              <p className="admin-intro">Choose a new photo only when you want to replace it. If you leave a field empty, the current website photo stays unchanged.</p>
              <div className="gallery-upload-grid gallery-advanced-upload-grid">
                {[['Main About image', 0], ['Small About image', 1]].map(([label, index]) => (
                  <div className="gallery-upload-field" key={label}>
                    <span className="gallery-field-label">{label}</span>
                    {currentAboutImages[index] ? (
                      <img
                        src={currentAboutImages[index]}
                        alt={`Current ${label.toLowerCase()}`}
                        style={{ width: '100%', maxHeight: 220, objectFit: 'cover', border: '1px solid rgba(255,255,255,.12)' }}
                      />
                    ) : (
                      <small>Current built-in website photo is being used.</small>
                    )}
                    <label className="gallery-dropzone">
                      {aboutFiles[index] ? `Selected: ${aboutFiles[index].name}` : `Choose new ${label.toLowerCase()}`}
                      <input
                        accept="image/*"
                        className="gallery-file-input"
                        disabled={busy}
                        onChange={(event) => setAboutFile(index, event.target.files?.[0])}
                        type="file"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CmsFields fields={visibleFields} onChange={onChange} values={values} />
          {error && <p className="admin-error" role="alert">{error}</p>}
          {saved && <p className="admin-success" role="status">{saved}</p>}
          <button className="admin-primary-button" disabled={busy} type="submit">
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </form>
      </section>
    </>
  );
}
