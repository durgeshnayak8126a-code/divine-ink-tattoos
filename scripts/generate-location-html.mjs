import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';

const distDirectory = resolve('dist');
const homepageHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';
const publicRobotsContent = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta(?=[^>]*${attribute}=["']${key}["'])(?=[^>]*content=["'][^"']*["'])[^>]*>`, 'i');
  return html.replace(pattern, `<meta ${attribute}="${key}" content="${escapeAttribute(content)}">`);
}

function createLocationSchema(location) {
  const canonical = `https://divineinktattoos.in/locations/${location.slug}/`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://divineinktattoos.in/' },
        { '@type': 'ListItem', position: 2, name: location.name, item: canonical },
      ],
    },

    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: location.metaTitle,
      description: location.description,
      isPartOf: { '@id': 'https://divineinktattoos.in/#website' },
      about: { '@id': 'https://divineinktattoos.in/#localbusiness' },
      mainEntity: { '@id': 'https://divineinktattoos.in/#localbusiness' },
      breadcrumb: { '@id': `${canonical}#breadcrumb` },
      inLanguage: 'en-IN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: location.faq.map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer },
      })),
    },
  ];
}

for (const location of locationPages) {
  const canonical = `https://divineinktattoos.in/locations/${location.slug}/`;
  let html = homepageHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${location.metaTitle}</title>`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}">`);

  html = replaceMeta(html, 'name', 'description', location.description);
  html = replaceMeta(html, 'name', 'robots', publicRobotsContent);
  html = replaceMeta(html, 'property', 'og:title', location.metaTitle);
  html = replaceMeta(html, 'property', 'og:description', location.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:type', 'website');
  html = replaceMeta(html, 'property', 'og:image', socialImage);
  html = replaceMeta(html, 'name', 'twitter:card', 'summary');
  html = replaceMeta(html, 'name', 'twitter:title', location.metaTitle);
  html = replaceMeta(html, 'name', 'twitter:description', location.description);
  html = replaceMeta(html, 'name', 'twitter:image', socialImage);
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(createLocationSchema(location)).replaceAll('<', '\\u003c')}</script></head>`);

  const pageDirectory = resolve(distDirectory, 'locations', location.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, 'index.html'), html);
}

console.log(`Generated ${locationPages.length} location-page HTML entries.`);
