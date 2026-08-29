import { useEffect, useMemo, useState } from 'react';
import AdminMeta from '../AdminMeta.jsx';
import { getSettingsDocument, saveSettingsDocument } from '../cms/cmsService.js';

const defaultContact = Object.freeze({
  phones: [{ id: 'default-primary', number: '+91 84457 02782', label: 'Primary', primary: true }],
  whatsapp: '+91 84457 02782',
  address: 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001',
  instagram: 'https://www.instagram.com/divineinktattoos1/',
  facebook: 'https://www.facebook.com/profile.php?id=100078466583354',
  openingHours: 'Open 24x7 — advance confirmation recommended',
  googleMapsUrl: 'https://share.google/Ot0WZGKQFZkWTcSll',
});

function makeId() {
  return `phone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizePhones(record) {
  if (Array.isArray(record?.phones)) {
    return record.phones.map((item, index) => ({
      id: item?.id || makeId(),
      number: String(item?.number || ''),
      label: String(item?.label || (index === 0 ? 'Primary' : 'Phone')),
      primary: Boolean(item?.primary),
    }));
  }
  if (record?.phone) {
    return [{ id: makeId(), number: String(record.phone), label: 'Primary', primary: true }];
  }
  return defaultContact.phones.map((item) => ({ ...item }));
}

function settingValue(record, key, fallback) {
  return record && Object.prototype.hasOwnProperty.call(record, key) ? String(record[key] ?? '') : fallback;
}

function normalizeRecord(record) {
  return {
    phones: normalizePhones(record),
    whatsapp: settingValue(record, 'whatsapp', defaultContact.whatsapp),
    address: settingValue(record, 'address', defaultContact.address),
    instagram: settingValue(record, 'instagram', defaultContact.instagram),
    facebook: settingValue(record, 'facebook', defaultContact.facebook),
    openingHours: settingValue(record, 'openingHours', defaultContact.openingHours),
    googleMapsUrl: settingValue(record, 'googleMapsUrl', defaultContact.googleMapsUrl),
  };
}

export default function ContactPage() {
  const [values, setValues] = useState(() => normalizeRecord(null));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    getSettingsDocument('contact')
      .then((record) => setValues(normalizeRecord(record)))
      .catch((loadError) => setError(loadError.message || 'Contact settings could not be loaded.'));
  }, []);

  const primaryIndex = useMemo(() => {
    const found = values.phones.findIndex((item) => item.primary);
    return found >= 0 ? found : values.phones.length ? 0 : -1;
  }, [values.phones]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setSaved('');
  };

  const updatePhone = (id, field, value) => {
    setValues((current) => ({
      ...current,
      phones: current.phones.map((item) => item.id === id ? { ...item, [field]: value } : item),
    }));
    setSaved('');
  };

  const addPhone = () => {
    setValues((current) => ({
      ...current,
      phones: [...current.phones, { id: makeId(), number: '', label: 'Phone', primary: current.phones.length === 0 }],
    }));
    setSaved('');
  };

  const removePhone = (id) => {
    setValues((current) => {
      const next = current.phones.filter((item) => item.id !== id);
      if (next.length && !next.some((item) => item.primary)) next[0] = { ...next[0], primary: true };
      return { ...current, phones: next };
    });
    setSaved('');
  };

  const setPrimaryPhone = (id) => {
    setValues((current) => ({
      ...current,
      phones: current.phones.map((item) => ({ ...item, primary: item.id === id })),
    }));
    setSaved('');
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved('');
    try {
      const phones = values.phones
        .map((item, index) => ({
          id: item.id || makeId(),
          number: item.number.trim(),
          label: item.label.trim() || `Phone ${index + 1}`,
          primary: Boolean(item.primary),
        }))
        .filter((item) => item.number);

      if (phones.length && !phones.some((item) => item.primary)) phones[0].primary = true;
      if (phones.filter((item) => item.primary).length > 1) {
        let primaryFound = false;
        phones.forEach((item) => {
          if (item.primary && !primaryFound) primaryFound = true;
          else if (item.primary) item.primary = false;
        });
      }

      const primary = phones.find((item) => item.primary) || phones[0] || null;
      await saveSettingsDocument('contact', {
        phones,
        phone: primary?.number || '',
        whatsapp: values.whatsapp.trim(),
        address: values.address.trim(),
        instagram: values.instagram.trim(),
        facebook: values.facebook.trim(),
        openingHours: values.openingHours.trim(),
        googleMapsUrl: values.googleMapsUrl.trim(),
      });
      setValues((current) => ({ ...current, phones }));
      setSaved('Contact settings saved. Each field and phone number can be changed independently.');
    } catch (saveError) {
      setError(saveError.message || 'Contact settings could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminMeta title="Contact settings | Divine Ink Tattoos" />
      <section>
        <p className="admin-kicker">Website settings</p>
        <h1>Contact settings</h1>
        <p className="admin-intro">Change, add or remove only the contact detail you want. Phone numbers are managed separately, so you can add more later or remove an old one without re-entering everything else.</p>

        <form className="cms-editor" onSubmit={save}>
          <div className="gallery-editor-heading">
            <div>
              <p className="admin-kicker">Phone numbers</p>
              <h2>Manage phone numbers one by one</h2>
            </div>
            <button className="admin-secondary-button" disabled={busy} onClick={addPhone} type="button">Add phone number</button>
          </div>

          <div className="cms-list">
            {values.phones.map((item, index) => (
              <article key={item.id}>
                <div style={{ flex: 1 }}>
                  <label className="gallery-field-label" htmlFor={`phone-label-${item.id}`}>Label</label>
                  <input id={`phone-label-${item.id}`} value={item.label} onChange={(event) => updatePhone(item.id, 'label', event.target.value)} placeholder={index === 0 ? 'Primary' : 'Phone'} />
                  <label className="gallery-field-label" htmlFor={`phone-number-${item.id}`}>Phone number</label>
                  <input id={`phone-number-${item.id}`} value={item.number} onChange={(event) => updatePhone(item.id, 'number', event.target.value)} inputMode="tel" placeholder="+91 98765 43210" />
                  <small>{index === primaryIndex ? 'Primary number — used for main Call buttons.' : 'Extra number — shown in Contact and footer.'}</small>
                </div>
                <div className="gallery-card-actions">
                  {index !== primaryIndex && <button disabled={busy} onClick={() => setPrimaryPhone(item.id)} type="button">Make primary</button>}
                  <button className="gallery-delete-button" disabled={busy} onClick={() => removePhone(item.id)} type="button">Remove</button>
                </div>
              </article>
            ))}
            {!values.phones.length && <p className="gallery-empty">No call phone numbers. Use “Add phone number” whenever you want to add one.</p>}
          </div>

          <label className="gallery-field-label" htmlFor="contact-whatsapp">WhatsApp</label>
          <input id="contact-whatsapp" name="whatsapp" value={values.whatsapp} onChange={updateField} inputMode="tel" />

          <label className="gallery-field-label" htmlFor="contact-address">Address</label>
          <textarea id="contact-address" name="address" value={values.address} onChange={updateField} rows="4" />

          <label className="gallery-field-label" htmlFor="contact-instagram">Instagram URL</label>
          <input id="contact-instagram" name="instagram" value={values.instagram} onChange={updateField} type="url" />

          <label className="gallery-field-label" htmlFor="contact-facebook">Facebook URL</label>
          <input id="contact-facebook" name="facebook" value={values.facebook} onChange={updateField} type="url" />

          <label className="gallery-field-label" htmlFor="contact-hours">Opening hours</label>
          <input id="contact-hours" name="openingHours" value={values.openingHours} onChange={updateField} />

          <label className="gallery-field-label" htmlFor="contact-maps">Google Maps URL</label>
          <input id="contact-maps" name="googleMapsUrl" value={values.googleMapsUrl} onChange={updateField} type="url" />

          {error && <p className="admin-error" role="alert">{error}</p>}
          {saved && <p className="admin-success" role="status">{saved}</p>}
          <button className="admin-primary-button" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save contact changes'}</button>
        </form>
      </section>
    </>
  );
}
