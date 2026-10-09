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
  console.error('Structured-data identity checks FAILED:');
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log(`Structured-data identity checks passed for ${publicPages.length} public pages: no duplicate @id values within a page.`);
