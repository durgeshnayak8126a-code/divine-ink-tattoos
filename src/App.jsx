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
import { getArtistDisplayImage, normalizeArtists } from './artists.js';
import { galleryFallbackItems } from './galleryFallback.js';
import { usePublicGallery } from './usePublicGallery.js';
import { usePublicCms } from './usePublicCms.js';
import { getPreviewPiercingItems, getPublicPiercingGallery } from './piercingData.js';

function WhatsAppLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.84 9.84 0 0 0-8.48 14.82L2 22l5.3-1.52A9.96 9.96 0 1 0 12.04 2Zm0 17.9a8.02 8.02 0 0 1-4.08-1.12l-.29-.17-3.15.9.92-3.05-.19-.31A7.91 7.91 0 1 1 12.04 19.9Zm4.35-5.91c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"/></svg>;
}
function InstagramLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>;
}
function FacebookLogo({ size = 25 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.54-1.46H16.7V5a22.8 22.8 0 0 0-2.4-.12c-2.38 0-4 1.45-4 4.12v2H7.6v3h2.7v8h3.2Z"/></svg>;
}

const defaultPhone = '918445702782';
const defaultPhoneDisplay = '+91 84457 02782';
const defaultMapLink = 'https://www.google.com/maps?cid=13259589601998313340';
const defaultAddress = 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001';
const defaultOpeningHours = 'Open 24x7 — advance confirmation recommended';
const defaultInstagram = 'https://www.instagram.com/divineinktattoos1/';

const services = [
  ['Custom Tattoos', 'Original concepts designed around your idea, placement and style.', '/services/custom-tattoos/'],
  ['Cover-up Tattoos', 'Strategic designs created to conceal or transform an existing tattoo.', '/services/cover-up-tattoos/'],
  ['Realism & Portraits', 'Detailed black-and-grey and realistic portrait-focused artwork.', '/services/portrait-tattoos/'],
  ['Minimal Tattoos', 'Clean, elegant and placement-conscious fine-line concepts.', '/services/minimal-tattoos/'],
  ['Fine Line Tattoos', 'Delicate, precise tattoo work with sizing and placement planned for long-term readability.', '/services/fine-line-tattoos/'],
  ['Religious Tattoos', 'Respectful, thoughtfully composed spiritual and devotional designs.', '/services/religious-tattoos/'],
  ['Couple & Name Tattoos', 'Personalized matching designs, names and meaningful lettering.', '/services/name-tattoos/'],
  ['Sleeve Tattoos', 'Large-scale compositions planned for flow, balance and future expansion.', '/services/sleeve-tattoos/'],
  ['Professional Piercing', 'Ear, nose, eyebrow, lip, tongue and belly piercing with hygiene-first care.', '/services/ear-piercing/']
];

const faqs = [
  ['How do I get an exact tattoo price?', 'Send the design reference, approximate size in inches and body placement on WhatsApp. Final pricing depends on detail, size, style, placement and time required.'],
  ['How do I choose a tattoo artist in Gurgaon?', 'Review the artists and portfolio on this page, then send your reference, preferred style, size and placement for a consultation. The right artist depends on the artwork and style you want.'],
  ['How do I find a tattoo studio near me in Gurgaon?', 'Divine Ink is located in Sector 31, Gurugram. Use the Sector 31 location page and the service pages to check the tattoo or piercing service that matches your requirement.'],
  ['Do you provide custom tattoo designs?', 'Yes. We discuss your idea, placement and style before preparing a custom concept.'],
  ['Do you do cover-up tattoos?', 'Yes. Cover-up feasibility depends on the darkness, size, location and age of the existing tattoo. A clear photo is required for assessment.'],
  ['Is the studio open 24x7?', 'Yes, the studio accepts bookings 24x7. Advance confirmation is recommended before visiting, especially for late-night appointments.'],
  ['What hygiene process do you follow?', 'Single-use needles, fresh consumables, clean working surfaces and proper aftercare guidance are part of the studio process.'],
  ['Can I book a piercing appointment?', 'Yes. Send the piercing type and preferred time on WhatsApp to confirm availability.'],
  ['What is Divine Ink’s official Instagram account?', 'The official Instagram profile is @divineinktattoos1, linked directly from this website. Use that profile for Divine Ink studio work and updates.'],
  ['Does Divine Ink have another Gurugram branch?', 'This official website lists one verified Divine Ink studio: Shop No. 155, Basement, near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram. We do not list a second Gurugram branch here. Use the linked official Sector 31 Google Maps profile to confirm the destination before visiting.'],
  ['Is this website connected to Divine Ink studios in other cities?', 'No. This official website represents only Divine Ink Tattoos & Piercing Studio at its verified Sector 31 address in Gurugram, Haryana. It does not represent or advertise branches in other cities. For the correct phone number, address and directions, use the contact details and official Google Maps link on this website.']
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeArtist, setActiveArtist] = useState('All Artists');
  const [lightbox, setLightbox] = useState(null);
  const [piercingLightbox, setPiercingLightbox] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [booking, setBooking] = useState({ name: '', mobile: '', service: 'Tattoo', budget: '₹999–₹2,999', date: '', details: '' });
  const lightboxCloseRef = useRef(null);
  const lightboxTriggerRef = useRef(null);
  const galleryItems = usePublicGallery(galleryFallbackItems);
  const { homepage: homepageSettings, contact: contactSettings } = usePublicCms();
  const hasContactValue = (key) => Boolean(contactSettings && Object.prototype.hasOwnProperty.call(contactSettings, key));
  const managedPhoneRecords = Array.isArray(contactSettings?.phones)
    ? contactSettings.phones
        .filter((item) => item && typeof item === 'object' && String(item.number || '').trim())
        .map((item, index) => ({
          id: item.id || `phone-${index}`,
          number: String(item.number || '').trim(),
          label: String(item.label || (index === 0 ? 'Primary' : 'Phone')).trim(),
          primary: Boolean(item.primary),
        }))
    : [];
  const legacyPhone = hasContactValue('phone') ? String(contactSettings.phone || '').trim() : '';
  const phoneRecords = managedPhoneRecords.length
    ? managedPhoneRecords
    : legacyPhone
      ? [{ id: 'legacy-primary', number: legacyPhone, label: 'Primary', primary: true }]
      : contactSettings?.noCallNumbers === true
        ? []
        : [{ id: 'default-primary', number: defaultPhoneDisplay, label: 'Primary', primary: true }];
  const primaryPhoneRecord = phoneRecords.find((item) => item.primary) || phoneRecords[0] || null;
  const primaryPhoneDigits = String(primaryPhoneRecord?.number || '').replace(/\D/g, '');
  const whatsappDigits = hasContactValue('whatsapp') ? String(contactSettings.whatsapp || '').replace(/\D/g, '') : defaultPhone;
  // Keep public business identity locked to the verified Sector 31 studio and official social account.
  // CMS contact settings must not override the canonical address, Maps CID, or official Instagram URL.
  const address = defaultAddress;
  const openingHours = hasContactValue('openingHours') ? String(contactSettings.openingHours || '').trim() : defaultOpeningHours;
  const mapLink = defaultMapLink;
  const instagramLink = defaultInstagram;
  const mapEmbedUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : '';
  const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}` : '';
  const managedPiercingItems = getPreviewPiercingItems(homepageSettings?.piercingItems);
  const piercingGallery = getPublicPiercingGallery(managedPiercingItems);

  const aboutImages = Array.isArray(homepageSettings?.featuredImages)
    ? homepageSettings.featuredImages
    : [];
  const aboutMainImage = aboutImages[0] || reception;
  const aboutFloatingImage = aboutImages[1] || artistWorking;
  const artists = normalizeArtists(homepageSettings?.artists);
  const visibleArtists = artists.filter((artist) => artist.active && artist.name);
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

  const showAdjacentPiercingImage = (direction) => {
    setPiercingLightbox((current) => {
      if (!current || current.images.length < 2) return current;
      const index = (current.index + direction + current.images.length) % current.images.length;
      return { ...current, index };
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
    if (!piercingLightbox) return undefined;
    const handlePiercingKeyDown = (event) => {
      if (event.key === 'Escape') setPiercingLightbox(null);
      if (event.key === 'ArrowLeft') showAdjacentPiercingImage(-1);
      if (event.key === 'ArrowRight') showAdjacentPiercingImage(1);
    };
    document.addEventListener('keydown', handlePiercingKeyDown);
    return () => document.removeEventListener('keydown', handlePiercingKeyDown);
  }, [piercingLightbox]);

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
    if (!whatsappDigits) { alert('WhatsApp number is not configured.'); return; }
    window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(bookingMessage())}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Divine Ink home">
          <img src={logo} alt="Divine Ink Tattoos & Piercing Studio logo" />
        </a>
        <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          {[
            ['Home', '#home'],
            ['About', '#about'],
            ['Services', '#services'],
            ['Artists', '#artists'],
            ['Portfolio', '#gallery'],
            ['Piercing', '#piercing'],
            ['Reviews', '#reviews'],
            ['Contact', '#contact'],
          ].map(([label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>{label}</a>
          ))}
          {whatsappLink && <a className="nav-cta" href={whatsappLink} target="_blank" rel="noreferrer">Book Now</a>}
        </nav>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-controls="main-navigation" aria-expanded={menuOpen}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section id="home" className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,5,5,.96) 0%, rgba(5,5,5,.72) 45%, rgba(5,5,5,.2) 100%), url(${hero})` }}>
          <div className="hero-content">
            <p className="eyebrow">Tattoo Shop & Piercing Studio · Gurugram</p>
            <h1>Tattoo Shop in Gurgaon<br/><span>Divine Ink Tattoos</span></h1>
            <p className="hero-tagline">Tattoo Artist · Tattoo Studio · Sector 31, Gurugram</p>
            <p className="hero-copy">Custom tattoos, cover-ups, realism, portraits, minimal designs and professional piercing in a hygiene-focused studio at <a href="/locations/sector-31/">Sector 31, Gurugram</a>.</p>
            <div className="hero-actions">
              {whatsappLink && <a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Book on WhatsApp</a>}
              {primaryPhoneDigits && <a className="btn primary" href={`tel:+${primaryPhoneDigits}`}><Phone size={18}/> Book on Call</a>}
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
            <h2>A tattoo shop in Gurgaon focused on meaningful body art.</h2>
            <p>Divine Ink Tattoos & Piercing Studio is a tattoo-focused studio in Sector 31, Gurugram. We combine design consultation, placement planning and careful execution to create tattoos that look intentional—not generic.</p>
            <p>Our studio is located in the basement near Apollo Pharmacy in Main HUDA Market, <a href="/locations/sector-31/">Sector 31, Gurugram</a>. Every appointment is handled with clear communication, hygiene-conscious preparation and aftercare guidance.</p>
            <div className="feature-list">
              <span><ShieldCheck/> Single-use needles & fresh consumables</span>
              <span><CalendarCheck/> Appointment-based consultation</span>
              <span><Sparkles/> Custom styling and placement planning</span>
            </div>
            {mapLink && <a className="text-link" href={mapLink} target="_blank" rel="noreferrer">Get directions <ChevronRight size={18}/></a>}
          </div>
        </section>

        <section id="studio-identity" className="section identity-section">
          <div className="section-heading center">
            <p className="eyebrow">Studio Identity</p>
            <h2>Divine Ink Tattoos in Sector 31, Gurugram</h2>
            <p>If you are searching for Divine Ink Tattoos in Gurgaon or Gurugram, the official website for this studio is <strong>divineinktattoos.in</strong>. The studio is at Shop No. 155, basement, near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001.</p>
            <p>For accurate directions, contact details, and studio information, use this official website and the linked Google Maps profile. Divine Ink Tattoos &amp; Piercing Studio welcomes tattoo and piercing clients at its Sector 31, Gurugram studio.</p>
            <p>Divine Ink operates from one studio at this verified Sector 31 address. This official website does not list a second Gurugram branch. Please use the address and official map link above to confirm the destination before visiting.</p>
            <p>The only official Instagram profile linked by Divine Ink is <strong>@divineinktattoos1</strong>. Use the Instagram link below for the studio’s own work and updates.</p>
            {mapLink && <a className="text-link" href={mapLink} target="_blank" rel="noreferrer">Open the Sector 31 Google Maps listing <ChevronRight size={18}/></a>}
            {instagramLink && <p><a className="text-link" href={instagramLink} target="_blank" rel="noreferrer">Official Instagram: @divineinktattoos1</a></p>}
          </div>
        </section>

        <section id="services" className="section dark-panel">
          <div className="section-heading center">
            <p className="eyebrow">Tattoo Specialties · Sector 31, Gurugram</p>
            <h2>Tattoo Specialties in Gurgaon (Gurugram)</h2>
            <p>Divine Ink’s tattoo specialties include custom tattoo design, fine line tattoos, realism and portrait tattoos, black-and-grey work, cover-up tattoos, minimal tattoos and sleeve planning—all at our single verified studio in Sector 31, Gurugram.</p>
            <p>Choose a specialty below to review the relevant service details. Each consultation considers your reference, placement, size, detail and long-term readability. Professional piercing is also available at the same Sector 31 studio.</p>
          </div>
          <div className="service-grid">
            {services.map(([title, text, href], index) => (
              <article className="service-card" key={title}>
                <span className="service-number">{String(index + 1).padStart(2,'0')}</span>
                <h3>{title}</h3><p>{text}</p>
                <a className="text-link service-card-link" href={href}>View service <ChevronRight size={18}/></a>
              </article>
            ))}
          </div>
        </section>

        <section id="tattoo-gurgaon" className="section">
          <div className="section-heading center">
            <p className="eyebrow">Tattoo Studio · Gurugram</p>
            <h2>Tattoo Shop in Gurgaon for Custom, Fine Line & Realism Work</h2>
            <p>For anyone comparing a tattoo shop in Gurgaon, tattoo artist in Gurgaon or tattoo studio in Gurgaon, the most useful starting point is the tattoo style you actually want. Divine Ink in Sector 31 handles custom tattoos, fine line, realism and portraits, black & grey, cover-ups, minimal designs, religious tattoos, name tattoos and sleeve planning.</p>
            <p>From a first tattoo to a detailed cover-up or large sleeve, consultation covers reference quality, size, placement, composition and how the design should read on the body. If you are looking for a tattoo shop near me in Gurugram, the studio is in Main HUDA Market, Sector 31, near Apollo Pharmacy.</p>
          </div>
          <div className="service-grid">
            <article className="service-card">
              <span className="service-number">01</span>
              <h3>Custom & Fine Line</h3>
              <p>Start with your idea, reference and placement, then choose the closest tattoo style.</p>
              <a className="text-link service-card-link" href="/services/custom-tattoos/">Custom tattoos <ChevronRight size={18}/></a>
              <a className="text-link service-card-link" href="/services/fine-line-tattoos/">Fine line tattoos <ChevronRight size={18}/></a>
            </article>
            <article className="service-card">
              <span className="service-number">02</span>
              <h3>Realism & Portraits</h3>
              <p>Reference quality, scale and contrast matter when planning a realistic portrait tattoo.</p>
              <a className="text-link service-card-link" href="/services/portrait-tattoos/">Portrait & realism tattoos <ChevronRight size={18}/></a>
              <a className="text-link service-card-link" href="/services/black-grey-tattoos/">Black & grey tattoos <ChevronRight size={18}/></a>
            </article>
            <article className="service-card">
              <span className="service-number">03</span>
              <h3>Cover-ups & Sleeves</h3>
              <p>Existing ink, available space and future expansion are considered before the design is finalised.</p>
              <a className="text-link service-card-link" href="/services/cover-up-tattoos/">Cover-up tattoos <ChevronRight size={18}/></a>
              <a className="text-link service-card-link" href="/services/sleeve-tattoos/">Sleeve tattoos <ChevronRight size={18}/></a>
            </article>
          </div>
        </section>

        <section id="artists" className="section">
          <div className="section-heading center">
            <p className="eyebrow">Meet The Artists</p>
            <h2>Tattoo Artists in Gurgaon (Gurugram)</h2>
            <p>Choose an artist based on the style and portfolio that fit your tattoo idea. If you are comparing the <strong>best tattoo artist in Gurgaon</strong>, <strong>best tattoo shop in Gurgaon</strong> or <strong>best tattoo studio in Gurgaon</strong>, use the portfolio and service pages to compare the work that actually matches your requested style. For people researching a <strong>top tattoo artist in Gurgaon</strong> or <strong>top tattoo studio in Gurgaon</strong>, portfolio fit and consultation quality are more useful than a generic ranking. If you are comparing a <strong>top tattoo artist near me</strong> or <strong>top tattoo studio near me</strong>, use the same portfolio, style and consultation checks before choosing.</p>
          </div>
          <div className="artist-grid">
            {visibleArtists.map((artist) => (
              <article className="artist-card" key={artist.id}>
                <img src={getArtistDisplayImage(artist)} alt={artist.name}/>
                <div>
                  <p>{artist.role}</p>
                  <h3>{artist.name}</h3>
                  <span>{artist.bio}</span>
                  <button className="btn secondary" style={{ marginTop: 18 }} onClick={() => viewArtistPortfolio(artist.name)} type="button">View Portfolio</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="gallery" className="section gallery-section">
          <div className="section-heading center">
            <p className="eyebrow">Tattoo Portfolio</p>
            <h2>Real work. Different stories.</h2>
            <p>Browse selected tattoos created across portrait, realism, religious, minimal, floral, geometric and color styles.</p>
          </div>
          <div className="filter-row">
            {filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => { setActiveFilter(filter); setActiveArtist('All Artists'); }}>{filter}</button>)}
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
            {piercingGallery.map(({ id, src, title, images }) => (
              <figure key={id}>
                <button
                  className="piercing-card-open"
                  onClick={() => setPiercingLightbox({ id, title, images, index: 0 })}
                  type="button"
                  aria-label={`Open ${title} photos`}
                >
                  <img src={src} alt={title} loading="lazy"/>
                  {images.length > 1 && <span className="piercing-photo-count">{images.length} photos</span>}
                </button>
                <figcaption>{title}</figcaption>
              </figure>
            ))}
          </div>
          {whatsappLink && <div className="center-action"><a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer">Ask About Piercing <MessageCircle size={18}/></a></div>}
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
                {phoneRecords.map((item) => {
                  const digits = item.number.replace(/\D/g, '');
                  const prefix = phoneRecords.length > 1 && item.label ? `${item.label}: ` : '';
                  return digits ? <a key={item.id} href={`tel:+${digits}`}><Phone/> {prefix}{item.number}</a> : null;
                })}
                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>
                {address && (mapLink ? <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> {address}</a> : <span><MapPin/> {address}</span>)}
                {openingHours && <span><Clock3/> {openingHours}</span>}
              </div>
              {instagramLink && <div className="social-row"><a href={instagramLink} target="_blank" rel="noreferrer">Instagram</a></div>}
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
                {whatsappLink && <button className="btn primary" type="button" onClick={sendBookingOnWhatsApp}><MessageCircle size={18}/> Book on WhatsApp</button>}
              </div>
              <small className="form-note">First email submission may require one-time FormSubmit activation on the studio email.</small>
            </form>
          </div>
          {mapEmbedUrl && <iframe title="Divine Ink Tattoos location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl}></iframe>}
        </section>
      </main>

      <footer className="footer">
        <div><img src={logo} alt="Divine Ink logo"/><p>Tattoo-focused studio in Sector 31, Gurugram for custom, fine line, realism, portrait, black &amp; grey, cover-up and sleeve tattoos, with professional piercing.</p></div>
        <div><h4>Popular Tattoo Services</h4><a href="/services/custom-tattoos/">Custom Tattoos</a><a href="/services/fine-line-tattoos/">Fine Line Tattoos</a><a href="/services/portrait-tattoos/">Realism & Portrait Tattoos</a><a href="/services/cover-up-tattoos/">Cover Up Tattoos</a><a href="/services/sleeve-tattoos/">Sleeve Tattoos</a><a href="/locations/sector-31/">Tattoo Shop in Sector 31</a></div>
        <div><h4>Contact</h4>{phoneRecords.map((item) => { const digits = item.number.replace(/\D/g, ''); return digits ? <a key={item.id} href={`tel:+${digits}`}>{item.number}</a> : null; })}<a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a>{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a>}</div>
        <div className="copyright">© {new Date().getFullYear()} Divine Ink Tattoos & Piercing Studio. All rights reserved.</div>
      </footer>

      <div className="floating-socials" aria-label="Social links">
        {whatsappLink && <a className="floating-social whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsAppLogo/></a>}
        {instagramLink && <a className="floating-social instagram" href={instagramLink} target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>}
      </div>

      {lightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${lightbox.category || 'Gallery'} image preview`} onClick={() => setLightbox(null)}>
        <button ref={lightboxCloseRef} onClick={() => setLightbox(null)} aria-label="Close image"><X/></button>
        {filtered.length > 1 && <button aria-label="Previous image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}
        <img src={lightbox.src} alt={lightbox.altText || lightbox.category || 'Tattoo portfolio image'} onClick={(event) => event.stopPropagation()}/>
        {filtered.length > 1 && <button aria-label="Next image" onClick={(event) => { event.stopPropagation(); showAdjacentLightboxItem(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}
      </div>}

      {piercingLightbox && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${piercingLightbox.title} photo preview`} onClick={() => setPiercingLightbox(null)}>
        <button onClick={() => setPiercingLightbox(null)} aria-label="Close piercing photos"><X/></button>
        {piercingLightbox.images.length > 1 && <button aria-label="Previous piercing photo" onClick={(event) => { event.stopPropagation(); showAdjacentPiercingImage(-1); }} style={{ left: 24, right: 'auto', top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>‹</button>}
        <div className="piercing-lightbox-content" onClick={(event) => event.stopPropagation()}>
          <img src={piercingLightbox.images[piercingLightbox.index]} alt={`${piercingLightbox.title} ${piercingLightbox.index + 1}`}/>
          <p>{piercingLightbox.title}{piercingLightbox.images.length > 1 ? ` · ${piercingLightbox.index + 1}/${piercingLightbox.images.length}` : ''}</p>
        </div>
        {piercingLightbox.images.length > 1 && <button aria-label="Next piercing photo" onClick={(event) => { event.stopPropagation(); showAdjacentPiercingImage(1); }} style={{ left: 'auto', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 46, lineHeight: 1 }}>›</button>}
      </div>}
    </div>
  );
}

export default App;
