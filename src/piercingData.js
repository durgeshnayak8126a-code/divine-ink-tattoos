import lobePiercing from './assets/piercing/lobe.jpg';
import helixPiercing from './assets/piercing/helix.jpg';
import septumPiercing from './assets/piercing/septum.jpg';
import bellyPiercing from './assets/piercing/belly.jpg';
import lipPiercing from './assets/piercing/lip.jpg';
import tonguePiercing from './assets/piercing/tongue.jpg';
import nosePiercing from './assets/piercing/nose.jpg';
import eyebrowPiercing from './assets/piercing/eyebrow.jpg';

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
  { id: 'builtin-lobe', title: 'Lobe Piercing', builtinKey: 'lobe', image: '', active: true, order: 0 },
  { id: 'builtin-helix', title: 'Helix Piercing', builtinKey: 'helix', image: '', active: true, order: 1 },
  { id: 'builtin-septum', title: 'Septum Piercing', builtinKey: 'septum', image: '', active: true, order: 2 },
  { id: 'builtin-nose', title: 'Nose Piercing', builtinKey: 'nose', image: '', active: true, order: 3 },
  { id: 'builtin-belly', title: 'Belly Piercing', builtinKey: 'belly', image: '', active: true, order: 4 },
  { id: 'builtin-eyebrow', title: 'Eyebrow Piercing', builtinKey: 'eyebrow', image: '', active: true, order: 5 },
  { id: 'builtin-lip', title: 'Lip Piercing', builtinKey: 'lip', image: '', active: true, order: 6 },
  { id: 'builtin-tongue', title: 'Tongue Piercing', builtinKey: 'tongue', image: '', active: true, order: 7 },
]);

export function normalizePiercingItems(items) {
  const source = Array.isArray(items) ? items : defaultPiercingItems;
  return source
    .map((item, index) => ({
      id: String(item?.id || `piercing-${index + 1}`),
      title: String(item?.title || '').trim(),
      builtinKey: String(item?.builtinKey || '').trim(),
      image: String(item?.image || '').trim(),
      active: item?.active !== false,
      order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getPiercingImage(item) {
  return item?.image || builtinPiercingImages[item?.builtinKey] || '';
}

export function getPublicPiercingGallery(items) {
  return normalizePiercingItems(items)
    .filter((item) => item.active && item.title && getPiercingImage(item))
    .map((item) => [getPiercingImage(item), item.title]);
}
