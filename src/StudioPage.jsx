import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import reception from './assets/studio/reception.jpg';
import shopFront1 from './assets/studio/shop-front-1.jpg';

const mapUrl = 'https://www.google.com/maps?cid=13259589601998313340';
const canonical = 'https://divineinktattoos.in/studio/';

export default function StudioPage() {
  useEffect(() => {
    document.title = 'Divine Ink Tattoos & Piercing Studio | Sector 31 Gurgaon';
    const description = 'Divine Ink Tattoos & Piercing Studio is a tattoo-focused studio in Sector 31, Gurugram, offering custom, fine line, realism, portrait, black and grey, cover-up and sleeve tattoos.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': canonical + '#webpage',
          url: canonical,
          name: 'Divine Ink Tattoos & Piercing Studio | Sector 31 Gurgaon',
          description,
          isPartOf: { '@id': 'https://divineinktattoos.in/#website' },
          about: { '@id': 'https://divineinktattoos.in/#localbusiness' },
          mainEntity: { '@id': 'https://divineinktattoos.in/#localbusiness' },
          inLanguage: 'en-IN'
        },
        {
          '@type': 'BreadcrumbList',
          '@id': canonical + '#breadcrumb',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://divineinktattoos.in/' },
            { '@type': 'ListItem', position: 2, name: 'Studio', item: canonical }
          ]
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.divineInkStudioSchema = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script.remove();
      if (meta) meta.remove();
      if (robots) robots.remove();
      if (link) link.remove();
    };
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <p style={{ letterSpacing: '.12em', textTransform: 'uppercase' }}>Divine Ink Tattoos & Piercing Studio</p>
      <h1>Divine Ink Tattoo Studio in Sector 31, Gurugram</h1>
      <p>
        Divine Ink is a tattoo-focused studio serving clients from Sector 31 and across Gurgaon (Gurugram).
        The studio provides custom tattoo consultation, fine line, realism, portrait, black and grey,
        cover-up, sleeve and minimal tattoo work, along with professional piercing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, margin: '32px 0' }}>
        <img src={reception} alt="Divine Ink tattoo studio reception in Sector 31 Gurugram" style={{ width: '100%', height: 'auto' }} />
        <img src={shopFront1} alt="Divine Ink tattoo studio exterior in Sector 31 Gurugram" style={{ width: '100%', height: 'auto' }} />
      </div>

      <h2>Studio location</h2>
      <address>
        Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market,<br />
        Sector 31, Gurugram, Haryana 122001, India
      </address>
      <p><strong>Phone:</strong> +91 84457 02782</p>
      <p><strong>Hours:</strong> Open 24 hours, 7 days a week; advance confirmation is recommended.</p>
      <p>
        <a href={mapUrl} target="_blank" rel="noreferrer">Open the Divine Ink Google Maps location</a>
      </p>

      <h2>Tattoo services</h2>
      <ul>
        <li><Link to="/services/custom-tattoos/">Custom tattoos</Link></li>
        <li><Link to="/services/fine-line-tattoos/">Fine line tattoos</Link></li>
        <li><Link to="/services/portrait-tattoos/">Portrait and realism tattoos</Link></li>
        <li><Link to="/services/black-grey-tattoos/">Black and grey tattoos</Link></li>
        <li><Link to="/services/cover-up-tattoos/">Cover-up tattoos</Link></li>
        <li><Link to="/services/sleeve-tattoos/">Sleeve tattoos</Link></li>
        <li><Link to="/services/minimal-tattoos/">Minimal tattoos</Link></li>
      </ul>

      <p><Link to="/locations/sector-31/">View the Sector 31 tattoo shop page</Link></p>
      <p><Link to="/">Back to Divine Ink home</Link></p>
    </main>
  );
}
