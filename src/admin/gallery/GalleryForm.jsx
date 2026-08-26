import { useEffect, useState } from 'react';
import GalleryDropzone from './GalleryDropzone.jsx';
import {
  GALLERY_CATEGORIES,
  GALLERY_CATEGORY_GROUPS,
} from './galleryCategories.js';
import {
  createGalleryItem,
  deleteReplacedImages,
  GALLERY_UPLOAD_FOLDERS,
  updateGalleryItem,
  uploadGalleryImage,
} from './galleryService.js';

const ARTIST_OPTIONS = ['Durgessh Nayak', 'Sachin Nayak'];

const emptyValues = {
  title: '',
  category: '',
  bodyPart: '',
  tattooStyle: '',
  artist: '',
  price: '',
  altText: '',
  description: '',
  featured: false,
  published: false,
  image: '',
  beforeImage: '',
  afterImage: '',
};

export default function GalleryForm({ item, onCancel, onSaved }) {
  const [values, setValues] = useState(emptyValues);
  const [files, setFiles] = useState({
    image: null,
    beforeImage: null,
    afterImage: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(item ? { ...emptyValues, ...item } : emptyValues);
    setFiles({ image: null, beforeImage: null, afterImage: null });
    setError('');
  }, [item]);

  const updateValue = (event) => {
    const { checked, name, type, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!files.image && !values.image) {
      setError('A primary gallery image is required.');
      return;
    }

    setSaving(true);
    setError('');
    const uploadedUrls = [];

    try {
      const nextImages = {
        image: values.image || '',
        beforeImage: values.beforeImage || '',
        afterImage: values.afterImage || '',
      };
      const replacedImages = [];

      if (files.image) {
        nextImages.image = await uploadGalleryImage(
          files.image,
          values.featured
            ? GALLERY_UPLOAD_FOLDERS.featured
            : GALLERY_UPLOAD_FOLDERS.gallery,
        );
        uploadedUrls.push(nextImages.image);
        if (values.image) replacedImages.push(values.image);
      }
      if (files.beforeImage) {
        nextImages.beforeImage = await uploadGalleryImage(
          files.beforeImage,
          GALLERY_UPLOAD_FOLDERS.beforeAfter,
        );
        uploadedUrls.push(nextImages.beforeImage);
        if (values.beforeImage) replacedImages.push(values.beforeImage);
      }
      if (files.afterImage) {
        nextImages.afterImage = await uploadGalleryImage(
          files.afterImage,
          GALLERY_UPLOAD_FOLDERS.beforeAfter,
        );
        uploadedUrls.push(nextImages.afterImage);
        if (values.afterImage) replacedImages.push(values.afterImage);
      }

      const category = values.category.trim();
      const artist = values.artist.trim();
      const internalTitle =
        values.title.trim() || [category, artist].filter(Boolean).join(' — ') || 'Gallery item';
      const internalAltText =
        values.altText.trim() || [category, artist].filter(Boolean).join(' — ') || internalTitle;

      const payload = {
        image: nextImages.image,
        beforeImage: nextImages.beforeImage,
        afterImage: nextImages.afterImage,
        title: internalTitle,
        category,
        bodyPart: values.bodyPart.trim(),
        tattooStyle: values.tattooStyle.trim(),
        artist,
        price: values.price.trim(),
        altText: internalAltText,
        description: values.description.trim(),
        featured: Boolean(values.featured),
        published: Boolean(values.published),
      };

      if (item?.id) await updateGalleryItem(item.id, payload);
      else await createGalleryItem(payload);

      await deleteReplacedImages(replacedImages);
      onSaved();
    } catch (saveError) {
      if (uploadedUrls.length > 0) {
        await deleteReplacedImages(uploadedUrls).catch(() => undefined);
      }
      setError(saveError.message || 'Gallery item could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const hasLegacyCategory = Boolean(
    values.category && !GALLERY_CATEGORIES.includes(values.category),
  );

  return (
    <section className="gallery-editor" aria-labelledby="gallery-editor-title">
      <div className="gallery-editor-heading">
        <div>
          <p className="admin-kicker">{item ? 'Edit item' : 'New item'}</p>
          <h2 id="gallery-editor-title">
            {item ? 'Edit gallery item' : 'Add gallery item'}
          </h2>
        </div>
        <button className="admin-secondary-button" onClick={onCancel} type="button">
          Cancel
        </button>
      </div>

      <form className="gallery-editor-form" onSubmit={handleSubmit}>
        <div className="gallery-upload-grid gallery-basic-upload-grid">
          <GalleryDropzone
            currentImage={values.image}
            label="Gallery image"
            onFile={(file) => setFiles((current) => ({ ...current, image: file }))}
            required
          />
        </div>

        <div className="gallery-fields-grid">
          <label>Category *
            <select name="category" onChange={updateValue} required value={values.category}>
              <option disabled value="">Select a category</option>
              {hasLegacyCategory && (
                <option value={values.category}>{values.category} (legacy)</option>
              )}
              {GALLERY_CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>Artist
            <select name="artist" onChange={updateValue} value={values.artist}>
              <option value="">Studio / Unassigned</option>
              {ARTIST_OPTIONS.map((artist) => (
                <option key={artist} value={artist}>{artist}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="gallery-checkboxes">
          <label>
            <input checked={values.featured} name="featured" onChange={updateValue} type="checkbox" />
            Featured
          </label>
          <label>
            <input checked={values.published} name="published" onChange={updateValue} type="checkbox" />
            Published
          </label>
        </div>

        <details className="gallery-advanced-details">
          <summary>Advanced details</summary>
          <div className="gallery-upload-grid gallery-advanced-upload-grid">
            <GalleryDropzone
              currentImage={values.beforeImage}
              label="Before image"
              onFile={(file) => setFiles((current) => ({ ...current, beforeImage: file }))}
            />
            <GalleryDropzone
              currentImage={values.afterImage}
              label="After image"
              onFile={(file) => setFiles((current) => ({ ...current, afterImage: file }))}
            />
          </div>
          <div className="gallery-fields-grid">
            <label>Body part
              <input name="bodyPart" onChange={updateValue} value={values.bodyPart} />
            </label>
            <label>Tattoo style
              <input name="tattooStyle" onChange={updateValue} value={values.tattooStyle} />
            </label>
            <label>Price
              <input name="price" onChange={updateValue} value={values.price} />
            </label>
            <label className="gallery-full-field">Image alt text
              <input name="altText" onChange={updateValue} value={values.altText} />
            </label>
            <label className="gallery-full-field">Description
              <textarea name="description" onChange={updateValue} rows="4" value={values.description} />
            </label>
          </div>
        </details>

        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary-button" disabled={saving} type="submit">
          {saving ? 'Uploading and saving…' : item ? 'Save changes' : 'Create gallery item'}
        </button>
      </form>
    </section>
  );
}
