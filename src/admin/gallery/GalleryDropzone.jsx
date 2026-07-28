import { useRef, useState } from 'react';
import {
  formatFileSize,
  prepareGalleryImage,
} from './imageProcessing.js';

export default function GalleryDropzone({
  currentImage,
  label,
  onFile,
  required = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setProcessing(true);

    try {
      const prepared = await prepareGalleryImage(file);
      setFileName(`${prepared.name} · ${formatFileSize(prepared.size)}`);
      onFile(prepared);
    } catch (processingError) {
      setError(processingError.message);
      onFile(null);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="gallery-upload-field">
      <span className="gallery-field-label">
        {label}{required ? ' *' : ''}
      </span>
      <button
        className={`gallery-dropzone${dragging ? ' is-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        type="button"
      >
        {processing
          ? 'Compressing image…'
          : fileName || 'Drop image here or click to browse'}
      </button>
      <input
        ref={inputRef}
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="gallery-file-input"
        onChange={(event) => handleFile(event.target.files?.[0])}
        type="file"
      />
      <small>JPG, JPEG, PNG or WebP · maximum 10MB</small>
      {currentImage && !fileName && (
        <a href={currentImage} target="_blank" rel="noreferrer">
          View current image
        </a>
      )}
      {error && <p className="admin-error" role="alert">{error}</p>}
    </div>
  );
}

