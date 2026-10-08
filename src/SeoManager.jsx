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

function getServiceSeo(service) {
  const tattooSeo = {
    'custom-tattoos': ['Custom Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a custom tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 offers original tattoo planning, placement and sizing guidance.'],
    'fine-line-tattoos': ['Fine Line Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a fine line tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 offers fine line tattoo planning, sizing and placement guidance.'],
    'portrait-tattoos': ['Realism & Portrait Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a realism or portrait tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 reviews references, scale and placement for detailed tattoo work.'],
    'black-grey-tattoos': ['Black & Grey Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a black and grey tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 plans contrast, shading, scale and placement for tattoo work.'],
    'cover-up-tattoos': ['Cover Up Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a cover up tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 assesses existing ink, coverage, scale and realistic design options.'],
    'sleeve-tattoos': ['Sleeve Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a sleeve tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 plans full-arm composition, style, transitions and multiple sessions.'],
    'minimal-tattoos': ['Minimal Tattoo Artist in Gurgaon (Gurugram) | Divine Ink', 'Looking for a minimal tattoo artist in Gurgaon (Gurugram)? Divine Ink in Sector 31 plans clean forms, readable sizing and suitable placement.'],
  };
  if (tattooSeo[service.slug]) {
    const [metaTitle, description] = tattooSeo[service.slug];
    return { metaTitle, description };
  }

  return {
    metaTitle: service.metaTitle,
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
    const { metaTitle, description } = getServiceSeo(service);

    document.title = metaTitle;
    let canonicalElement = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonical);

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', metaTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', socialImage);
    setMeta('property', 'og:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', metaTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', socialImage);
    setMeta('name', 'twitter:image:alt', 'Divine Ink Tattoos & Piercing Studio logo');

    const schema = document.createElement('script');
    schema.id = 'service-page-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
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
        description,
        url: canonical,
        areaServed: {
          '@type': 'City',
          name: 'Gurugram',
        },
        provider: {
          '@id': 'https://divineinktattoos.in/#localbusiness',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: metaTitle,
        description,
        isPartOf: { '@id': 'https://divineinktattoos.in/#website' },
        about: { '@id': 'https://divineinktattoos.in/#localbusiness' },
        mainEntity: { '@id': `${canonical}#service` },
        breadcrumb: { '@id': `${canonical}#breadcrumb` },
        inLanguage: 'en-IN',
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
