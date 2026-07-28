import { useEffect, useState } from 'react';
import AdminMeta from '../AdminMeta.jsx';
import CmsFields, { initialValues, serializeValues } from './CmsFields.jsx';
import { getSettingsDocument, saveSettingsDocument } from './cmsService.js';

export default function SettingsCmsPage({ config }) {
  const [values, setValues] = useState(() => initialValues(config.fields));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    getSettingsDocument(config.documentId)
      .then((record) => setValues(initialValues(config.fields, record)))
      .catch((loadError) => setError(loadError.message || 'Settings could not be loaded.'));
  }, [config]);

  const onChange = (event) => {
    const { checked, name, type, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      await saveSettingsDocument(config.documentId, serializeValues(config.fields, values));
      setSaved('Settings saved.');
    } catch (saveError) {
      setError(saveError.message || 'Settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminMeta title={`${config.title} | Divine Ink Tattoos`} />
      <section>
        <p className="admin-kicker">Website settings</p>
        <h1>{config.title}</h1>
        <p className="admin-intro">{config.intro}</p>
        <form className="cms-editor" onSubmit={save}>
          <CmsFields fields={config.fields} onChange={onChange} values={values} />
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
