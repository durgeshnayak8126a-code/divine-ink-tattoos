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
      '@type': ['TattooParlor', 'LocalBusiness'],
      '@id': 'https://divineinktattoos.in/#localbusiness',
      name: 'Divine Ink Tattoos & Piercing Studio',
      alternateName: 'Divine Ink Tattoos',
      url: 'https://divineinktattoos.in/',
      telephone: '+918445702782',
      hasMap: 'https://www.google.com/maps?cid=13259589601998313340',
      sameAs: [
        'https://www.google.com/maps?cid=13259589601998313340',
        'https://www.instagram.com/divineinktattoos1/',
        'https://www.facebook.com/profile.php?id=100078466583354'
      ],
      image: socialImage,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Jharsa Road',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122001',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 28.4529, longitude: 77.0508791 },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
      areaServed: { '@type': 'City', name: 'Gurugram', alternateName: 'Gurgaon' },
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
