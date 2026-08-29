from pathlib import Path


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing expected source: {label}')
    return text.replace(old, new, 1)


app = Path('src/App.jsx')
s = app.read_text()

s = replace_once(
    s,
    "const phone = '918445702782';\nconst mapLink = 'https://share.google/Ot0WZGKQFZkWTcSll';\nconst whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}`;",
    "const defaultPhone = '918445702782';\nconst defaultPhoneDisplay = '+91 84457 02782';\nconst defaultMapLink = 'https://share.google/Ot0WZGKQFZkWTcSll';\nconst defaultAddress = 'Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001';\nconst defaultOpeningHours = 'Open 24x7 — advance confirmation recommended';\nconst defaultInstagram = 'https://www.instagram.com/divineinktattoos1/';\nconst defaultFacebook = 'https://www.facebook.com/profile.php?id=100078466583354';",
    'contact defaults',
)

cms_block = """  const { homepage: homepageSettings, contact: contactSettings } = usePublicCms();
  const hasContactValue = (key) => Boolean(contactSettings && Object.prototype.hasOwnProperty.call(contactSettings, key));
  const phoneRecords = Array.isArray(contactSettings?.phones)
    ? contactSettings.phones
        .filter((item) => item && typeof item === 'object' && String(item.number || '').trim())
        .map((item, index) => ({
          id: item.id || `phone-${index}`,
          number: String(item.number || '').trim(),
          label: String(item.label || (index === 0 ? 'Primary' : 'Phone')).trim(),
          primary: Boolean(item.primary),
        }))
    : hasContactValue('phone') && String(contactSettings.phone || '').trim()
      ? [{ id: 'legacy-primary', number: String(contactSettings.phone).trim(), label: 'Primary', primary: true }]
      : [{ id: 'default-primary', number: defaultPhoneDisplay, label: 'Primary', primary: true }];
  const primaryPhoneRecord = phoneRecords.find((item) => item.primary) || phoneRecords[0] || null;
  const primaryPhoneDigits = String(primaryPhoneRecord?.number || '').replace(/\\D/g, '');
  const whatsappDigits = hasContactValue('whatsapp') ? String(contactSettings.whatsapp || '').replace(/\\D/g, '') : defaultPhone;
  const address = hasContactValue('address') ? String(contactSettings.address || '').trim() : defaultAddress;
  const openingHours = hasContactValue('openingHours') ? String(contactSettings.openingHours || '').trim() : defaultOpeningHours;
  const mapLink = hasContactValue('googleMapsUrl') ? String(contactSettings.googleMapsUrl || '').trim() : defaultMapLink;
  const instagramLink = hasContactValue('instagram') ? String(contactSettings.instagram || '').trim() : defaultInstagram;
  const facebookLink = hasContactValue('facebook') ? String(contactSettings.facebook || '').trim() : defaultFacebook;
  const mapEmbedUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : '';
  const whatsappLink = whatsappDigits ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hi Divine Ink Tattoos, I want to book a consultation.')}` : '';"""
s = replace_once(s, "  const { homepage: homepageSettings } = usePublicCms();", cms_block, 'contact CMS state')

s = replace_once(
    s,
    "    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(bookingMessage())}`, '_blank', 'noopener,noreferrer');",
    "    if (!whatsappDigits) { alert('WhatsApp number is not configured.'); return; }\n    window.open(`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(bookingMessage())}`, '_blank', 'noopener,noreferrer');",
    'booking WhatsApp',
)
s = replace_once(
    s,
    '          <a className="nav-cta" href={whatsappLink} target="_blank" rel="noreferrer">Book Now</a>',
    '          {whatsappLink && <a className="nav-cta" href={whatsappLink} target="_blank" rel="noreferrer">Book Now</a>}',
    'nav CTA',
)
s = replace_once(
    s,
    '              <a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Book on WhatsApp</a>\n              <a className="btn primary" href="tel:+918445702782"><Phone size={18}/> Book on Call</a>',
    '              {whatsappLink && <a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Book on WhatsApp</a>}\n              {primaryPhoneDigits && <a className="btn primary" href={`tel:+${primaryPhoneDigits}`}><Phone size={18}/> Book on Call</a>}',
    'hero contact CTAs',
)
s = replace_once(
    s,
    '          <div className="center-action"><a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer">Ask About Piercing <MessageCircle size={18}/></a></div>',
    '          {whatsappLink && <div className="center-action"><a className="btn primary" href={whatsappLink} target="_blank" rel="noreferrer">Ask About Piercing <MessageCircle size={18}/></a></div>}',
    'piercing WhatsApp',
)

old_contact = """              <div className="contact-list">
                <a href="tel:+918445702782"><Phone/> +91 84457 02782</a>
                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>
                <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001</a>
                <span><Clock3/> Open 24x7 — advance confirmation recommended</span>
              </div>
              <div className="social-row">
                <a href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer">Facebook</a>
              </div>"""
new_contact = """              <div className="contact-list">
                {phoneRecords.map((item) => {
                  const digits = item.number.replace(/\\D/g, '');
                  const prefix = phoneRecords.length > 1 && item.label ? `${item.label}: ` : '';
                  return digits ? <a key={item.id} href={`tel:+${digits}`}><Phone/> {prefix}{item.number}</a> : null;
                })}
                <a href="mailto:divinetattoostudio1@gmail.com"><Mail/> divinetattoostudio1@gmail.com</a>
                {address && (mapLink ? <a href={mapLink} target="_blank" rel="noreferrer"><MapPin/> {address}</a> : <span><MapPin/> {address}</span>)}
                {openingHours && <span><Clock3/> {openingHours}</span>}
              </div>
              {(instagramLink || facebookLink) && <div className="social-row">
                {instagramLink && <a href={instagramLink} target="_blank" rel="noreferrer">Instagram</a>}
                {facebookLink && <a href={facebookLink} target="_blank" rel="noreferrer">Facebook</a>}
              </div>}"""
s = replace_once(s, old_contact, new_contact, 'contact presentation')

s = replace_once(
    s,
    '                <button className="btn primary" type="button" onClick={sendBookingOnWhatsApp}><MessageCircle size={18}/> Book on WhatsApp</button>',
    '                {whatsappLink && <button className="btn primary" type="button" onClick={sendBookingOnWhatsApp}><MessageCircle size={18}/> Book on WhatsApp</button>}',
    'booking WhatsApp button',
)
s = replace_once(
    s,
    '          <iframe title="Divine Ink Tattoos location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Shop%20No.%20155%20Near%20Apollo%20Pharmacy%20Main%20HUDA%20Market%20Sector%2031%20Gurugram%20Haryana%20122001&output=embed"></iframe>',
    '          {mapEmbedUrl && <iframe title="Divine Ink Tattoos location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl}></iframe>}',
    'map embed',
)
s = replace_once(
    s,
    '        <div><h4>Contact</h4><a href="tel:+918445702782">+91 84457 02782</a><a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>',
    '        <div><h4>Contact</h4>{phoneRecords.map((item) => { const digits = item.number.replace(/\\D/g, \'\'); return digits ? <a key={item.id} href={`tel:+${digits}`}>{item.number}</a> : null; })}<a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a>{mapLink && <a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a>}</div>',
    'footer contact',
)
s = replace_once(
    s,
    '        <a className="floating-social whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsAppLogo/></a>\n        <a className="floating-social instagram" href="https://www.instagram.com/divineinktattoos1/" target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>\n        <a className="floating-social facebook" href="https://www.facebook.com/profile.php?id=100078466583354" target="_blank" rel="noreferrer" aria-label="Open Facebook"><FacebookLogo/></a>',
    '        {whatsappLink && <a className="floating-social whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsAppLogo/></a>}\n        {instagramLink && <a className="floating-social instagram" href={instagramLink} target="_blank" rel="noreferrer" aria-label="Open Instagram"><InstagramLogo/></a>}\n        {facebookLink && <a className="floating-social facebook" href={facebookLink} target="_blank" rel="noreferrer" aria-label="Open Facebook"><FacebookLogo/></a>}',
    'floating socials',
)
s = replace_once(
    s,
    '            <a className="text-link" href={mapLink} target="_blank" rel="noreferrer">Get directions <ChevronRight size={18}/></a>',
    '            {mapLink && <a className="text-link" href={mapLink} target="_blank" rel="noreferrer">Get directions <ChevronRight size={18}/></a>}',
    'about directions',
)
app.write_text(s)

contact = Path('src/admin/contact/ContactPage.jsx')
c = contact.read_text()
old = """function normalizeRecord(record) {
  return {
    phones: normalizePhones(record),
    whatsapp: String(record?.whatsapp || defaultContact.whatsapp),
    address: String(record?.address || defaultContact.address),
    instagram: String(record?.instagram || defaultContact.instagram),
    facebook: String(record?.facebook || defaultContact.facebook),
    openingHours: String(record?.openingHours || defaultContact.openingHours),
    googleMapsUrl: String(record?.googleMapsUrl || defaultContact.googleMapsUrl),
  };
}"""
new = """function settingValue(record, key, fallback) {
  return record && Object.prototype.hasOwnProperty.call(record, key) ? String(record[key] ?? '') : fallback;
}

function normalizeRecord(record) {
  return {
    phones: normalizePhones(record),
    whatsapp: settingValue(record, 'whatsapp', defaultContact.whatsapp),
    address: settingValue(record, 'address', defaultContact.address),
    instagram: settingValue(record, 'instagram', defaultContact.instagram),
    facebook: settingValue(record, 'facebook', defaultContact.facebook),
    openingHours: settingValue(record, 'openingHours', defaultContact.openingHours),
    googleMapsUrl: settingValue(record, 'googleMapsUrl', defaultContact.googleMapsUrl),
  };
}"""
c = replace_once(c, old, new, 'ContactPage independent fields')
contact.write_text(c)

verify = Path('scripts/verify-production-build.mjs')
v = verify.read_text()
old = "expect(appSource.includes(\"const phone = '918445702782';\"), 'Homepage phone constant changed unexpectedly.');\n"
new = """expect(appSource.includes("const defaultPhone = '918445702782';"), 'Default homepage phone changed unexpectedly.');
expect(appSource.includes("const { homepage: homepageSettings, contact: contactSettings } = usePublicCms();"), 'Contact settings must be connected without enabling other CMS sections.');
expect(appSource.includes('Array.isArray(contactSettings?.phones)'), 'Public site must support multiple managed phone numbers.');
expect(appSource.includes('primaryPhoneDigits'), 'Public site must support a primary managed Call number.');
expect(appSource.includes('whatsappDigits'), 'Public site must support an independently managed WhatsApp number.');
expect(appSource.includes('<Phone size={18}/> Book on Call'), 'Original Book on Call CTA must remain present.');
expect(appSource.includes('<MessageCircle size={19}/> Book on WhatsApp'), 'Original Book on WhatsApp CTA must remain present.');
expect(!appSource.includes('cmsServices') && !appSource.includes('cmsFaqs') && !appSource.includes('cmsReviews') && !appSource.includes('cmsOffers') && !appSource.includes('useManagedSeo'), 'Only Contact CMS may be newly connected in this change.');
const contactAdminSource = await read(resolve('src', 'admin', 'contact', 'ContactPage.jsx'));
expect(contactAdminSource.includes('Add phone number'), 'Contact admin must allow adding phone numbers.');
expect(contactAdminSource.includes('removePhone'), 'Contact admin must allow removing phone numbers.');
expect(contactAdminSource.includes('setPrimaryPhone'), 'Contact admin must allow choosing the primary number.');
expect(contactAdminSource.includes('settingValue'), 'Contact fields must remain independently editable/removable.');
"""
v = replace_once(v, old, new, 'contact regression checks')
verify.write_text(v)
