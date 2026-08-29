import { readFile, writeFile } from 'node:fs/promises';

async function update(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No change applied to ${path}`);
  await writeFile(path, after, 'utf8');
}

function replaceRequired(content, search, replacement, label) {
  if (!content.includes(search)) throw new Error(`Missing expected source for ${label}`);
  return content.replace(search, replacement);
}

await update('src/App.jsx', (source) => {
  let app = source;

  app = replaceRequired(
    app,
    `import { usePublicCms } from './usePublicCms.js';`,
    `import { useManagedSeo, usePublicCms } from './usePublicCms.js';`,
    'public CMS import',
  );

  app = replaceRequired(
    app,
    `const phone = '918445702782';\nconst mapLink = 'https://share.google/Ot0WZGKQFZkWTcSll';\nconst whatsappLink = \`https://wa.me/\${phone}?text=\${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}\`;\n\nconst services = [`,
    `const defaultPhone = '918445702782';\nconst defaultPhoneDisplay = '+91 84457 02782';\nconst defaultMapLink = 'https://share.google/Ot0WZGKQFZkWTcSll';\nconst defaultAddress = 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001';\nconst defaultInstagram = 'https://www.instagram.com/divineinktattoos1/';\nconst defaultFacebook = 'https://www.facebook.com/profile.php?id=100078466583354';\n\nconst defaultServices = [`,
    'default contact constants and services',
  );

  app = replaceRequired(
    app,
    `const faqs = [`,
    `const homepageServiceSlugs = [\n  'custom-tattoos',\n  'cover-up-tattoos',\n  'portrait-tattoos',\n  'minimal-tattoos',\n  'religious-tattoos',\n  'name-tattoos',\n  'sleeve-tattoos',\n  'ear-piercing',\n];\n\nconst defaultFaqs = [`,
    'default faq rename',
  );

  app = replaceRequired(
    app,
    `  const galleryItems = usePublicGallery(galleryFallbackItems);\n  const { homepage: homepageSettings } = usePublicCms();\n  const managedPiercingItems = getPreviewPiercingItems(homepageSettings?.piercingItems);\n  const piercingGallery = getPublicPiercingGallery(managedPiercingItems);\n\n  const aboutImages = Array.isArray(homepageSettings?.featuredImages)`,
    `  const galleryItems = usePublicGallery(galleryFallbackItems);\n  const {\n    homepage: homepageSettings,\n    contact: contactSettings,\n    seo: seoSettings,\n    services: cmsServices,\n    faqs: cmsFaqs,\n    reviews: cmsReviews,\n    offers: cmsOffers,\n  } = usePublicCms();\n  useManagedSeo(seoSettings);\n\n  const phoneDisplay = String(contactSettings?.phone || defaultPhoneDisplay).trim();\n  const phone = String(contactSettings?.phone || defaultPhone).replace(/\\D/g, '') || defaultPhone;\n  const whatsappPhone = String(contactSettings?.whatsapp || phone).replace(/\\D/g, '') || defaultPhone;\n  const mapLink = String(contactSettings?.googleMapsUrl || defaultMapLink).trim();\n  const address = String(contactSettings?.address || defaultAddress).trim();\n  const openingHours = String(contactSettings?.openingHours || 'Open 24x7 — advance confirmation recommended').trim();\n  const instagramLink = String(contactSettings?.instagram || defaultInstagram).trim();\n  const facebookLink = String(contactSettings?.facebook || defaultFacebook).trim();\n  const mapEmbedUrl = \`https://www.google.com/maps?q=\${encodeURIComponent(address)}&output=embed\`;\n  const whatsappLink = \`https://wa.me/\${whatsappPhone}?text=\${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}\`;\n  const heroEyebrow = String(homepageSettings?.bannerText || 'Premium Tattoo & Piercing Studio · Gurugram').trim();\n  const heroCtaText = String(homepageSettings?.ctaText || 'Book on WhatsApp').trim();\n  const homepageServices = defaultServices.map((fallback, index) => {\n    const managed = cmsServices.find((item) => item.slug === homepageServiceSlugs[index]);\n    return [managed?.title || fallback[0], managed?.description || fallback[1]];\n  });\n  const faqs = cmsFaqs.length\n    ? cmsFaqs.map((item) => [item.question, item.answer])\n    : defaultFaqs;\n  const today = new Date().toISOString().slice(0, 10);\n  const activeOffers = cmsOffers.filter((item) => {\n    const starts = !item.startDate || item.startDate <= today;\n    const ends = !item.endDate || item.endDate >= today;\n    return starts && ends;\n  });\n  const managedReviews = cmsReviews.slice(0, 6);\n  const managedPiercingItems = getPreviewPiercingItems(homepageSettings?.piercingItems);\n  const piercingGallery = getPublicPiercingGallery(managedPiercingItems);\n\n  const aboutImages = Array.isArray(homepageSettings?.featuredImages)`,
    'CMS runtime values',
  );

  app = replaceRequired(
    app,
    `<p className="eyebrow">Premium Tattoo & Piercing Studio · Gurugram</p>`,
    `<p className="eyebrow">{heroEyebrow}</p>`,
    'hero banner CMS',
  );
  app = replaceRequired(
    app,
    `<a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Book on WhatsApp</a>`,
    `<a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> {heroCtaText}</a>`,
    'hero CTA CMS',
  );
  app = replaceRequired(
    app,
    `<a className="btn primary" href="tel:+918445702782"><Phone size={18}/> Book on Call</a>`,
    `<a className="btn primary" href={\`tel:+\${phone}\`}><Phone size={18}/> Book on Call</a>`,
    'hero dynamic phone',
  );
  app = replaceRequired(
    app,
    `<span><Clock3 size={17}/> Open 24x7</span>`,
    `<span><Clock3 size={17}/> {openingHours}</span>`,
    'hero hours CMS',
  );
  app = replaceRequired(app, `{services.map(([title, text], index) => (`, `{homepageServices.map(([title, text], index) => (`, 'homepage services CMS');

  app = replaceRequired(
    app,
    `        </section>\n\n        <section id="artists" className="section">`,
    `        </section>\n\n        {activeOffers.length > 0 && (\n          <section id="offers" className="section">\n            <div className="section-heading center">\n              <p className="eyebrow">Current Offers</p>\n              <h2>{homepageSettings?.offersHeading || 'Studio offers'}</h2>\n              {homepageSettings?.offersText && <p>{homepageSettings.offersText}</p>}\n            </div>\n            <div className="service-grid">\n              {activeOffers.map((offer, index) => (\n                <article className="service-card" key={offer.id}>\n                  <span className="service-number">{String(index + 1).padStart(2, '0')}</span>\n                  <h3>{offer.title}</h3>\n                  <p>{offer.description}</p>\n                  <a className="text-link" href={whatsappLink} target="_blank" rel="noreferrer">{offer.ctaText || 'Book Now'} <ChevronRight size={18}/></a>\n                </article>\n              ))}\n            </div>\n          </section>\n        )}\n\n        <section id="artists" className="section">`,
    'offers CMS section',
  );

  app = replaceRequired(
    app,
    `          </div>\n          <div className="reviews-widget-wrap"><div className="sk-ww-google-reviews" data-embed-id="25698491"></div></div>`,
    `          </div>\n          {managedReviews.length > 0 && (\n            <div className="service-grid" style={{ marginBottom: 28 }}>\n              {managedReviews.map((review) => (\n                <article className="service-card" key={review.id}>\n                  <div className="stars" aria-label={\`\${review.rating || 5} out of 5 stars\`}>\n                    {Array.from({ length: Math.max(1, Math.min(5, Number(review.rating) || 5)) }).map((_, index) => <Star key={index}/>)}\n                  </div>\n                  <h3>{review.author}</h3>\n                  <p>{review.text}</p>\n                  {review.source && <small>{review.source}</small>}\n                </article>\n              ))}\n            </div>\n          )}\n          <div className="reviews-widget-wrap"><div className="sk-ww-google-reviews" data-embed-id="25698491"></div></div>`,
    'reviews CMS cards',
  );

  app = replaceRequired(
    app,
    `<a href="tel:+918445702782"><Phone/> +91 84457 02782</a>\n                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>\n                <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001</a>\n                <span><Clock3/> Open 24x7 — advance confirmation recommended</span>`,
    `<a href={\`tel:+\${phone}\`}><Phone/> {phoneDisplay}</a>\n                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>\n                <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> {address}</a>\n                <span><Clock3/> {openingHours}</span>`,
    'contact CMS details',
  );
  app = replaceRequired(
    app,
    `<a href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer">Instagram</a>\n                <a href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer">Facebook</a>`,
    `<a href={instagramLink} target="_blank" rel="noreferrer">Instagram</a>\n                <a href={facebookLink} target="_blank" rel="noreferrer">Facebook</a>`,
    'contact social CMS',
  );
  app = replaceRequired(
    app,
    `src="https://www.google.com/maps?q=Shop%20No.%20155%20Near%20Apollo%20Pharmacy%20Main%20HUDA%20Market%20Sector%2031%20Gurugram%20Haryana%20122001&output=embed"`,
    `src={mapEmbedUrl}`,
    'contact map CMS',
  );
  app = replaceRequired(
    app,
    `<div><h4>Contact</h4><a href="tel:+918445702782">+91 84457 02782</a><a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>`,
    `<div><h4>Contact</h4><a href={\`tel:+\${phone}\`}>{phoneDisplay}</a><a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>`,
    'footer contact CMS',
  );
  app = replaceRequired(
    app,
    `<a className="floating-social instagram" href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>\n        <a className="floating-social facebook" href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer" aria-label="Open Facebook"><FacebookLogo/></a>`,
    `<a className="floating-social instagram" href={instagramLink} target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>\n        <a className="floating-social facebook" href={facebookLink} target="_blank" rel="noreferrer" aria-label="Open Facebook"><FacebookLogo/></a>`,
    'floating social CMS',
  );

  return app;
});

await update('scripts/verify-production-build.mjs', (source) => {
  const marker = `expect(appSource.includes('getPreviewPiercingItems(homepageSettings?.piercingItems)'), 'Public piercing section must remain connected to managed piercing data with built-in fallback.');`;
  const extra = `${marker}\nexpect(appSource.includes('useManagedSeo(seoSettings)'), 'Homepage SEO admin settings must be connected to the public site.');\nexpect(appSource.includes('cmsFaqs.length'), 'FAQ admin content must be connected to the public FAQ section.');\nexpect(appSource.includes('activeOffers.map'), 'Offers admin content must be connected to the public site.');\nexpect(appSource.includes('managedReviews.map'), 'Reviews admin content must be connected to the public site.');\nexpect(appSource.includes('contactSettings?.phone'), 'Contact admin settings must be connected to public contact details.');\nexpect(appSource.includes('homepageServices.map'), 'Services admin content must be connected to homepage service cards.');\n\nconst servicePageSource = await read(resolve('src', 'ServicePage.jsx'));\nexpect(servicePageSource.includes('usePublicCms()'), 'Service pages must read managed CMS service data.');\nexpect(servicePageSource.includes('managed?.pricing'), 'Service page pricing must be connected to admin service data.');\nexpect(servicePageSource.includes('normalizeServiceFaqs'), 'Service page FAQs must be connected to admin service data.');\n\nconst publicCmsSource = await read(resolve('src', 'usePublicCms.js'));\nexpect(publicCmsSource.includes("collection(db, 'reviews')"), 'Public CMS loader must load published reviews.');\nexpect(publicCmsSource.includes("collection(db, 'offers')"), 'Public CMS loader must load active offers.');\nexpect(publicCmsSource.includes('admin-managed-seo-schema'), 'Managed SEO schema must be isolated from the built-in LocalBusiness schema.');\nexpect(publicCmsSource.includes("normalized.includes('noindex')"), 'Managed SEO must block accidental noindex publishing.');`;
  return replaceRequired(source, marker, extra, 'regression CMS wiring checks');
});
