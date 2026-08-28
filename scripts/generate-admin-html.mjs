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
  ['admin', 'Admin Dashboard', 'Private administration area for Divine Ink Tattoos.'],
  ['admin/login', 'Admin Login', 'Secure administrator login for Divine Ink Tattoos.'],
  ['admin/gallery', 'Gallery CMS', 'Private gallery content management for Divine Ink Tattoos.'],
  ['admin/artists', 'Artists CMS', 'Private artist profile management for Divine Ink Tattoos.'],
  ['admin/piercing', 'Piercing CMS', 'Private piercing content and photo management for Divine Ink Tattoos.'],
  ['admin/services', 'Services CMS', 'Private service content management for Divine Ink Tattoos.'],
  ['admin/homepage', 'Homepage CMS', 'Private homepage content management for Divine Ink Tattoos.'],
  ['admin/reviews', 'Reviews CMS', 'Private review content management for Divine Ink Tattoos.'],
  ['admin/faqs', 'FAQs CMS', 'Private FAQ content management for Divine Ink Tattoos.'],
  ['admin/offers', 'Offers CMS', 'Private offer content management for Divine Ink Tattoos.'],
  ['admin/contact', 'Contact CMS', 'Private contact content management for Divine Ink Tattoos.'],
  ['admin/seo', 'SEO CMS', 'Private SEO configuration for Divine Ink Tattoos.'],
].map(([path, title, description]) => ({
  path: path.split('/'),
  title: `${title} | Divine Ink Tattoos`,
  description,
}));

for (const page of pages) {
  const directory = resolve(distDirectory, ...page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, 'index.html'),
    createAdminHtml(page.title, page.description),
  );
}

console.log(`Generated ${pages.length} noindex admin HTML entries.`);
