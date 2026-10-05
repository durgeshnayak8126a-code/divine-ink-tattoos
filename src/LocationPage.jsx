import { Link, Navigate, useParams } from 'react-router-dom';
import './App.css';
import LocationSeoManager from './LocationSeoManager.jsx';
import { locationPageMap } from './locationData.js';

const whatsappLink =
  'https://wa.me/918445702782?text=Hi%20Divine%20Ink%20Tattoos%2C%20I%20want%20to%20book%20a%20consultation.';
const mapsLink = 'https://www.google.com/maps?cid=13259589601998313340';

export default function LocationPage() {
  const { slug } = useParams();
  const location = locationPageMap.get(slug);
  if (!location) return <Navigate replace to="/" />;

  return (
    <div className="site-shell">
      <LocationSeoManager location={location} />
      <header className="site-header">
        <a className="brand" href="/" aria-label="Divine Ink home">
          <img src="/divine-ink-logo.png" alt="Divine Ink Tattoos & Piercing Studio logo" />
        </a>
        <a className="nav-cta" href={whatsappLink} rel="noreferrer" target="_blank">Book Now</a>
      </header>

      <main>
        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">{location.eyebrow}</p>
            <h1>{location.title}</h1>
            <p>{location.intro}</p>
          </div>
          <a className="btn primary" href={whatsappLink} rel="noreferrer" target="_blank">
            Book on WhatsApp
          </a>
        </section>

        <section className="section dark-panel">
          <div className="split-section">
            <article className="section-copy">
              <p className="eyebrow">Divine Ink · Sector 31 Gurugram</p>
              <h2>Tattoo appointments for {location.name}</h2>
              <p>{location.local}</p>
              <p>Divine Ink is a tattoo-focused studio serving Gurugram from Sector 31. Explore custom tattoos, fine line tattoos, realism and portrait tattoos, black & grey work, cover-ups and sleeve tattoos before booking.</p>
              <p>{location.travel}</p>
              <a className="text-link" href={mapsLink} rel="noreferrer" target="_blank">Open Divine Ink on Google Maps</a>
              <div className="service-grid">
                <article className="service-card"><span className="service-number">01</span><h3>Custom Tattoo Artist in Gurgaon</h3><p>Start with a custom concept, placement and size plan for a tattoo designed around you.</p><Link className="text-link" to="/services/custom-tattoos/">Explore custom tattoos</Link></article>
                <article className="service-card"><span className="service-number">02</span><h3>Fine Line &amp; Minimal Tattoos</h3><p>Review fine-line and minimal tattoo options with practical sizing for long-term readability.</p><Link className="text-link" to="/services/fine-line-tattoos/">Explore fine line tattoos</Link></article>
                <article className="service-card"><span className="service-number">03</span><h3>Realism, Portraits &amp; Cover-ups</h3><p>Compare realism, portrait and cover-up approaches before confirming your appointment.</p><Link className="text-link" to="/services/portrait-tattoos/">Explore realism &amp; portrait tattoos</Link></article>
              </div>
            </article>
            <aside className="service-card">
              <span className="service-number">Plan your visit</span>
              <h3>One verified studio in Sector 31</h3>
              <p>• Send references before booking</p>
              <p>• Confirm the appointment and map pin</p>
              <p>• Discuss placement and realistic sizing</p>
              <p>• Receive practical aftercare guidance</p>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Local questions</p>
            <h2>Before visiting from {location.name}</h2>
          </div>
          <div className="service-grid">
            {location.faq.map(([question, answer]) => (
              <article className="service-card" key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Nearby areas</p>
            <h2>Explore another Gurugram area</h2>
          </div>
          <div className="service-grid">
            {location.related.map((relatedSlug, index) => {
              const related = locationPageMap.get(relatedSlug);
              return (
                <article className="service-card" key={related.slug}>
                  <span className="service-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{related.name}</h3>
                  <p>{related.description}</p>
                  <Link className="text-link" to={`/locations/${related.slug}/`}>View area</Link>
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
              <p>Shop No. 155, Basement, near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001.</p>
              <div className="contact-list">
                <a href="tel:+918445702782">Call +91 84457 02782</a>
                <a href={whatsappLink} rel="noreferrer" target="_blank">Book on WhatsApp</a>
                <a href={mapsLink} rel="noreferrer" target="_blank">Get Google Maps directions</a>
                <Link to="/services/custom-tattoos/">Explore custom tattoos</Link>
                <Link to="/services/fine-line-tattoos/">Explore fine line tattoos</Link>
                <Link to="/services/portrait-tattoos/">Explore realism & portrait tattoos</Link>
                <Link to="/services/black-grey-tattoos/">Explore black & grey tattoos</Link>
                <Link to="/services/sleeve-tattoos/">Explore sleeve tattoos</Link>
                <Link to="/services/ear-piercing/">Explore ear piercing</Link>
                <Link to="/services/nose-piercing/">Explore nose piercing</Link>
                <Link to="/services/industrial-piercing/">Explore industrial piercing</Link>
                <Link to="/services/cover-up-tattoos/">Explore cover-up tattoos</Link>
                <a href="/">Return to the homepage</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <img src="/divine-ink-logo.png" alt="Divine Ink logo" />
          <p>Tattoo-focused studio in Sector 31, Gurugram for custom, fine line, realism, portrait, black & grey, cover-up and sleeve tattoos, with professional piercing.</p>
        </div>
        <div>
          <h4>Nearby areas</h4>
          {location.related.map((relatedSlug) => {
            const related = locationPageMap.get(relatedSlug);
            return <Link key={related.slug} to={`/locations/${related.slug}/`}>{related.name}</Link>;
          })}
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+918445702782">+91 84457 02782</a>
          <a href={whatsappLink} rel="noreferrer" target="_blank">WhatsApp</a>
        </div>
        <div className="copyright">© {new Date().getFullYear()} Divine Ink Tattoos & Piercing Studio. All rights reserved.</div>
      </footer>
    </div>
  );
}
