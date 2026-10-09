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

  const socialMeta = [
    ['property', 'og:title'],
    ['property', 'og:description'],
    ['property', 'og:image'],
    ['name', 'twitter:card'],
    ['name', 'twitter:title'],
    ['name', 'twitter:description'],
    ['name', 'twitter:image'],
  ];

  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const readMetaContent = (attribute, key) => {
    const matches = metaTags.filter((tag) =>
      tag.includes(attribute + '="' + key + '"') ||
      tag.includes(attribute + "='" + key + "'"),
    );
    return matches.map((tag) => tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] ?? '');
  };

  const documentTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const ogTitles = readMetaContent('property', 'og:title');
  const twitterTitles = readMetaContent('name', 'twitter:title');
  const ogImages = readMetaContent('property', 'og:image');
  const twitterImages = readMetaContent('name', 'twitter:image');

  for (const [attribute, key] of socialMeta) {
    const matches = readMetaContent(attribute, key);
    if (matches.length !== 1 || !matches[0].trim()) {
      failures.push(\`Public page \${route} must have exactly one non-empty \${key} meta value; found \${matches.length}.\`);
    }
  }

  if (documentTitle && ogTitles.length === 1 && ogTitles[0] !== documentTitle) {
    failures.push(\`Open Graph title must match the document title on \${route}.\`);
  }
  if (documentTitle && twitterTitles.length === 1 && twitterTitles[0] !== documentTitle) {
    failures.push(\`Twitter title must match the document title on \${route}.\`);
  }
  if (ogImages.length === 1 && twitterImages.length === 1 && ogImages[0] !== twitterImages[0]) {
    failures.push(\`Open Graph and Twitter images must match on \${route}.\`);
  }

  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];');
    const escapedKey = key.replace(/[.*+?^{}()|[\]\\]/g, '\\  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];');
    const pattern = new RegExp(
      `<meta(?=[^>]*\\b${escapedAttribute}=["']${escapedKey}["'])(?=[^>]*\\bcontent=["']([^"']*)["'])[^>]*>`,
      'gi',
    );
    return [...html.matchAll(pattern)].map((match) => match[1]);
  };

  const documentTitle = html.match(/<title>([\\s\\S]*?)<\\/title>/i)?.[1];
  const ogTitles = readMetaContent('property', 'og:title');
  const twitterTitles = readMetaContent('name', 'twitter:title');
  const ogImages = readMetaContent('property', 'og:image');
  const twitterImages = readMetaContent('name', 'twitter:image');

  for (const [attribute, key] of socialMeta) {
    const matches = readMetaContent(attribute, key);
    if (matches.length !== 1 || !matches[0].trim()) {
      failures.push(`Public page ${route} must have exactly one non-empty ${key} meta value; found ${matches.length}.`);
    }
  }

  if (documentTitle && ogTitles.length === 1 && ogTitles[0] !== documentTitle) {
    failures.push(`Open Graph title must match the document title on ${route}.`);
  }
  if (documentTitle && twitterTitles.length === 1 && twitterTitles[0] !== documentTitle) {
    failures.push(`Twitter title must match the document title on ${route}.`);
  }
  if (ogImages.length === 1 && twitterImages.length === 1 && ogImages[0] !== twitterImages[0]) {
    failures.push(`Open Graph and Twitter images must match on ${route}.`);
  }

  const scripts = [
    ...html.matchAll(/<script type="application\\/ld\\+json">([\\s\\S]*?)<\\/script>/gi),
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
}

if (failures.length) {
  console.error('Public URL and structured-data checks FAILED:');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log(`Public URL and structured-data checks passed for ${publicPages.length} public pages: canonical/OG URL parity and no duplicate JSON-LD @id values.`);
