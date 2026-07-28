const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2400;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

function fileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

export function validateGalleryImage(file) {
  if (!(file instanceof File)) {
    throw new Error('Select a valid image file.');
  }
  if (
    !ALLOWED_MIME_TYPES.has(file.type) ||
    !ALLOWED_EXTENSIONS.has(fileExtension(file.name))
  ) {
    throw new Error('Only JPG, JPEG, PNG and WebP images are allowed.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must not exceed 10MB.');
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('The selected image could not be processed.'));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('WebP conversion failed.'));
      },
      'image/webp',
      0.82,
    );
  });
}

export async function prepareGalleryImage(file) {
  validateGalleryImage(file);
  if (file.type === 'image/webp') return file;

  const image = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) throw new Error('Image compression is unavailable.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webpBlob = await canvasToBlob(canvas);
  if (webpBlob.size > MAX_FILE_SIZE) {
    throw new Error('Compressed WebP image still exceeds 10MB.');
  }
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'gallery-image';
  return new File([webpBlob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
