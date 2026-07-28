import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';

const distDirectory = resolve('dist');
const homepageHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';

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
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://divineinktattoos.in/' },
        { '@type': 'ListItem', position: 2, name: location.name, item: canonical },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'TattooParlor'],
      '@id': 'https://divineinktattoos.in/#localbusiness',
      name: 'Divine Ink Tattoos & Piercing Studio',
      url: canonical,
      telephone: '+918445702782',
      image: socialImage,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 155, Basement, near Apollo Pharmacy, Main HUDA Market, Sector 31',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122001',
        addressCountry: 'IN',
      },
      areaServed: { '@type': 'Place', name: `${location.name}, Gurugram` },
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
