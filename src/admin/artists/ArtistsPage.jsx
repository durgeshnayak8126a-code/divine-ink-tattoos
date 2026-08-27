import { useEffect, useMemo, useState } from 'react';
import { getArtistDisplayImage, hasBuiltInArtistImage } from '../../artists.js';
import AdminMeta from '../AdminMeta.jsx';
import {
  deleteReplacedImages,
  GALLERY_UPLOAD_FOLDERS,
  uploadGalleryImage,
} from '../gallery/galleryService.js';
import { prepareGalleryImage } from '../gallery/imageProcessing.js';
import { loadArtists, saveArtists } from './artistService.js';
import './artists.css';

function newArtistId() {
  if (globalThis.crypto?.randomUUID) return `artist-${globalThis.crypto.randomUUID()}`;
  return `artist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [originalArtists, setOriginalArtists] = useState([]);
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const loaded = await loadArtists();
      setArtists(loaded);
      setOriginalArtists(loaded.map((artist) => ({ ...artist })));
      setFiles({});
      setPreviews({});
    } catch (loadError) {
      setError(loadError.message || 'Artists could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const originalById = useMemo(
    () => new Map(originalArtists.map((artist) => [artist.id, artist])),
    [originalArtists],
  );

  const updateArtist = (artistId, field, value) => {
    setArtists((current) => current.map((artist) => (
      artist.id === artistId ? { ...artist, [field]: value } : artist
    )));
    setMessage('');
  };

  const selectPhoto = (artistId, file) => {
    if (!file) return;
    setFiles((current) => ({ ...current, [artistId]: file }));
    setPreviews((current) => ({
      ...current,
      [artistId]: URL.createObjectURL(file),
    }));
    setMessage('');
  };

  const useOriginalPhoto = (artistId) => {
    updateArtist(artistId, 'image', '');
    setFiles((current) => {
      const next = { ...current };
      delete next[artistId];
      return next;
    });
    setPreviews((current) => {
      const next = { ...current };
      delete next[artistId];
      return next;
    });
  };

  const addArtist = () => {
    const artist = {
      id: newArtistId(),
      name: '',
      role: 'Tattoo Artist',
      bio: '',
      image: '',
      active: true,
    };
    setArtists((current) => [...current, artist]);
    setMessage('');
    window.requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
  };

  const removeArtist = (artist) => {
    const warning = artist.name
      ? `Remove ${artist.name}? Their existing gallery photos will stay on the website but become Studio / Unassigned after you save.`
      : 'Remove this new artist?';
    if (!window.confirm(warning)) return;
    setArtists((current) => current.filter((item) => item.id !== artist.id));
    setFiles((current) => {
      const next = { ...current };
      delete next[artist.id];
      return next;
    });
    setPreviews((current) => {
      const next = { ...current };
      delete next[artist.id];
      return next;
    });
    setMessage('Artist removed locally. Click Save artist changes to confirm.');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    const uploadedUrls = [];

    try {
      const nextArtists = [];
      for (const artist of artists) {
        let nextArtist = { ...artist };
        const pendingFile = files[artist.id];
        if (pendingFile) {
          const preparedFile = await prepareGalleryImage(pendingFile);
          const image = await uploadGalleryImage(preparedFile, GALLERY_UPLOAD_FOLDERS.artists);
          uploadedUrls.push(image);
          nextArtist = { ...nextArtist, image };
        }
        nextArtists.push(nextArtist);
      }

      const normalizedNames = nextArtists.map((artist) => artist.name.trim().toLowerCase());
      if (nextArtists.some((artist) => !artist.name.trim())) {
        throw new Error('Enter a name for every artist before saving.');
      }
      if (new Set(normalizedNames).size !== normalizedNames.length) {
        throw new Error('Artist names must be unique.');
      }
      if (nextArtists.some((artist) => !getArtistDisplayImage(artist))) {
        throw new Error('Upload a photo for every new artist before saving.');
      }

      const oldImagesToDelete = [];
      originalById.forEach((oldArtist, artistId) => {
        if (!oldArtist.image) return;
        const nextArtist = nextArtists.find((artist) => artist.id === artistId);
        if (!nextArtist || nextArtist.image !== oldArtist.image) {
          oldImagesToDelete.push(oldArtist.image);
        }
      });

      const saved = await saveArtists(nextArtists, originalArtists);
      await deleteReplacedImages(oldImagesToDelete).catch(() => undefined);
      setArtists(saved);
      setOriginalArtists(saved.map((artist) => ({ ...artist })));
      setFiles({});
      setPreviews({});
      setMessage('Artist changes saved. Gallery artist assignments were updated safely.');
    } catch (saveError) {
      if (uploadedUrls.length) {
        await deleteReplacedImages(uploadedUrls).catch(() => undefined);
      }
      setError(saveError.message || 'Artist changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminMeta title="Artists | Divine Ink Tattoos" />
      <section aria-labelledby="artists-admin-title">
        <div className="artists-admin-heading">
          <div>
            <p className="admin-kicker">Content management</p>
            <h1 id="artists-admin-title">Artists</h1>
            <p className="admin-intro">
              Add, edit, hide or remove artist profiles. Gallery photos are never deleted when an artist is removed.
            </p>
          </div>
          <button className="admin-primary-button" onClick={addArtist} type="button">Add artist</button>
        </div>

        {error && <p className="admin-error" role="alert">{error}</p>}
        {message && <p className="admin-success" role="status">{message}</p>}
        {loading && <p className="admin-intro">Loading artists…</p>}

        {!loading && (
          <div className="artists-admin-list">
            {artists.map((artist) => {
              const displayImage = previews[artist.id] || getArtistDisplayImage(artist);
              return (
                <article className="artist-admin-card" key={artist.id}>
                  <div className="artist-admin-photo">
                    {displayImage ? <img src={displayImage} alt="" /> : <div className="artist-photo-empty">Photo required</div>}
                    <label className="admin-secondary-button artist-photo-button">
                      Change photo
                      <input
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(event) => selectPhoto(artist.id, event.target.files?.[0])}
                        type="file"
                      />
                    </label>
                    {hasBuiltInArtistImage(artist.id) && (artist.image || files[artist.id]) && (
                      <button className="artist-text-button" onClick={() => useOriginalPhoto(artist.id)} type="button">
                        Use original photo
                      </button>
                    )}
                  </div>

                  <div className="artist-admin-fields">
                    <label>Name *
                      <input
                        onChange={(event) => updateArtist(artist.id, 'name', event.target.value)}
                        value={artist.name}
                      />
                    </label>
                    <label>Role / title
                      <input
                        onChange={(event) => updateArtist(artist.id, 'role', event.target.value)}
                        value={artist.role}
                      />
                    </label>
                    <label>Short description
                      <textarea
                        onChange={(event) => updateArtist(artist.id, 'bio', event.target.value)}
                        rows="4"
                        value={artist.bio}
                      />
                    </label>
                    <label className="artist-active-toggle">
                      <input
                        checked={artist.active}
                        onChange={(event) => updateArtist(artist.id, 'active', event.target.checked)}
                        type="checkbox"
                      />
                      Show this artist on the public website
                    </label>
                    <button className="gallery-delete-button artist-remove-button" onClick={() => removeArtist(artist)} type="button">
                      Remove artist
                    </button>
                  </div>
                </article>
              );
            })}
            {artists.length === 0 && (
              <div className="gallery-empty">No artists are configured. Use Add artist to create one.</div>
            )}
          </div>
        )}

        {!loading && (
          <div className="artists-save-bar">
            <p>Changing a name also updates that artist name on existing Gallery items. Removing an artist makes those items Studio / Unassigned.</p>
            <button className="admin-primary-button" disabled={saving} onClick={handleSave} type="button">
              {saving ? 'Uploading and saving…' : 'Save artist changes'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
