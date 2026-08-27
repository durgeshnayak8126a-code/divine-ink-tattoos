import { useEffect } from 'react';

const managedMeta = [
  ['name', 'description'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:type'],
  ['property', 'og:image'],
  ['property', 'og:image:alt'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
  ['name', 'twitter:image:alt'],
];

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
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

export default function SeoManager({ service }) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousCanonical =
      document.head.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const previousMeta = managedMeta.map(([attribute, key]) => {
      const element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      return [attribute, key, element?.getAttribute('content') ?? null];
    });

    const canonical = `https://divineinktattoos.in/services/${service.slug}/`;
    const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';
    const seo = getSeoMeta(service);

    document.title = seo.title;
    let canonicalElement = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonical);

    setMeta('name', 'description', seo.description);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', socialImage);
    setMeta('property', 'og:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', socialImage);
    setMeta('name', 'twitter:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');

    const schema = document.createElement('script');
    schema.id = 'service-page-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify([
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
    ]);
    document.head.querySelector('#service-page-schema')?.remove();
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      canonicalElement.setAttribute('href', previousCanonical);
      previousMeta.forEach(([attribute, key, content]) => {
        const element = document.head.querySelector(`meta[${attribute}="${key}"]`);
        if (content === null) {
          element?.remove();
        } else {
          element?.setAttribute('content', content);
        }
      });
      schema.remove();
    };
  }, [service]);

  return null;
}
