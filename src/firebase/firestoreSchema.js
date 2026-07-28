export const FIRESTORE_COLLECTIONS = Object.freeze({
  adminUsers: 'adminUsers',
  auditLogs: 'auditLogs',
  gallery: 'gallery',
});

export const adminUserDocumentPath = (userId) =>
  `${FIRESTORE_COLLECTIONS.adminUsers}/${userId}`;

export const GALLERY_FIELDS = Object.freeze([
  'image',
  'beforeImage',
  'afterImage',
  'title',
  'category',
  'bodyPart',
  'tattooStyle',
  'artist',
  'price',
  'altText',
  'description',
  'featured',
  'createdAt',
  'updatedAt',
  'published',
]);
