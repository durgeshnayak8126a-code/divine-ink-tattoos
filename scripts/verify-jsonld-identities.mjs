import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';
import { servicePages } from '../src/serviceData.js';

const publicPages = [
  ['/', 'index.html'],
  ['/studio/', 'studio/index.html'],
  ...servicePages.map((page) => [
    `/services/${page.slug}/`,
    `services/${page.slug}/index.html`,
  ]),
  ...locationPages.map((page) => [
    `/locations/${page.slug}/`,
    `locations/${page.slug}/index.html`,
  ]),
];

const failures = [];

function collectEntities(value, entities) {
  if (Array.isArray(value)) {
    for (const item of value) collectEntities(item, entities);
    return;
  }

  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value['@graph'])) {
    collectEntities(value['@graph'], entities);
    return;
  }

  if (typeof value['@id'] === 'string' && value['@id'].trim()) {
    entities.push(value);
  }
}

for (const [route, relativePath] of publicPages) {
  const path = resolve('dist', relativePath);
  let html;

  try {
    html = await readFile(path, 'utf8');
  } catch {
    failures.push(`Missing generated public page ${route} (${relativePath}).`);
    continue;
  }

  const conflictingListingPatterns = [
    /\bshop\s*no\.?\s*189\b/i,
    /\bshop\s*no\.?\s*9\b/i,
    /\bsector\s*38\b/i,
    /\bislampur\b/i,
    /\bsamvit\s+hospital\b/i,
    /instagram\.com\/angeltattoodesignstudio/i,
    /instagram\.com\/devtattoostudio_/i,
    /\+91[\s-]*99580[\s-]*47997/i,
  ];
  for (const pattern of conflictingListingPatterns) {
    if (pattern.test(html)) {
      failures.push(`Public page ${route} contains conflicting third-party listing details matching ${pattern}.`);
    }
  }

  const canonicalMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi)];
  const ogUrlMatches = [...html.matchAll(/<meta\s+property="og:url"\s+content="([^"]+)"\s*\/?\s*>/gi)];
  const expectedUrl = `https://divineinktattoos.in${route}`;

  if (canonicalMatches.length !== 1) {
    failures.push(`Public page ${route} must have exactly one canonical URL; found ${canonicalMatches.length}.`);
  } else if (canonicalMatches[0][1] !== expectedUrl) {
    failures.push(`Canonical URL mismatch on ${route}: expected ${expectedUrl}, found ${canonicalMatches[0][1]}.`);
  }

  if (ogUrlMatches.length !== 1) {
    failures.push(`Public page ${route} must have exactly one Open Graph URL; found ${ogUrlMatches.length}.`);
  } else if (ogUrlMatches[0][1] !== expectedUrl) {
    failures.push(`Open Graph URL mismatch on ${route}: expected ${expectedUrl}, found ${ogUrlMatches[0][1]}.`);
  }

  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];
  const entities = [];

  for (const [index, match] of scripts.entries()) {
    try {
      collectEntities(JSON.parse(match[1]), entities);
    } catch (error) {
      failures.push(`Invalid JSON-LD on ${route}, block ${index + 1}: ${error.message}`);
    }
  }

  const ids = entities.map((entity) => entity['@id']);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      failures.push(`Duplicate JSON-LD @id "${id}" on ${route}.`);
    }
    seen.add(id);
  }

  const canonicalBusinessId = 'https://divineinktattoos.in/#localbusiness';
  const canonicalBusinesses = entities.filter((entity) => entity['@id'] === canonicalBusinessId);
  if (canonicalBusinesses.length !== 1) {
    failures.push(`Public page ${route} must reference exactly one canonical Divine Ink business entity; found ${canonicalBusinesses.length}.`);
  } else {
    const business = canonicalBusinesses[0];
    const address = business.address || {};
    const officialSocials = Array.isArray(business.sameAs) ? business.sameAs : [];
    if (business.name !== 'Divine Ink Tattoos & Piercing Studio') {
      failures.push(`Canonical business name mismatch on ${route}.`);
    }
    if (business.telephone !== '+918445702782') {
      failures.push(`Canonical business phone mismatch on ${route}.`);
    }
    if (
      !String(address.streetAddress || '').includes('Shop No. 155') ||
      address.addressLocality !== 'Gurugram' ||
      address.postalCode !== '122001'
    ) {
      failures.push(`Canonical business address mismatch on ${route}; only the Sector 31 studio address is allowed.`);
    }
    if (business.hasMap !== 'https://www.google.com/maps?cid=13259589601998313340') {
      failures.push(`Canonical Google Maps identity mismatch on ${route}.`);
    }
    if (!officialSocials.includes('https://www.instagram.com/divineinktattoos1/')) {
      failures.push(`Canonical official Instagram identity is missing on ${route}.`);
    }
    if (
      ['shop no. 189', 'shop no 189', 'shop no. 9', 'sector 38', 'islampur', 'samvit hospital', 'instagram.com/angeltattoodesignstudio', 'instagram.com/devtattoostudio_']
        .some((value) => JSON.stringify(business).toLowerCase().includes(value))
    ) {
      failures.push(`Canonical business entity on ${route} contains conflicting third-party listing details.`);
    }
  }
}

if (failures.length) {
  console.error('Public URL and structured-data checks FAILED:');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log(`Public URL and structured-data checks passed for ${publicPages.length} public pages: canonical/OG URL parity and no duplicate JSON-LD @id values.`);
