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

export function createLocationSchema(location) {
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
      image: 'https://divineinktattoos.in/divine-ink-logo.png',
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

export default function LocationSeoManager({ location }) {
  useEffect(() => {
    const previousTitle = document.title;
    const canonicalElement = document.head.querySelector('link[rel="canonical"]');
    const previousCanonical = canonicalElement?.getAttribute('href') || '';
    const previousMeta = managedMeta.map(([attribute, key]) => {
      const element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      return [attribute, key, element?.getAttribute('content') ?? null];
    });
    const canonical = `https://divineinktattoos.in/locations/${location.slug}/`;
    const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';

    document.title = location.metaTitle;
    canonicalElement?.setAttribute('href', canonical);
    setMeta('name', 'description', location.description);
    setMeta('property', 'og:title', location.metaTitle);
    setMeta('property', 'og:description', location.description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', socialImage);
    setMeta('property', 'og:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', location.metaTitle);
    setMeta('name', 'twitter:description', location.description);
    setMeta('name', 'twitter:image', socialImage);
    setMeta('name', 'twitter:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');

    const schema = document.createElement('script');
    schema.id = 'location-page-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify(createLocationSchema(location));
    document.head.querySelector('#location-page-schema')?.remove();
    document.head.appendChild(schema);

    return () => {
      document.title = previousTitle;
      canonicalElement?.setAttribute('href', previousCanonical);
      previousMeta.forEach(([attribute, key, content]) => {
        const element = document.head.querySelector(`meta[${attribute}="${key}"]`);
        if (content === null) element?.remove();
        else element?.setAttribute('content', content);
      });
      schema.remove();
    };
  }, [location]);

  return null;
}

