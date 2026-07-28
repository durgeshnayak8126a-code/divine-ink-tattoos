export const FIRESTORE_COLLECTIONS = Object.freeze({
  adminUsers: 'adminUsers',
  auditLogs: 'auditLogs',
  gallery: 'gallery',
  services: 'services',
  reviews: 'reviews',
  faqs: 'faqs',
  offers: 'offers',
  siteSettings: 'siteSettings',
});

export const SITE_SETTING_DOCUMENTS = Object.freeze({
  homepage: 'homepage',
  contact: 'contact',
  seo: 'seo',
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
