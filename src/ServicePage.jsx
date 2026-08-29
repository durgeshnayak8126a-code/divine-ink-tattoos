import { Link, Navigate, useParams } from 'react-router-dom';
import './App.css';
import SeoManager from './SeoManager.jsx';
import { servicePageMap } from './serviceData.js';
import { usePublicCms } from './usePublicCms.js';

const fallbackPhone = '+91 84457 02782';
const fallbackWhatsapp = '918445702782';
const fallbackAddress = 'Shop No. 155, Basement, near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001';

function phoneDigits(value, fallback = '') {
  const digits = String(value || '').replace(/\D/g, '');
  return digits || fallback;
}

function normalizeServiceFaqs(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (Array.isArray(item)) return { question: String(item[0] || ''), answer: String(item[1] || ''), id: `faq-${index}` };
    if (item && typeof item === 'object') {
      return {
        question: String(item.question || item.q || ''),
        answer: String(item.answer || item.a || ''),
        id: String(item.id || `faq-${index}`),
      };
    }
    return null;
  }).filter((item) => item?.question && item?.answer);
}

export default function ServicePage() {
  const { slug } = useParams();
  const staticService = servicePageMap.get(slug);
  const { contact, services: cmsServices } = usePublicCms();

  if (!staticService) {
    return <Navigate replace to="/" />;
  }

  const managed = cmsServices.find((item) => item.slug === slug);
  const service = {
    ...staticService,
    name: managed?.title || staticService.name,
    title: managed?.title || staticService.title,
    intro: managed?.description || staticService.intro,
    metaTitle: slug === 'fine-line-tattoos' ? staticService.metaTitle : (managed?.metaTitle || staticService.metaTitle),
    description: managed?.metaDescription || staticService.description,
  };
  const pricing = String(managed?.pricing || '').trim();
  const managedFaqs = normalizeServiceFaqs(managed?.faqs);

  const displayPhone = String(contact?.phone || fallbackPhone).trim();
  const telNumber = phoneDigits(displayPhone, fallbackWhatsapp);
  const whatsappNumber = phoneDigits(contact?.whatsapp || displayPhone, fallbackWhatsapp);
  const address = String(contact?.address || fallbackAddress).trim();
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}`;

  return (
    <div className="site-shell">
      <SeoManager service={service} />

      <header className="site-header">
        <a className="brand" href="/" aria-label="Divine Ink home">
          <img
            src="/divine-ink-logo.png"
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
            {pricing && <p><strong>Pricing:</strong> {pricing}</p>}
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

        {managedFaqs.length > 0 && (
          <section className="section faq-section">
            <div className="section-heading">
              <p className="eyebrow">Service FAQs</p>
              <h2>Questions about {service.name.toLowerCase()}</h2>
            </div>
            <div className="faq-list">
              {managedFaqs.map((item) => (
                <article className="open" key={item.id}>
                  <button aria-expanded="true" type="button"><span>{item.question}</span></button>
                  <div className="faq-answer" style={{ maxHeight: 'none' }}><p>{item.answer}</p></div>
                </article>
              ))}
            </div>
          </section>
        )}

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
              <p>Divine Ink Tattoos & Piercing Studio is at {address}.</p>
              <div className="contact-list">
                <a href={`tel:+${telNumber}`}>Call {displayPhone}</a>
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
          <img src="/divine-ink-logo.png" alt="Divine Ink logo" />
          <p>Custom tattoos and professional piercing in Sector 31, Gurugram.</p>
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
          <a href={`tel:+${telNumber}`}>{displayPhone}</a>
          <a href={whatsappLink} rel="noreferrer" target="_blank">WhatsApp</a>
        </div>
        <div className="copyright">
          © {new Date().getFullYear()} Divine Ink Tattoos & Piercing Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
