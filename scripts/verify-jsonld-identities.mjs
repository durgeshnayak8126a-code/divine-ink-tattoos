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

  const unrelatedSignals = [
    [/sector\s*38/i, 'a Sector 38 location'],
    [/samvit hospital/i, 'the unrelated Samvit Hospital address'],
    [/shop no\.?\s*9\b/i, 'an unrelated Shop No. 9 address'],
    [/shop no\.?\s*189\b/i, 'the conflicting Shop No. 189 address'],
    [/devtattoostudio|devtattoos/i, 'an unrelated Dev Tattoo social profile'],
    [/angel tattoo design studio/i, 'an unrelated tattoo studio identity'],
  ];
  for (const [pattern, label] of unrelatedSignals) {
    if (pattern.test(html)) {
      failures.push('Official page ' + route + ' contains ' + label + '.');
    }
  }

  const readMeta = (attribute, key) => {
    const tagPattern = new RegExp('<meta[^>]*\\b' + attribute + '=["\\x27]' + key + '["\\x27][^>]*>', 'i');
    const tag = html.match(tagPattern)?.[0];
    return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? '';
  };
  for (const [attribute, key] of [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:image'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ]) {
    if (!readMeta(attribute, key).trim()) {
      failures.push('Public page ' + route + ' is missing non-empty ' + key + ' metadata.');
    }
  }
  const officialSocialImage = 'https://divineinktattoos.in/divine-ink-logo.png';
  if (readMeta('property', 'og:image') !== officialSocialImage) {
    failures.push('Open Graph image on ' + route + ' must use the official Divine Ink logo.');
  }
  if (readMeta('name', 'twitter:image') !== officialSocialImage) {
    failures.push('Twitter image on ' + route + ' must use the official Divine Ink logo.');
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

  const businessEntities = entities.filter((entity) => {
    const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']];
    return types.some((type) => ['LocalBusiness', 'TattooParlor'].includes(type));
  });

  for (const business of businessEntities) {
    const address = business.address;
    const streetAddress = typeof address === 'object' && address ? address.streetAddress : '';
    const phone = business.telephone;
    const mapUrl = business.hasMap;
    if (!/shop no\\.?\\s*155/i.test(String(streetAddress))) {\n      failures.push('Structured business address on ' + route + ' must identify the verified Shop No. 155 studio.');\n    }\n    if (!String(streetAddress).includes('Sector 31')) {
      failures.push('Structured business address on ' + route + ' must identify the verified Sector 31 studio.');
    }
    if (/sector\s*38|samvit hospital|shop no\.?\s*9/i.test(String(streetAddress))) {
      failures.push('Structured business address on ' + route + ' contains a conflicting Sector 38 location.');
    }
    if (phone && phone !== '+918445702782' && phone !== '+91 84457 02782') {
      failures.push('Structured business phone mismatch on ' + route + ': ' + phone + '.');
    }
    if (route === '/' && mapUrl !== 'https://www.google.com/maps?cid=13259589601998313340') {
      failures.push('Homepage LocalBusiness schema must link to the official Sector 31 Google Maps profile.');
    }
  }

  if (route === '/' && businessEntities.length !== 1) {
    failures.push('Homepage must have exactly one LocalBusiness/TattooParlor entity; found ' + businessEntities.length + '.');
  }

  if (route === '/') {
    const officialInstagram = 'https://www.instagram.com/divineinktattoos1/';
    const organization = entities.find((entity) => {
      const types = Array.isArray(entity['@type']) ? entity['@type'] : [entity['@type']];
      return types.includes('Organization') && entity['@id'] === 'https://divineinktattoos.in/#organization';
    });
    const organizationSocials = Array.isArray(organization?.sameAs) ? organization.sameAs : [];
    const businessSocials = Array.isArray(businessEntities[0]?.sameAs) ? businessEntities[0].sameAs : [];

    if (!organizationSocials.includes(officialInstagram)) {
      failures.push('Homepage Organization schema must link the official Instagram profile @divineinktattoos1.');
    }
    if (!businessSocials.includes(officialInstagram)) {
      failures.push('Homepage LocalBusiness schema must link the official Instagram profile @divineinktattoos1.');
    }

    for (const [entityName, socials] of [
      ['Organization', organizationSocials],
      ['LocalBusiness', businessSocials],
    ]) {
      const instagramLinks = socials.filter((url) => /instagram\.com/i.test(url));
      if (instagramLinks.some((url) => url !== officialInstagram)) {
        failures.push('Homepage ' + entityName + ' schema contains an Instagram URL other than the official @divineinktattoos1 profile.');
      }
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
}

if (failures.length) {
  console.error('Public URL and structured-data checks FAILED:');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log(`Public URL and structured-data checks passed for ${publicPages.length} public pages: canonical/OG URL parity and no duplicate JSON-LD @id values.`);
