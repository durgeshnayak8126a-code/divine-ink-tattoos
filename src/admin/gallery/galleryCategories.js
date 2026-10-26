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
      'Animal Tattoo',
      'Pet Tattoo',
      'Lion Tattoo',
      'Tiger Tattoo',
      'Wolf Tattoo',
      'Bird Tattoo',
      'Mandala Tattoo',
      'Script & Lettering Tattoo',
      'Anime Tattoo',
      'Dotwork Tattoo',
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

export const LEGACY_GALLERY_CATEGORIES = Object.freeze([
  'Tattoo',
  'Portrait',
  'Geometric',
  'Minimal',
  'Religious',
  'Couple',
  'Realism',
  'Color',
  'Floral',
]);

export const DEFAULT_GALLERY_CATEGORY = GALLERY_CATEGORIES[0];
export const LEGACY_GALLERY_CATEGORY = 'Tattoo';

export function isValidGalleryCategory(category) {
  return (
    LEGACY_GALLERY_CATEGORIES.includes(category) ||
    GALLERY_CATEGORIES.includes(category)
  );
}
