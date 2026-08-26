import { useCallback, useEffect, useMemo, useState } from 'react';
import { galleryFallbackItems } from '../../galleryFallback.js';
import AdminMeta from '../AdminMeta.jsx';
import BulkGalleryUpload from './BulkGalleryUpload.jsx';
import GalleryForm from './GalleryForm.jsx';
import GalleryPreview from './GalleryPreview.jsx';
import {
  deleteGalleryItem,
  listGalleryItems,
  migrateFallbackGalleryItems,
  updateGalleryItem,
} from './galleryService.js';

const PAGE_SIZE = 8;

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [migrationNote, setMigrationNote] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [busyItemId, setBusyItemId] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      try {
        const migration = await migrateFallbackGalleryItems(galleryFallbackItems);
        if (migration.migrated > 0) {
          setMigrationNote(
            `${migration.migrated} existing website gallery photos are now editable in Gallery CMS.`,
          );
        }
      } catch (migrationError) {
        setError(
          migrationError.message ||
            'Existing website gallery photos could not be migrated into the CMS.',
        );
      }

      setItems(await listGalleryItems());
    } catch (galleryError) {
      setError(galleryError.message || 'Gallery could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const categories = useMemo(
    () => ['All', ...new Set(items.map((item) => item.category).filter(Boolean))],
    [items],
  );

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const searchable = [
        item.title,
        item.category,
        item.bodyPart,
        item.tattooStyle,
        item.artist,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!term || searchable.includes(term));
    });
  }, [category, items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleField = async (item, field) => {
    setBusyItemId(item.id);
    setError('');
    try {
      await updateGalleryItem(item.id, { [field]: !item[field] });
      await loadItems();
    } catch (updateError) {
      setError(updateError.message || 'Gallery item could not be updated.');
    } finally {
      setBusyItemId('');
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Delete “${item.title}” and its stored images?`)) return;
    setBusyItemId(item.id);
    setError('');
    try {
      await deleteGalleryItem(item);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError.message || 'Gallery item could not be deleted.');
    } finally {
      setBusyItemId('');
    }
  };

  return (
    <>
      <AdminMeta title="Gallery CMS | Divine Ink Tattoos" />
      <section aria-labelledby="gallery-cms-title">
        <div className="gallery-page-heading">
          <div>
            <p className="admin-kicker">Content management</p>
            <h1 id="gallery-cms-title">Gallery</h1>
            <p className="admin-intro">
              Upload, publish and manage tattoo portfolio images.
            </p>
          </div>
          <button
            className="admin-primary-button"
            onClick={() => {
              setEditingItem(null);
              setEditorOpen(true);
            }}
            type="button"
          >
            Add gallery item
          </button>
        </div>
        <BulkGalleryUpload onUploaded={loadItems} />

        {editorOpen && (
          <GalleryForm
            item={editingItem}
            onCancel={() => {
              setEditorOpen(false);
              setEditingItem(null);
            }}
            onSaved={() => {
              setEditorOpen(false);
              setEditingItem(null);
              loadItems();
            }}
          />
        )}

        <div className="gallery-toolbar">
          <label>
            <span>Search</span>
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, style, artist or body part"
              type="search"
              value={search}
            />
          </label>
          <label>
            <span>Category</span>
            <select
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              {categories.map((itemCategory) => (
                <option key={itemCategory}>{itemCategory}</option>
              ))}
            </select>
          </label>
        </div>

        {migrationNote && <p className="admin-success" role="status">{migrationNote}</p>}
        {error && <p className="admin-error" role="alert">{error}</p>}
        {loading && <p className="admin-intro" aria-live="polite">Loading gallery…</p>}

        {!loading && visibleItems.length === 0 && (
          <div className="gallery-empty">
            No gallery items match the current search and filter.
          </div>
        )}

        <div className="gallery-admin-grid">
          {visibleItems.map((item) => (
            <article className="gallery-admin-card" key={item.id}>
              <img
                src={item.image}
                alt={item.altText}
                loading="lazy"
                title={item.title}
              />
              <div className="gallery-admin-card-body">
                <div className="gallery-status-row">
                  <span>{item.category}</span>
                  <span>{item.published ? 'Published' : 'Draft'}</span>
                  {item.featured && <span>Featured</span>}
                </div>
                <h2>{item.title}</h2>
                <p>{item.artist} · {item.bodyPart} · {item.tattooStyle}</p>
                <div className="gallery-card-actions">
                  <button onClick={() => setPreviewItem(item)} type="button">Preview</button>
                  <button onClick={() => {
                    setEditingItem(item);
                    setEditorOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} type="button">Edit</button>
                  <button
                    disabled={busyItemId === item.id}
                    onClick={() => toggleField(item, 'featured')}
                    type="button"
                  >
                    {item.featured ? 'Remove featured' : 'Make featured'}
                  </button>
                  <button
                    disabled={busyItemId === item.id}
                    onClick={() => toggleField(item, 'published')}
                    type="button"
                  >
                    {item.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    className="gallery-delete-button"
                    disabled={busyItemId === item.id}
                    onClick={() => removeItem(item)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="gallery-pagination" aria-label="Gallery pagination">
            <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} type="button">
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} type="button">
              Next
            </button>
          </nav>
        )}
      </section>

      {previewItem && (
        <GalleryPreview item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </>
  );
}
