export const adminAvatarStoragePath = (userId, fileName) =>
  `admin-avatars/${userId}/${fileName}`;

export const GALLERY_STORAGE_FOLDERS = Object.freeze({
  gallery: 'gallery',
  beforeAfter: 'before-after',
  featured: 'featured',
});

export const galleryStoragePath = (folder, fileName) => {
  if (!Object.values(GALLERY_STORAGE_FOLDERS).includes(folder)) {
    throw new Error('Invalid gallery storage folder.');
  }
  return `${folder}/${fileName}`;
};

