import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';
import { servicePages } from '../src/serviceData.js';

const siteUrl = 'https://divineinktattoos.in';
const distSitemap = resolve('dist', 'sitemap.xml');

function latestGitDate(paths) {
  const dates = [];
  for (const path of paths) {
    try {
      const value = execFileSync(
        'git',
        ['log', '-1', '--format=%cs', '--', path],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) dates.push(value);
    } catch {
      // If Git history is unavailable in a shallow build, omit lastmod instead of guessing.
    }
  }
  return dates.sort().at(-1) || '';
}

function urlEntry(pathname, lastmod = '') {
  const loc = `${siteUrl}${pathname}`;
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

const homepageLastmod = latestGitDate([
  'index.html',
  'src/App.jsx',
  'src/artists.js',
  'src/usePublicCms.js',
  'src/usePublicGallery.js',
]);

const serviceLastmod = latestGitDate([
  'src/serviceData.js',
  'src/ServicePage.jsx',
  'src/SeoManager.jsx',
  'scripts/generate-service-html.mjs',
]);

const locationLastmod = latestGitDate([
  'src/locationData.js',
  'src/LocationPage.jsx',
  'src/LocationSeoManager.jsx',
  'scripts/generate-location-html.mjs',
]);

const entries = [
  urlEntry('/', homepageLastmod),
  ...servicePages.map((service) => urlEntry(`/services/${service.slug}/`, serviceLastmod)),
  ...locationPages.map((location) => urlEntry(`/locations/${location.slug}/`, locationLastmod)),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

await writeFile(distSitemap, sitemap, 'utf8');
console.log(`Generated sitemap with ${entries.length} URLs.`);
