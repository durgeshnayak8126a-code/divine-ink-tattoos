import durgessh from './assets/team/durgessh-nayak.png';
import sachin from './assets/team/sachin-nayak.jpg';

export const DEFAULT_ARTISTS = Object.freeze([
  {
    id: 'durgessh-nayak',
    name: 'Durgessh Nayak',
    role: 'Founder & Head Tattoo Artist',
    bio: 'Custom concepts, realism, portrait work, religious tattoos and cover-up planning.',
    image: '',
    active: true,
  },
  {
    id: 'sachin-nayak',
    name: 'Sachin Nayak',
    role: 'Senior Tattoo Artist',
    bio: 'Minimal, geometric, lettering, black-and-grey, color and detailed custom tattoo work.',
    image: '',
    active: true,
  },
]);

const FALLBACK_IMAGES = Object.freeze({
  'durgessh-nayak': durgessh,
  'sachin-nayak': sachin,
});

export function normalizeArtists(value) {
  if (!Array.isArray(value)) {
    return DEFAULT_ARTISTS.map((artist) => ({ ...artist }));
  }

  return value
    .map((artist, index) => ({
      id: String(artist?.id || `artist-${index + 1}`),
      name: String(artist?.name || '').trim(),
      role: String(artist?.role || '').trim(),
      bio: String(artist?.bio || '').trim(),
      image: String(artist?.image || '').trim(),
      active: artist?.active !== false,
    }))
    .filter((artist) => artist.name);
}

export function getArtistDisplayImage(artist) {
  return String(artist?.image || '').trim() || FALLBACK_IMAGES[artist?.id] || '';
}

export function hasBuiltInArtistImage(artistId) {
  return Boolean(FALLBACK_IMAGES[artistId]);
}
