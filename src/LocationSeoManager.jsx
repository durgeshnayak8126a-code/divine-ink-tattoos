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
      '@id': canonical + '#breadcrumb',
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
      identifier: [
        { '@type': 'PropertyValue', propertyID: 'GooglePlaceID', value: 'ChIJyZWbyoMZDTkRfJeSnn2GA7g' },
        { '@type': 'PropertyValue', propertyID: 'GoogleMapsCID', value: '13259589601998313340' },
      ],
      hasMap: 'https://www.google.com/maps?cid=13259589601998313340',
      sameAs: ['https://www.google.com/maps?cid=13259589601998313340', 'https://www.instagram.com/divineinktattoos1/', 'https://www.facebook.com/profile.php?id=100078466583354'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Jharsa Road',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122001',
        addressCountry: 'IN'
      },
      geo: { '@type': 'GeoCoordinates', latitude: 28.4529, longitude: 77.0508791 },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00', closes: '23:59'
      },
      areaServed: { '@type': 'City', name: 'Gurugram', alternateName: 'Gurgaon' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: location.metaTitle,
      description: location.description,
      isPartOf: { '@id': 'https://divineinktattoos.in/#website' },
      about: { '@id': 'https://divineinktattoos.in/#localbusiness' },
      mainEntity: { '@id': 'https://divineinktattoos.in/#localbusiness' },
      breadcrumb: { '@id': canonical + '#breadcrumb' },
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
