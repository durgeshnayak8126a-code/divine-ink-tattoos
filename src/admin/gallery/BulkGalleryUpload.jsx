import { useRef, useState } from 'react';
import { prepareGalleryImage } from './imageProcessing.js';
import {
  DEFAULT_GALLERY_CATEGORY,
  GALLERY_CATEGORY_GROUPS,
} from './galleryCategories.js';
import {
  createGalleryItem,
  deleteReplacedImages,
  GALLERY_UPLOAD_FOLDERS,
  uploadGalleryImage,
} from './galleryService.js';

function titleFromFile(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function BulkGalleryUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState(DEFAULT_GALLERY_CATEGORY);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const uploadFiles = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    let completed = 0;

    try {
      for (const originalFile of files) {
        let uploadedUrl = '';
        try {
          const file = await prepareGalleryImage(originalFile);
          uploadedUrl = await uploadGalleryImage(file, GALLERY_UPLOAD_FOLDERS.gallery);
          const title = titleFromFile(originalFile.name);
          await createGalleryItem({
            image: uploadedUrl,
            beforeImage: '',
            afterImage: '',
            title,
            category,
            bodyPart: 'Not specified',
            tattooStyle: 'Custom',
            artist: 'Divine Ink',
            price: 'Contact studio',
            altText: `${title} tattoo by Divine Ink Tattoos`,
            description: '',
            featured: false,
            published: true,
          });
          completed += 1;
          setMessage(`Uploaded ${completed} of ${files.length} images…`);
        } catch (uploadError) {
          if (uploadedUrl) await deleteReplacedImages([uploadedUrl]).catch(() => undefined);
          throw uploadError;
        }
      }
      setMessage(`${completed} images uploaded and published.`);
      onUploaded();
    } catch (uploadError) {
      setError(uploadError.message || `Upload stopped after ${completed} images.`);
      onUploaded();
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="bulk-gallery-upload">
      <label>Category
        <select
          disabled={busy}
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          {GALLERY_CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.categories.map((categoryOption) => (
                <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <button
        className="admin-secondary-button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {busy ? 'Uploading…' : 'Upload multiple images'}
      </button>
      <input
        ref={inputRef}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="gallery-file-input"
        multiple
        onChange={(event) => uploadFiles(event.target.files)}
        type="file"
      />
      {message && <p className="admin-success" role="status">{message}</p>}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}
