import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const distDirectory = resolve('dist');
const homepageHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');

function createAdminHtml(title, description) {
  return homepageHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
      '<meta name="robots" content="noindex, nofollow, noarchive">',
    )
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${description}">`,
    )
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, '')
    .replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi, '')
    .replace(
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/gi,
      '',
    );
}

const pages = [
  {
    path: ['admin'],
    title: 'Admin Dashboard | Divine Ink Tattoos',
    description: 'Private administration area for Divine Ink Tattoos.',
  },
  {
    path: ['admin', 'login'],
    title: 'Admin Login | Divine Ink Tattoos',
    description: 'Secure administrator login for Divine Ink Tattoos.',
  },
  {
    path: ['admin', 'gallery'],
    title: 'Gallery CMS | Divine Ink Tattoos',
    description: 'Private gallery content management for Divine Ink Tattoos.',
  },
];

for (const page of pages) {
  const directory = resolve(distDirectory, ...page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, 'index.html'),
    createAdminHtml(page.title, page.description),
  );
}

console.log(`Generated ${pages.length} noindex admin HTML entries.`);
