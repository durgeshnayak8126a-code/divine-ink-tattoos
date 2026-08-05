export const GALLERY_CATEGORY_GROUPS = Object.freeze([
  Object.freeze({
    label: 'Tattoo categories',
    categories: Object.freeze([
      'Custom Tattoo',
      'Minimal Tattoo',
      'Fine Line Tattoo',
      'Name Tattoo',
      'Black & Grey Tattoo',
      'Colour Tattoo',
      'Portrait Tattoo',
      'Realism Tattoo',
      'Religious Tattoo',
      'Cover-Up Tattoo',
      'Sleeve Tattoo',
      'Couple Tattoo',
      'Memorial Tattoo',
      'Geometric Tattoo',
      'Floral Tattoo',
    ]),
  }),
  Object.freeze({
    label: 'Piercing categories',
    categories: Object.freeze([
      'Ear Piercing',
      'Nose Piercing',
      'Belly Piercing',
      'Eyebrow Piercing',
      'Industrial Piercing',
      'Lip Piercing',
      'Tongue Piercing',
      'Septum Piercing',
    ]),
  }),
  Object.freeze({
    label: 'Other',
    categories: Object.freeze([
      'Studio',
      'Artist at Work',
      'Before & After',
    ]),
  }),
]);

export const GALLERY_CATEGORIES = Object.freeze(
  GALLERY_CATEGORY_GROUPS.flatMap(({ categories }) => categories),
);

export const DEFAULT_GALLERY_CATEGORY = GALLERY_CATEGORIES[0];
export const LEGACY_GALLERY_CATEGORY = 'Tattoo';

export function isValidGalleryCategory(category) {
  return (
    category === LEGACY_GALLERY_CATEGORY ||
    GALLERY_CATEGORIES.includes(category)
  );
}
