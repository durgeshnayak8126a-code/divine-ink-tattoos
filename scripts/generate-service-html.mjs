import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { servicePages } from '../src/serviceData.js';

const distDirectory = resolve('dist');
const homepageHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta(?=[^>]*${attribute}=["']${key}["'])(?=[^>]*content=["'][^"']*["'])[^>]*>`,
    'i',
  );
  return html.replace(
    pattern,
    `<meta ${attribute}="${key}" content="${escapeAttribute(content)}">`,
  );
}

function getSeoMeta(service) {
  if (service.slug === 'fine-line-tattoos') {
    return {
      title: 'Fine Line Tattoo Artist in Gurugram | Divine Ink Sector 31',
      description:
        'Fine line and minimal tattoo artist in Sector 31, Gurugram. Explore clean linework, custom small tattoos, healed-result guidance, 24x7 confirmed bookings and design-based pricing at Divine Ink.',
    };
  }

  return {
    title: service.metaTitle,
    description: service.description,
  };
}

for (const service of servicePages) {
  const canonical = `https://divineinktattoos.in/services/${service.slug}/`;
  const seo = getSeoMeta(service);
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://divineinktattoos.in/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: service.name,
          item: canonical,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: service.name,
      serviceType: service.name,
      description: seo.description,
      url: canonical,
      areaServed: {
        '@type': 'City',
        name: 'Gurugram',
      },
      provider: {
        '@id': 'https://divineinktattoos.in/#localbusiness',
      },
    },
  ];

  let html = homepageHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${seo.title}</title>`)
    .replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}">`,
    );

  html = replaceMeta(html, 'name', 'description', seo.description);
  html = replaceMeta(html, 'property', 'og:title', seo.title);
  html = replaceMeta(html, 'property', 'og:description', seo.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:type', 'website');
  html = replaceMeta(html, 'property', 'og:image', socialImage);
  html = replaceMeta(html, 'name', 'twitter:card', 'summary');
  html = replaceMeta(html, 'name', 'twitter:title', seo.title);
  html = replaceMeta(html, 'name', 'twitter:description', seo.description);
  html = replaceMeta(html, 'name', 'twitter:image', socialImage);
  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script></head>`,
  );

  const pageDirectory = resolve(distDirectory, 'services', service.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, 'index.html'), html);
}

console.log(`Generated ${servicePages.length} service-page HTML entries.`);
