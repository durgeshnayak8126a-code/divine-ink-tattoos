import lobePiercing from './assets/piercing/lobe.jpg';
import helixPiercing from './assets/piercing/helix.jpg';
import septumPiercing from './assets/piercing/septum.jpg';
import bellyPiercing from './assets/piercing/belly.jpg';
import lipPiercing from './assets/piercing/lip.jpg';
import tonguePiercing from './assets/piercing/tongue.jpg';
import nosePiercing from './assets/piercing/nose.jpg';
import eyebrowPiercing from './assets/piercing/eyebrow.jpg';

const PREVIEW_STORAGE_KEY = 'divine-ink-piercing-preview-v2';

const builtinPiercingImages = Object.freeze({
  lobe: lobePiercing,
  helix: helixPiercing,
  septum: septumPiercing,
  nose: nosePiercing,
  belly: bellyPiercing,
  eyebrow: eyebrowPiercing,
  lip: lipPiercing,
  tongue: tonguePiercing,
});

export const defaultPiercingItems = Object.freeze([
  { id: 'builtin-lobe', title: 'Lobe Piercing', builtinKey: 'lobe', images: [], includeOriginal: true, active: true, order: 0 },
  { id: 'builtin-helix', title: 'Helix Piercing', builtinKey: 'helix', images: [], includeOriginal: true, active: true, order: 1 },
  { id: 'builtin-septum', title: 'Septum Piercing', builtinKey: 'septum', images: [], includeOriginal: true, active: true, order: 2 },
  { id: 'builtin-nose', title: 'Nose Piercing', builtinKey: 'nose', images: [], includeOriginal: true, active: true, order: 3 },
  { id: 'builtin-belly', title: 'Belly Piercing', builtinKey: 'belly', images: [], includeOriginal: true, active: true, order: 4 },
  { id: 'builtin-eyebrow', title: 'Eyebrow Piercing', builtinKey: 'eyebrow', images: [], includeOriginal: true, active: true, order: 5 },
  { id: 'builtin-lip', title: 'Lip Piercing', builtinKey: 'lip', images: [], includeOriginal: true, active: true, order: 6 },
  { id: 'builtin-tongue', title: 'Tongue Piercing', builtinKey: 'tongue', images: [], includeOriginal: true, active: true, order: 7 },
]);

function uniqueImageUrls(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || '').trim()).filter(Boolean))];
}

export function normalizePiercingItems(items) {
  const source = Array.isArray(items) ? items : defaultPiercingItems;
  return source
    .map((item, index) => {
      const builtinKey = String(item?.builtinKey || '').trim();
      const legacyImage = String(item?.image || '').trim();
      return {
        id: String(item?.id || `piercing-${index + 1}`),
        title: String(item?.title || '').trim(),
        builtinKey,
        images: uniqueImageUrls(Array.isArray(item?.images) ? item.images : legacyImage ? [legacyImage] : []),
        includeOriginal: Boolean(builtinKey) && item?.includeOriginal !== false,
        active: item?.active !== false,
        order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getOriginalPiercingImage(item) {
  return builtinPiercingImages[item?.builtinKey] || '';
}

export function getPiercingImages(item) {
  if (!item) return [];
  const images = [];
  const original = getOriginalPiercingImage(item);
  if (item.includeOriginal && original) images.push(original);
  images.push(...uniqueImageUrls(item.images));
  return images;
}

export function getPreviewPiercingItems(fallbackItems) {
  if (typeof window === 'undefined') return normalizePiercingItems(fallbackItems);
  const isProduction = ['divineinktattoos.in', 'www.divineinktattoos.in'].includes(window.location.hostname);
  if (isProduction) return normalizePiercingItems(fallbackItems);
  try {
    const stored = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? normalizePiercingItems(stored) : normalizePiercingItems(fallbackItems);
  } catch {
    return normalizePiercingItems(fallbackItems);
  }
}

export function getPublicPiercingGallery(items) {
  return normalizePiercingItems(items)
    .filter((item) => item.active && item.title)
    .flatMap((item) => getPiercingImages(item).map((src, photoIndex) => ({
      id: `${item.id}-${photoIndex}`,
      src,
      title: item.title,
    })));
}

export { PREVIEW_STORAGE_KEY };
