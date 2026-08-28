import { Link, Navigate, useParams } from 'react-router-dom';
import './App.css';
import SeoManager from './SeoManager.jsx';
import { servicePageMap } from './serviceData.js';

const whatsappLink =
  'https://wa.me/918445702782?text=Hi%20Divine%20Ink%20Tattoos%2C%20I%20want%20to%20book%20a%20consultation.';

export default function ServicePage() {
  const { slug } = useParams();
  const service = servicePageMap.get(slug);

  if (!service) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="site-shell">
      <SeoManager service={service} />

      <header className="site-header">
        <a className="brand" href="/" aria-label="Divine Ink home">
          <img
            src="/divine-ink-logo.webp"
            alt="Divine Ink Tattoos & Piercing Studio logo"
          />
        </a>
        <a
          className="nav-cta"
          href={whatsappLink}
          rel="noreferrer"
          target="_blank"
        >
          Book Now
        </a>
      </header>

      <main>
        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">{service.eyebrow}</p>
            <h1>{service.title}</h1>
            <p>{service.intro}</p>
          </div>
          <a
            className="btn primary"
            href={whatsappLink}
            rel="noreferrer"
            target="_blank"
          >
            Book on WhatsApp
          </a>
        </section>

        <section className="section dark-panel">
          <div className="split-section">
            <article className="section-copy">
              <p className="eyebrow">Divine Ink · Sector 31</p>
              <h2>Planning your {service.name.toLowerCase()}</h2>
              <p>{service.overview}</p>
              <p>{service.planning}</p>
              <p>{service.care}</p>
            </article>
            <aside className="service-card">
              <span className="service-number">What to expect</span>
              <h3>Clear consultation before the appointment</h3>
              {service.highlights.map((highlight) => (
                <p key={highlight}>• {highlight}</p>
              ))}
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Related services</p>
            <h2>Explore another service</h2>
          </div>
          <div className="service-grid">
            {service.related.map((relatedSlug, index) => {
              const related = servicePageMap.get(relatedSlug);
              return (
                <article className="service-card" key={related.slug}>
                  <span className="service-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{related.name}</h3>
                  <p>{related.description}</p>
                  <Link className="text-link" to={`/services/${related.slug}/`}>
                    View service
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section contact-section">
          <div className="contact-card">
            <div>
              <p className="eyebrow">Visit Divine Ink</p>
              <h2>Confirm your appointment before travelling</h2>
              <p>
                Divine Ink Tattoos & Piercing Studio is at Shop No. 155,
                Basement, near Apollo Pharmacy, Main HUDA Market, Sector 31,
                Gurugram, Haryana 122001.
              </p>
              <div className="contact-list">
                <a href="tel:+918445702782">Call +91 84457 02782</a>
                <a href={whatsappLink} rel="noreferrer" target="_blank">
                  Send your reference on WhatsApp
                </a>
                <a href="/">Return to the homepage</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <img src="/divine-ink-logo.webp" alt="Divine Ink logo" />
          <p>
            Custom tattoos and professional piercing in Sector 31, Gurugram.
          </p>
        </div>
        <div>
          <h4>Services</h4>
          {service.related.map((relatedSlug) => {
            const related = servicePageMap.get(relatedSlug);
            return (
              <Link key={related.slug} to={`/services/${related.slug}/`}>
                {related.name}
              </Link>
            );
          })}
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+918445702782">+91 84457 02782</a>
          <a href={whatsappLink} rel="noreferrer" target="_blank">
            WhatsApp
          </a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Divine Ink Tattoos & Piercing Studio.
          All rights reserved.
        </div>
      </footer>
    </div>
  );
}
