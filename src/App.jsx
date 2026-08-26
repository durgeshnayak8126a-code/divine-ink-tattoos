import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

function SvgIcon({ size = 24, children, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
}
const Menu = (p) => <SvgIcon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></SvgIcon>;
const X = (p) => <SvgIcon {...p}><path d="M18 6 6 18M6 6l12 12"/></SvgIcon>;
const MessageCircle = (p) => <SvgIcon {...p}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></SvgIcon>;
const Phone = (p) => <SvgIcon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92z"/></SvgIcon>;
const Clock3 = (p) => <SvgIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></SvgIcon>;
const ShieldCheck = (p) => <SvgIcon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></SvgIcon>;
const Sparkles = (p) => <SvgIcon {...p}><path d="m12 3-1.2 3.3L7.5 7.5l3.3 1.2L12 12l1.2-3.3 3.3-1.2-3.3-1.2L12 3zM5 14l-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14zM18 14l-.8 2.2L15 17l2.2.8L18 20l.8-2.2L21 17l-2.2-.8L18 14z"/></SvgIcon>;
const CalendarCheck = (p) => <SvgIcon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18m-11 5 2 2 4-4"/></SvgIcon>;
const ChevronRight = (p) => <SvgIcon {...p}><path d="m9 18 6-6-6-6"/></SvgIcon>;
const ZoomIn = (p) => <SvgIcon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></SvgIcon>;
const Star = (p) => <SvgIcon {...p}><path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3.1L6.1 20l1.1-6.4L2.5 9 9 8l3-6z"/></SvgIcon>;
const Mail = (p) => <SvgIcon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></SvgIcon>;
const MapPin = (p) => <SvgIcon {...p}><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2"/></SvgIcon>;


import logo from './assets/logo.png';
import hero from './assets/hero.png';
import reception from './assets/studio/reception.jpg';
import artistWorking from './assets/studio/artist-working.jpg';
import shopFront1 from './assets/studio/shop-front-1.jpg';
import shopFront2 from './assets/studio/shop-front-2.jpg';
import durgessh from './assets/team/durgessh-nayak.png';
import sachin from './assets/team/sachin-nayak.jpg';
import { galleryFallbackItems } from './galleryFallback.js';
import { usePublicGallery } from './usePublicGallery.js';
import { usePublicCms } from './usePublicCms.js';

import lobePiercing from './assets/piercing/lobe.jpg';
import helixPiercing from './assets/piercing/helix.jpg';
import septumPiercing from './assets/piercing/septum.jpg';
import belly from './assets/piercing/belly.jpg';
import lip from './assets/piercing/lip.jpg';
import tongue from './assets/piercing/tongue.jpg';
import nose from './assets/piercing/nose.jpg';
import eyebrow from './assets/piercing/eyebrow.jpg';


function WhatsAppLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.84 9.84 0 0 0-8.48 14.82L2 22l5.3-1.52A9.96 9.96 0 1 0 12.04 2Zm0 17.9a8.02 8.02 0 0 1-4.08-1.12l-.29-.17-3.15.9.92-3.05-.19-.31A7.91 7.91 0 1 1 12.04 19.9Zm4.35-5.91c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>;
}
function InstagramLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function FacebookLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.54-1.46H16.7V5a22.8 22.8 0 0 0-2.4-.12c-2.38 0-4 1.45-4 4.12v2H7.6v3h2.7v8h3.2Z"/></svg>;
}

const phone = '918445702782';
const mapLink = 'https://share.google/Ot0WZGKQFZkWTcSll';
const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}`;
const artistFilters = ['All Artists', 'Durgessh Nayak', 'Sachin Nayak'];

const services = [
  ['Custom Tattoos', 'Original concepts designed around your idea, placement and style.'],
  ['Cover-up Tattoos', 'Strategic designs created to conceal or transform an existing tattoo.'],
  ['Realism & Portraits', 'Detailed black-and-grey and realistic portrait-focused artwork.'],
  ['Minimal Tattoos', 'Clean, elegant and placement-conscious fine-line concepts.'],
  ['Religious Tattoos', 'Respectful, thoughtfully composed spiritual and devotional designs.'],
  ['Couple & Name Tattoos', 'Personalized matching designs, names and meaningful lettering.'],
  ['Sleeve Tattoos', 'Large-scale compositions planned for flow, balance and future expansion.'],
  ['Professional Piercing', 'Ear, nose, eyebrow, lip, tongue and belly piercing with hygiene-first care.']
];

const piercingGallery = [
  [lobePiercing, 'Lobe Piercing'], [helixPiercing, 'Helix Piercing'], [septumPiercing, 'Septum Piercing'],
  [nose, 'Nose Piercing'], [belly, 'Belly Piercing'], [eyebrow, 'Eyebrow Piercing'],
  [lip, 'Lip Piercing'], [tongue, 'Tongue Piercing']
];

const faqs = [
  ['How do I get an exact tattoo price?', 'Send the design reference, approximate size in inches and body placement on WhatsApp. Final pricing depends on detail, size, style, placement and time required.'],
  ['Do you provide custom tattoo designs?', 'Yes. We discuss your idea, placement and style before preparing a custom concept.'],
  ['Do you do cover-up tattoos?', 'Yes. Cover-up feasibility depends on the darkness, size, location and age of the existing tattoo. A clear photo is required for assessment.'],
  ['Is the studio open 24x7?', 'Yes, the studio accepts bookings 24x7. Advance confirmation is recommended before visiting, especially for late-night appointments.'],
  ['What hygiene process do you follow?', 'Single-use needles, fresh consumables, clean working surfaces and proper aftercare guidance are part of the studio process.'],
  ['Can I book a piercing appointment?', 'Yes. Send the piercing type and preferred time on WhatsApp to confirm availability.']
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeArtist, setActiveArtist] = useState('All Artists');
  const [lightbox, setLightbox] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [booking, setBooking] = useState({ name: '', mobile: '', service: 'Tattoo', budget: '₹999–₹2,999', date: '', details: '' });
  const lightboxCloseRef = useRef(null);
  const lightboxTriggerRef = useRef(null);
  const galleryItems = usePublicGallery(galleryFallbackItems);
  const { homepage: homepageSettings } = usePublicCms();

  const aboutImages = Array.isArray(homepageSettings?.featuredImages)
    ? homepageSettings.featuredImages
    : [];
  const aboutMainImage = aboutImages[0] || reception;
  const aboutFloatingImage = aboutImages[1] || artistWorking;
  const filters = ['All', ...new Set(galleryItems.map((item) => item.category))];
  const filtered = useMemo(
    () => galleryItems.filter((item) => {
      const categoryMatches = activeFilter === 'All' || item.category === activeFilter;
      const artistMatches = activeArtist === 'All Artists' || item.artist === activeArtist;
      return categoryMatches && artistMatches;
    }),
    [activeArtist, activeFilter, galleryItems],
  );

  const closeMenu = () => setMenuOpen(false);

  const viewArtistPortfolio = (artist) => {
    setActiveArtist(artist);
    setActiveFilter('All');
    window.requestAnimationFrame(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const showAdjacentLightboxItem = (direction) => {
    if (!lightbox || filtered.length < 2) return;
    const currentIndex = filtered.findIndex((item) => item.id === lightbox.id);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;
    const nextIndex = (safeIndex + direction + filtered.length) % filtered.length;
    const nextItem = filtered[nextIndex];
    setLightbox({
      id: nextItem.id,
      src: nextItem.image,
      category: nextItem.category,
      altText: nextItem.altText,
    });
  };

  useEffect(() => {
    if (!lightbox) return undefined;

    lightboxCloseRef.current?.focus();

    const handleLightboxKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightbox(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        showAdjacentLightboxItem(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        showAdjacentLightboxItem(1);
      }
    };

    document.addEventListener('keydown', handleLightboxKeyDown);
    return () => {
      document.removeEventListener('keydown', handleLightboxKeyDown);
      lightboxTriggerRef.current?.focus();
    };
  }, [lightbox, filtered]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleMenuKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleMenuKeyDown);
    return () => document.removeEventListener('keydown', handleMenuKeyDown);
  }, [menuOpen]);

  const updateBooking = (event) => {
    const { name, value } = event.target;
    setBooking((current) => ({ ...current, [name]: value }));
  };

  const bookingMessage = () => [
    'Hi Divine Ink Tattoos, I want to book a consultation.',
    `Name: ${booking.name}`,
    `Mobile: ${booking.mobile}`,
    `Service: ${booking.service}`,
    `Budget: ${booking.budget}`,
    `Preferred Date: ${booking.date || 'Not specified'}`,
    `Details: ${booking.details || 'Not specified'}`
  ].join('\n');

  const sendBookingOnWhatsApp = () => {
    if (!booking.name.trim() || !booking.mobile.trim()) {
      alert('Please enter your name and mobile number.');
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(bookingMessage())}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Divine Ink home">
          <img src={logo} alt="Divine Ink Tattoos & Piercing Studio logo" />
        </a>
        <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          {['Home','About','Services','Artists','Gallery','Piercing','Reviews','Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={closeMenu}>{item}</a>
          ))}
          <a className="nav-cta" href={whatsappLink} target="_blank" rel="noreferrer">Book Now</a>
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-controls="main-navigation" aria-expanded={menuOpen}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section id="home" className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,5,5,.96) 0%, rgba(5,5,5,.72) 45%, rgba(5,5,5,.2) 100%), url(${hero})` }}>
          <div className="hero-content">
            <p className="eyebrow">Premium Tattoo & Piercing Studio · Gurugram</p>
            <h1>Ink Your Story At<br/><span>Divine Ink Tattoos</span></h1>
            <p className="hero-tagline">Your Personal Tattoo Studio</p>
            <p className="hero-copy">Custom tattoos, cover-ups, realism, portraits, minimal designs and professional piercing in a hygiene-focused studio at Sector 31, Gurugram.</p>
            <div className="hero-actions">
              <a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Book on WhatsApp</a>
              <a className="btn primary" href="tel:+918445702782"><Phone size={18}/> Book on Call</a>
            </div>
            <div className="hero-points">
              <span><Clock3 size={17}/> Open 24x7</span>
              <span><ShieldCheck size={17}/> Hygiene First</span>
              <span><Sparkles size={17}/> Custom Designs</span>
            </div>
          </div>
        </section>

        <section className="quick-strip" aria-label="Studio highlights">
          <div><strong>10+</strong><span>Years of experience</span></div>
          <div><strong>24×7</strong><span>Appointment support</span></div>
          <div><strong>100%</strong><span>Custom consultation</span></div>
          <div><strong>Sector 31</strong><span>Prime Gurugram location</span></div>
        </section>

        <section id="about" className="section split-section">
          <div className="image-stack">
            <img className="main-image" src={aboutMainImage} alt="Divine Ink studio reception" />
            <img className="floating-image" src={aboutFloatingImage} alt="Tattoo artist working at Divine Ink" />
          </div>
          <div className="section-copy">
            <p className="eyebrow">About Divine Ink</p>
            <h2>A private, focused space for meaningful body art.</h2>
            <p>Divine Ink Tattoos & Piercing Studio combines design consultation, placement planning and careful execution to create tattoos that look intentional—not generic.</p>
            <p>Our studio is located in the basement near Apollo Pharmacy in Main HUDA Market, Sector 31, Gurugram. Every appointment is handled with clear communication, hygiene-conscious preparation and aftercare guidance.</p>
            <div className="feature-list">
              <span><ShieldCheck/> Single-use needles & fresh consumables</span>
              <span><CalendarCheck/> Appointment-based consultation</span>
              <span><Sparkles/> Custom styling and placement planning</span>
            </div>
            <a className="text-link" href={mapLink} target="_blank" rel="noreferrer">Get directions <ChevronRight size={18}/></a>
          </div>
        </section>

        <section id="services" className="section dark-panel">
          <div className="section-heading center">
            <p className="eyebrow">What We Do</p>
            <h2>Tattoo styles and services</h2>
            <p>Every design is evaluated for size, placement, detail and long-term readability before the session begins.</p>
          </div>
          <div className="service-grid">
            {services.map(([title, text], index) => (
              <article className="service-card" key={title}>
                <span className="service-number">{String(index + 1).padStart(2,'0')}</span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="artists" className="section">
          <div className="section-heading center">
            <p className="eyebrow">Meet The Artists</p>
            <h2>Experience guided by your idea</h2>
          </div>
          <div className="artist-grid">
            <article className="artist-card"><img src={durgessh} alt="Durgessh Nayak"/><div><p>Founder & Head Tattoo Artist</p><h3>Durgessh Nayak</h3><span>Custom concepts, realism, portrait work, religious tattoos and cover-up planning.</span><button className="btn secondary" style={{ marginTop: 18 }} onClick={() => viewArtistPortfolio('Durgessh Nayak')} type="button">View Portfolio</button></div></article>
            <article className="artist-card"><img src={sachin} alt="Sachin Nayak"/><div><p>Senior Tattoo Artist</p><h3>Sachin Nayak</h3><span>Minimal, geometric, lettering, black-and-grey, color and detailed custom tattoo work.</span><button className="btn secondary" style={{ marginTop: 18 }} onClick={() => viewArtistPortfolio('Sachin Nayak')} type="button">View Portfolio</button></div></article>
          </div>
        </section>

        <section id="gallery" className="section gallery-section">
          <div className="section-heading center">
            <p className="eyebrow">Tattoo Portfolio</p>
            <h2>Real work. Different stories.</h2>
            <p>Browse selected tattoos created across portrait, realism, religious, minimal, floral, geometric and color styles.</p>
          </div>
          <div className="filter-row" aria-label="Filter portfolio by artist">
            {artistFilters.map((artist) => <button key={artist} className={activeArtist === artist ? 'active' : ''} onClick={() => setActiveArtist(artist)}>{artist}</button>)}
          </div>
          <div className="filter-row">
            {filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
          </div>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No portfolio images are assigned to this artist yet.</p>
          ) : (
            <div className="gallery-grid">
              {filtered.map(({ id, image, category, altText }) => (
                <button className="gallery-card" key={id} onClick={(event) => {
                  lightboxTriggerRef.current = event.currentTarget;
                  setLightbox({ id, src: image, category, altText });
                }} aria-label={`Open ${category || 'portfolio'} image`}>
                  <img src={image} alt={altText || category || 'Tattoo portfolio image'} loading="lazy"/><span className="gallery-overlay"><small>{category}</small><ZoomIn size={20}/></span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section id="piercing" className="section piercing-section">
          <div className="section-heading center">
            <p className="eyebrow">Professional Piercing</p>
            <h2>Clean process. Clear aftercare.</h2>
            <p>Lobe, helix, septum, nose, belly, eyebrow, lip and tongue piercing services are available by appointment.</p>
          </div>
          <div className="piercing-grid">
            {piercingGallery.map(([src,title]) => <figure key={title}><img src={src} alt={title} loading="lazy"/><figcaption>{title}</figcaption></figure>)}
          </div>
          <div className="center-action"><a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer">Ask About Piercing <MessageCircle size={18}/></a></div>
        </section>

        <section id="reviews" className="section reviews-section">
          <div className="section-heading center">
            <p className="eyebrow">Client Feedback</p>
            <h2>Live Google Reviews</h2>
            <div className="stars" aria-label="5 out of 5 stars"><Star/><Star/><Star/><Star/><Star/></div>
            <p>Reviews below are loaded through your connected SociableKIT Google Reviews widget.</p>
          </div>
          <div className="reviews-widget-wrap"><div className="sk-ww-google-reviews" data-embed-id="25698491"></div></div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="section-heading center"><p className="eyebrow">Before You Book</p><h2>Frequently asked questions</h2></div>
          <div className="faq-list">
            {faqs.map(([q,a], index) => {
              const expanded = openFaq === index;
              const buttonId = `faq-button-${index}`;
              const answerId = `faq-answer-${index}`;
              return <article key={q} className={expanded ? 'open' : ''}><button id={buttonId} aria-controls={answerId} aria-expanded={expanded} onClick={() => setOpenFaq(expanded ? -1 : index)}><span>{q}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span></button><div id={answerId} className="faq-answer" role="region" aria-labelledby={buttonId} aria-hidden={!expanded}><p>{a}</p></div></article>;
            })}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-card">
            <div>
              <p className="eyebrow">Book Your Session</p>
              <h2>Send your idea, size and placement.</h2>
              <p>For faster consultation, send a clear reference image, approximate size and body placement on WhatsApp.</p>
              <div className="contact-list">
                <a href="tel:+918445702782"><Phone/> +91 84457 02782</a>
                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>
                <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001</a>
                <span><Clock3/> Open 24x7 — advance confirmation recommended</span>
              </div>
              <div className="social-row">
                <a href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer">Facebook</a>
              </div>
            </div>
            <form className="booking-form" action="https://formsubmit.co/divinetattoostudio1@gmail.com" method="POST">
              <input type="hidden" name="_subject" value="New Booking Enquiry — Divine Ink Website" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="text" name="_honey" className="form-honey" tabIndex="-1" autoComplete="off" aria-hidden="true" />
              <h3>Book a Consultation</h3>
              <div className="form-grid">
                <label>Full Name *<input required name="name" value={booking.name} onChange={updateBooking} placeholder="Your name" /></label>
                <label>Mobile Number *<input required name="mobile" value={booking.mobile} onChange={updateBooking} inputMode="tel" placeholder="10-digit number" /></label>
                <label>Service *<select name="service" value={booking.service} onChange={updateBooking}><option>Tattoo</option><option>Piercing</option></select></label>
                <label>Your Budget *<select name="budget" value={booking.budget} onChange={updateBooking}><option>₹999–₹2,999</option><option>₹3,000–₹5,000</option><option>₹5,000–₹10,000</option><option>₹10,000+</option></select></label>
                <label>Preferred Date<input type="date" name="date" value={booking.date} onChange={updateBooking} /></label>
                <label className="full-field">Tattoo / Piercing Details<textarea name="details" value={booking.details} onChange={updateBooking} rows="4" placeholder="Tell us your idea, size and placement"></textarea></label>
              </div>
              <div className="booking-actions">
                <button className="btn primary" type="submit"><Mail size={18}/> Submit Booking</button>
                <button className="btn primary" type="button" onClick={sendBookingOnWhatsApp}><MessageCircle size={18}/> Book on WhatsApp</button>
              </div>
              <small className="form-note">First email submission may require one-time FormSubmit activation on the studio email.</small>
            </form>
          </div>
          <iframe title="Divine Ink Tattoos location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Shop%20No.%20155%20Near%20Apollo%20Pharmacy%20Main%20HUDA%20Market%20Sector%2031%20Gurugram%20Haryana%20122001&output=embed"></iframe>
        </section>
      </main>

      <footer className="footer">
        <div><img src={logo} alt="Divine Ink logo"/><p>Custom tattoos and professional piercing in Sector 31, Gurugram.</p></div>
        <div><h4>Quick Links</h4><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#artists">Artists</a><a href="#reviews">Reviews</a></div>
        <div><h4>Contact</h4><a href="tel:+918445702782">+91 84457 02782</a><a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>
        <div className="copyright">© {new Date().getFullYear()} Divine Ink Tattoos & Piercing Studio. All rights reserved.</div>
      </footer>

      <div className="floating-socials" aria-label="Social links">
        <a className="floating-social whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsAppLogo/></a>
        <a className="floating-social instagram" href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>
        <a className="floating-social facebook" href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer" aria-label="Open Facebook"><FacebookLogo/></a>
      </div>

      {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${lightbox.category || 'Gallery'} image preview`} onClick={() => setLightbox(null)}>
        <button ref={lightboxCloseRef} onClick={() => setLightbox(null)} aria-label="Close image"><X/></button>
        {filtered.length > 1 && <button aria-label="Previous image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}
        <img src={lightbox.src} alt={lightbox.altText || lightbox.category || 'Tattoo portfolio image'} onClick={(event) => event.stopPropagation()}/>
        {filtered.length > 1 && <button aria-label="Next image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}
      </div>}
    </div>
  );
}

export default App;