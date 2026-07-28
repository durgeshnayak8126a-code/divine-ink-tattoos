import { useEffect, useRef } from 'react';

export default function GalleryPreview({ item, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="gallery-preview-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="gallery-preview-title"
        aria-modal="true"
        className="gallery-preview"
        role="dialog"
      >
        <button
          ref={closeRef}
          aria-label="Close gallery preview"
          className="gallery-preview-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <img src={item.image} alt={item.altText} title={item.title} />
        <p className="admin-kicker">{item.category}</p>
        <h2 id="gallery-preview-title">{item.title}</h2>
        <p>{item.description}</p>
        {(item.beforeImage || item.afterImage) && (
          <div className="gallery-before-after">
            {item.beforeImage && (
              <figure>
                <img src={item.beforeImage} alt={`Before ${item.altText}`} />
                <figcaption>Before</figcaption>
              </figure>
            )}
            {item.afterImage && (
              <figure>
                <img src={item.afterImage} alt={`After ${item.altText}`} />
                <figcaption>After</figcaption>
              </figure>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

