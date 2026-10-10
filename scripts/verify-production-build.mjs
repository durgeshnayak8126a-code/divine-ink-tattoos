import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';
import { servicePages } from '../src/serviceData.js';

const dist = resolve('dist');
const failures = [];
const locationSeoManagerSource = await readFile(resolve('src', 'LocationSeoManager.jsx'), 'utf8');
const conflictingListingSignals = [
  'shop no. 189',
  'shop no 189',
  'shop no. 9',
  'sector 38',
  'islampur',
  'samvit hospital',
  'instagram.com/angeltattoodesignstudio',
  'instagram.com/devtattoostudio_',
];

function fail(message) {
  failures.push(message);
}

function expect(condition, message) {
  if (!condition) fail(message);
}

function getJsonLdEntities(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const entities = [];

  for (const [index, script] of scripts.entries()) {
    let parsed;
    try {
      parsed = JSON.parse(script);
    } catch (error) {
      throw new Error(`Invalid JSON-LD block #${index + 1}: ${error.message}`);
    }
    if (Array.isArray(parsed)) {
      entities.push(...parsed);
    } else if (Array.isArray(parsed?.['@graph'])) {
      entities.push(...parsed['@graph']);
    } else {
      entities.push(parsed);
    }
  }

  return entities;
}

function countJsonLdEntities(html, predicate) {
  return getJsonLdEntities(html).filter(predicate).length;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function read(path) {
  return readFile(path, 'utf8');
}

function expectUnique(values, label) {
  const unique = new Set(values);
  expect(unique.size === values.length, `${label} must be unique.`);
}

function validateRelated(items, itemLabel) {
  const slugs = new Set(items.map((item) => item.slug));
  for (const item of items) {
    expect(Array.isArray(item.related), `${itemLabel} ${item.slug} must have related links.`);
    const related = item.related || [];
    expect(related.length >= 2, `${itemLabel} ${item.slug} must expose at least two related internal links.`);
    expect(new Set(related).size === related.length, `${itemLabel} ${item.slug} must not repeat related internal links.`);
    for (const relatedSlug of related) {
      expect(slugs.has(relatedSlug), `${itemLabel} ${item.slug} references missing related slug ${relatedSlug}.`);
      expect(relatedSlug !== item.slug, `${itemLabel} ${item.slug} must not relate to itself.`);
    }
  }
}

expectUnique(servicePages.map((item) => item.slug), 'Service slugs');
expectUnique(locationPages.map((item) => item.slug), 'Location slugs');
expectUnique(servicePages.map((item) => item.metaTitle), 'Service SEO titles');
expectUnique(locationPages.map((item) => item.metaTitle), 'Location SEO titles');
expectUnique(servicePages.map((item) => item.description), 'Service SEO descriptions');
expectUnique(locationPages.map((item) => item.description), 'Location SEO descriptions');
expectUnique([...servicePages, ...locationPages].map((item) => item.metaTitle), 'Combined public SEO titles');
expect(servicePages.every((item) => item.metaTitle && item.description), 'Every service page must have SEO title and description.');
expect(locationPages.every((item) => item.metaTitle && item.description), 'Every location page must have SEO title and description.');
validateRelated(servicePages, 'Service');
validateRelated(locationPages, 'Location');

const homepageIdentitySource = await read(resolve('src', 'App.jsx'));
expect(
  homepageIdentitySource.includes('Divine Ink operates from one studio at this verified Sector 31 address.') &&
    homepageIdentitySource.includes('This official website does not list a second Gurugram branch.') &&
    homepageIdentitySource.includes('Open the Sector 31 Google Maps listing') &&
    homepageIdentitySource.includes('Is this website connected to Divine Ink studios in other cities?') &&
    homepageIdentitySource.includes('It does not represent or advertise branches in other cities.'),
  'Homepage must clearly identify the single verified Sector 31 studio and point visitors to its official map listing.',
);
expect(
  homepageIdentitySource.includes('const address = defaultAddress;') &&
    homepageIdentitySource.includes('const mapLink = defaultMapLink;') &&
    homepageIdentitySource.includes('const instagramLink = defaultInstagram;') &&
    homepageIdentitySource.includes('Official Instagram: @divineinktattoos1') &&
    homepageIdentitySource.includes('https://www.google.com/maps?cid=13259589601998313340') &&
    homepageIdentitySource.includes('https://www.instagram.com/divineinktattoos1/'),
  'Public homepage must lock its canonical Sector 31 address, Maps CID, and official Instagram account against stale CMS overrides.',
);
expect(
  !['Shop No. 189', 'Shop No 189', 'Shop No. 9', 'Sector 38', 'Samvit Hospital', 'instagram.com/angeltattoodesignstudio', 'instagram.com/devtattoostudio_'].some((value) => homepageIdentitySource.toLowerCase().includes(value.toLowerCase())),
  'Homepage source must not repeat conflicting third-party addresses or unrelated social accounts.',
);
expect(
  !homepageIdentitySource.includes('100078466583354') && !homepageIdentitySource.includes('defaultFacebook') && !homepageIdentitySource.includes('facebookLink'),
  'Public homepage must not publish an unverified Facebook account; only the confirmed official Instagram profile is allowed.',
);

expect(
  homepageIdentitySource.includes('Tattoo Specialties in Gurgaon (Gurugram)') &&
    homepageIdentitySource.includes('custom tattoo design, fine line tattoos, realism and portrait tattoos, black-and-grey work, cover-up tattoos'),
  'Homepage must clearly identify Divine Ink\'s core tattoo specialties and verified Sector 31 studio.',
);

const homepagePath = resolve(dist, 'index.html');
expect(await exists(homepagePath), 'dist/index.html must exist after build.');

if (await exists(homepagePath)) {
  const homepage = await read(homepagePath);
  expect(
    homepage.includes('<title>Tattoo Shop & Studio in Gurgaon (Gurugram) | Divine Ink Tattoos</title>'),
    'Homepage SEO title changed unexpectedly.',
  );
  expect(
    homepage.includes('<meta name="description" content="Official Divine Ink Tattoos website: one studio at Shop No. 155, Basement, Main HUDA Market, Sector 31, Gurugram. Instagram @divineinktattoos1." />'),
    'Homepage SEO description changed unexpectedly.',
  );
  expect(
    homepage.includes('<meta property="og:title" content="Tattoo Shop & Studio in Gurgaon (Gurugram) | Divine Ink Tattoos" />'),
    'Homepage OG title changed unexpectedly.',
  );
  expect(
    homepage.includes('<meta name="twitter:title" content="Tattoo Shop & Studio in Gurgaon (Gurugram) | Divine Ink Tattoos" />'),
    'Homepage Twitter title changed unexpectedly.',
  );
  expect(
    homepage.includes('<meta property="og:description" content="Official Divine Ink studio: Shop No. 155, Basement, Main HUDA Market, Sector 31, Gurugram. Instagram @divineinktattoos1." />'),
    'Homepage OG description changed unexpectedly.',
  );
  expect(
    homepage.includes('<meta name="twitter:description" content="Official Divine Ink studio: Shop No. 155, Basement, Main HUDA Market, Sector 31, Gurugram. Instagram @divineinktattoos1." />'),
    'Homepage Twitter description changed unexpectedly.',
  );
  expect(
    homepage.includes('<link rel="canonical" href="https://divineinktattoos.in/"'),
    'Homepage canonical URL is missing or changed.',
  );
  expect(
    homepage.includes('name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'),
    'Homepage robots directive must explicitly allow indexing.',
  );
  expect(
    homepage.includes('name="google-site-verification"'),
    'Google Search Console verification meta is missing.',
  );
  expect(
    homepage.includes('"@type":["TattooParlor","LocalBusiness"]') ||
      homepage.includes('"@type": ["TattooParlor", "LocalBusiness"]'),
    'Homepage LocalBusiness/TattooParlor schema is missing.',
  );
  // Keep one canonical homepage entity for each site/business identity and ensure the page points to it.
  const homepageEntities = getJsonLdEntities(homepage);
  expect(
    homepageEntities.filter((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#localbusiness').length === 1,
    'Homepage must publish exactly one canonical LocalBusiness entity.',
  );
  expect(
    homepageEntities.filter((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#organization').length === 1,
    'Homepage must publish exactly one canonical Organization entity.',
  );
  const homepageWebSite = homepageEntities.find((entity) => entity?.['@type'] === 'WebSite' && entity?.url === 'https://divineinktattoos.in/');
  expect(homepageWebSite?.about?.['@id'] === 'https://divineinktattoos.in/#localbusiness', 'Homepage WebSite must point to the canonical LocalBusiness entity.');
  expect(homepageWebSite?.publisher?.['@id'] === 'https://divineinktattoos.in/#organization', 'Homepage WebSite publisher must point to the canonical Organization entity.');
  const canonicalBusiness = homepageEntities.find((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#localbusiness');
  expect(
    canonicalBusiness?.disambiguatingDescription?.includes('Shop No. 155, Basement') &&
      canonicalBusiness?.disambiguatingDescription?.includes('official website') &&
      canonicalBusiness?.disambiguatingDescription?.includes('one verified Gurugram studio only') &&
      canonicalBusiness?.disambiguatingDescription?.includes('similarly named businesses') &&
      !['sector 38', 'islampur', 'samvit hospital', 'shop no. 9', 'shop no 9'].some((value) => (canonicalBusiness?.disambiguatingDescription || '').toLowerCase().includes(value)),
    'Homepage business schema must positively identify the verified Sector 31 studio without repeating conflicting listing details.',
  );
  expect(
    canonicalBusiness?.sameAs?.includes('https://www.instagram.com/divineinktattoos1/'),
    'Canonical business schema must point to the official Divine Ink Instagram account.',
  );
  const canonicalOrganization = homepageEntities.find((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#organization');
  expect(
    canonicalOrganization?.description?.includes('independent Divine Ink Tattoos & Piercing Studio') &&
      canonicalOrganization?.description?.includes('one verified studio only') &&
      canonicalOrganization?.contactPoint?.areaServed === 'Gurugram, Haryana, India',
    'Organization schema must disambiguate the independent Gurugram business and keep its service-contact area local.',
  );
  expect(
    canonicalBusiness?.identifier?.['@type'] === 'PropertyValue' &&
      canonicalBusiness?.identifier?.propertyID === 'Google Maps Place ID' &&
      canonicalBusiness?.identifier?.value === 'ChIJyZWbyoMZDTkRfJeSnn2GA7g',
    'Canonical business schema must include the verified Google Maps Place ID for entity disambiguation.',
  );
  expect(
    canonicalBusiness?.address?.streetAddress?.includes('Shop No. 155') &&
      !['shop no. 189', 'shop no 189', 'shop no. 9', 'samvit hospital'].some((value) => (canonicalBusiness?.address?.streetAddress || '').toLowerCase().includes(value)),
    'Canonical business schema must keep only the verified Sector 31 address, not the unrelated Sector 38 listing.',
  );
  expect(
    ['Custom tattoos', 'Fine line tattoos', 'Realism tattoos', 'Portrait tattoos', 'Black and grey tattoos', 'Cover-up tattoos', 'Sleeve tattoos', 'Minimal tattoos', 'Colour tattoos', 'Religious tattoos', 'Name and lettering tattoos', 'Couple tattoos', 'Body piercing', 'Ear piercing'].every((specialty) => canonicalBusiness?.knowsAbout?.includes(specialty)),
    'Canonical business schema must enumerate the specialties that are visibly offered on the website.',
  );
  expect(
    !['shop no. 189', 'shop no 189', 'shop no. 9', 'sector 38', 'islampur', 'samvit hospital', 'instagram.com/angeltattoodesignstudio', 'instagram.com/devtattoostudio_'].some((value) => homepage.toLowerCase().includes(value)),
    'Homepage schema and metadata must not repeat conflicting third-party locations or unrelated Instagram handles.',
  );

  // Locked business/entity regression guards. These values may only change with explicit approval.
  // Normalize JSON-LD whitespace so formatting changes do not create false failures.
  const normalizedHomepage = homepage.replace(/\s+/g, '');
  expect(normalizedHomepage.includes('"telephone":"+918445702782"'), 'Locked phone is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"postalCode":"122001"'), 'Locked postal code is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"propertyID":"GooglePlaceID","value":"ChIJyZWbyoMZDTkRfJeSnn2GA7g"'), 'Canonical Google Place ID is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"propertyID":"GoogleMapsCID","value":"13259589601998313340"'), 'Canonical Google Maps CID identifier is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"foundingDate":"2018-01-30"'), 'Locked founding date is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"addressLocality":"Gurugram"'), 'Locked city is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"addressRegion":"Haryana"'), 'Locked state is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('cid=13259589601998313340'), 'Canonical Maps CID is missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"latitude":28.4529') && normalizedHomepage.includes('"longitude":77.0508791'), 'Locked Maps coordinates are missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"opens":"00:00"') && normalizedHomepage.includes('"closes":"23:59"'), 'Locked 24x7 hours are missing or changed in homepage schema.');
  expect(normalizedHomepage.includes('"name":"Gurugram"') && normalizedHomepage.includes('"alternateName":"Gurgaon"'), 'Gurgaon/Gurugram area identity is missing or changed in homepage schema.');
  expect(
    homepage.includes('https://widgets.sociablekit.com/google-reviews/widget.js'),
    'Google Reviews widget loader is missing.',
  );
  expect(
    !homepage.includes('<script src="https://widgets.sociablekit.com/google-reviews/widget.js" defer'),
    'SociableKIT must not return to the early head-loading pattern that caused the blank review box.',
  );
}

for (const service of servicePages) {
  const pagePath = resolve(dist, 'services', service.slug, 'index.html');
  expect(await exists(pagePath), `Missing generated service page: ${service.slug}.`);
  if (!(await exists(pagePath))) continue;

  const html = await read(pagePath);
  const canonical = `https://divineinktattoos.in/services/${service.slug}/`;
  const expectedTitle = service.metaTitle;
  const normalizedServiceHtml = html.toLowerCase();
  expect(
    !conflictingListingSignals.some((signal) => normalizedServiceHtml.includes(signal)),
    `Service page ${service.slug} must not contain unrelated studio addresses or competitor social handles.`,
  );
  expect(
    !/https?:\/\/www\.instagram\.com\/(?!divineinktattoos1\/)[^"'\s<]+/i.test(html),
    `Service page ${service.slug} must not link to an unrelated Instagram account.`,
  );

  expect(html.includes(`<title>${expectedTitle}</title>`), `Wrong SEO title for service ${service.slug}.`);
  expect(html.includes(`<meta name="description" content="${service.description}">`), `Wrong SEO description for service ${service.slug}.`);
  expect(html.includes(`<meta property="og:description" content="${service.description}">`), `Wrong OG description for service ${service.slug}.`);
  expect(html.includes(`<meta name="twitter:description" content="${service.description}">`), `Wrong Twitter description for service ${service.slug}.`);
  expect((html.match(/<meta name="description"/g) || []).length === 1, `Service ${service.slug} must have exactly one meta description.`);
  expect((html.match(/<meta property="og:description"/g) || []).length === 1, `Service ${service.slug} must have exactly one OG description.`);
  expect((html.match(/<meta name="twitter:description"/g) || []).length === 1, `Service ${service.slug} must have exactly one Twitter description.`);
  expect(html.includes(`rel="canonical" href="${canonical}"`), `Wrong canonical for service ${service.slug}.`);
  expect((html.match(/<link rel="canonical"/g) || []).length === 1, `Service ${service.slug} must have exactly one canonical link.`);
  expect((html.match(/<meta name="robots"/g) || []).length === 1, `Service ${service.slug} must have exactly one robots meta tag.`);
  expect(html.includes('name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'), `Public service ${service.slug} must explicitly allow indexing.`);
  expect(!html.includes('noindex'), `Public service ${service.slug} must not contain noindex directives.`);
  expect(html.includes('"@type":"Service"'), `Service schema missing for ${service.slug}.`);
  expect(html.includes('"name":"Gurugram","alternateName":"Gurgaon"'), `Service area identity must include Gurgaon alias for ${service.slug}.`);
  expect(html.includes(`${canonical}#breadcrumb`), `Service breadcrumb entity link missing for ${service.slug}.`);
  expect(html.includes(`${canonical}#webpage`), `Service WebPage entity link missing for ${service.slug}.`);
  expect(countJsonLdEntities(html, (entity) => entity?.['@id'] === `${canonical}#breadcrumb`) === 1, `Service ${service.slug} must publish exactly one page breadcrumb entity.`);
  expect(countJsonLdEntities(html, (entity) => entity?.['@id'] === `${canonical}#service`) === 1, `Service ${service.slug} must publish exactly one service entity.`);
  expect(countJsonLdEntities(html, (entity) => entity?.['@id'] === `${canonical}#webpage`) === 1, `Service ${service.slug} must publish exactly one WebPage entity.`);
  const serviceSchema = getJsonLdEntities(html).find((entity) => entity?.['@id'] === `${canonical}#service`);
  const serviceWebPageSchema = getJsonLdEntities(html).find((entity) => entity?.['@id'] === `${canonical}#webpage`);
  expect(serviceSchema?.name === service.name, `Service schema name drifted from source for ${service.slug}.`);
  expect(serviceSchema?.serviceType === service.name, `Service schema type label drifted from source for ${service.slug}.`);
  expect(serviceSchema?.description === service.description, `Service schema description drifted from source for ${service.slug}.`);
  expect(serviceSchema?.url === canonical, `Service schema URL drifted for ${service.slug}.`);
  expect(serviceWebPageSchema?.name === service.metaTitle, `Service WebPage name drifted from source for ${service.slug}.`);
  expect(serviceWebPageSchema?.description === service.description, `Service WebPage description drifted from source for ${service.slug}.`);
  expect(serviceWebPageSchema?.mainEntity?.['@id'] === `${canonical}#service`, `Service WebPage mainEntity drifted for ${service.slug}.`);
}

expect(
  !locationSeoManagerSource.includes("'@type': ['TattooParlor', 'LocalBusiness']"),
  'Client-side area-page schema must not duplicate the canonical LocalBusiness entity already present in the base HTML.',
);

for (const location of locationPages) {
  const pagePath = resolve(dist, 'locations', location.slug, 'index.html');
  expect(await exists(pagePath), `Missing generated location page: ${location.slug}.`);
  if (!(await exists(pagePath))) continue;

  const html = await read(pagePath);
  const canonical = `https://divineinktattoos.in/locations/${location.slug}/`;
  const normalizedLocationHtml = html.toLowerCase();
  expect(
    !conflictingListingSignals.some((signal) => normalizedLocationHtml.includes(signal)),
    `Location page ${location.slug} must not contain unrelated Sector 38 listings, conflicting addresses, or other studios' Instagram handles.`,
  );

  expect(html.includes(`<title>${location.metaTitle}</title>`), `Wrong SEO title for location ${location.slug}.`);
  expect(html.includes(`<meta name="description" content="${location.description}">`), `Wrong SEO description for location ${location.slug}.`);
  expect(html.includes(`<meta property="og:description" content="${location.description}">`), `Wrong OG description for location ${location.slug}.`);
  expect(html.includes(`<meta name="twitter:description" content="${location.description}">`), `Wrong Twitter description for location ${location.slug}.`);
  expect((html.match(/<meta name="description"/g) || []).length === 1, `Location ${location.slug} must have exactly one meta description.`);
  expect((html.match(/<meta property="og:description"/g) || []).length === 1, `Location ${location.slug} must have exactly one OG description.`);
  expect((html.match(/<meta name="twitter:description"/g) || []).length === 1, `Location ${location.slug} must have exactly one Twitter description.`);
  expect(html.includes(`rel="canonical" href="${canonical}"`), `Wrong canonical for location ${location.slug}.`);
  expect((html.match(/<link rel="canonical"/g) || []).length === 1, `Location ${location.slug} must have exactly one canonical link.`);
  expect((html.match(/<meta name="robots"/g) || []).length === 1, `Location ${location.slug} must have exactly one robots meta tag.`);
  expect(html.includes('name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"'), `Public location ${location.slug} must explicitly allow indexing.`);
  expect(!html.includes('noindex'), `Public location ${location.slug} must not contain noindex directives.`);
  expect(html.includes('"@type":["TattooParlor","LocalBusiness"]') || html.includes('"@type": ["TattooParlor", "LocalBusiness"]') || html.includes('"@type":["LocalBusiness","TattooParlor"]') || html.includes('"@type": ["LocalBusiness", "TattooParlor"]'), `Canonical LocalBusiness/TattooParlor schema missing for location ${location.slug}.`);
  const locationEntities = getJsonLdEntities(html);
  expect(locationEntities.filter((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#localbusiness').length === 1, `Location ${location.slug} must reuse exactly one canonical LocalBusiness entity.`);
  const locationBusinessEntity = locationEntities.find((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#localbusiness');
  expect(locationBusinessEntity?.url === 'https://divineinktattoos.in/', `Location ${location.slug} LocalBusiness URL must remain the homepage URL.`);
  expect(locationEntities.filter((entity) => entity?.['@id'] === 'https://divineinktattoos.in/#organization').length === 1, `Location ${location.slug} must reuse exactly one canonical Organization entity.`);
  expect(html.includes(`${canonical}#breadcrumb`), `Location breadcrumb entity link missing for ${location.slug}.`);
  expect(html.includes(`${canonical}#webpage`), `Location WebPage entity link missing for ${location.slug}.`);
  expect(countJsonLdEntities(html, (entity) => entity?.['@id'] === `${canonical}#breadcrumb`) === 1, `Location ${location.slug} must publish exactly one page breadcrumb entity.`);
  expect(countJsonLdEntities(html, (entity) => entity?.['@id'] === `${canonical}#webpage`) === 1, `Location ${location.slug} must publish exactly one WebPage entity.`);
  const locationWebPageSchema = getJsonLdEntities(html).find((entity) => entity?.['@id'] === `${canonical}#webpage`);
  expect(locationWebPageSchema?.name === location.metaTitle, `Location WebPage name drifted from source for ${location.slug}.`);
  expect(locationWebPageSchema?.description === location.description, `Location WebPage description drifted from source for ${location.slug}.`);
  expect(locationWebPageSchema?.url === canonical, `Location WebPage URL drifted for ${location.slug}.`);
  expect(locationWebPageSchema?.mainEntity?.['@id'] === 'https://divineinktattoos.in/#localbusiness', `Location WebPage mainEntity drifted for ${location.slug}.`);
  expect(locationWebPageSchema?.breadcrumb?.['@id'] === `${canonical}#breadcrumb`, `Location WebPage breadcrumb drifted for ${location.slug}.`);
  expect(html.includes('"mainEntity":{"@id":"https://divineinktattoos.in/#localbusiness"}'), `Location WebPage must link the local business entity for ${location.slug}.`);
  const normalizedLocation = html.replace(/\s+/g, '');
  expect(normalizedLocation.includes('"telephone":"+918445702782"'), `Locked phone is missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('"postalCode":"122001"'), `Locked postal code is missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('"addressLocality":"Gurugram"'), `Locked city is missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('cid=13259589601998313340'), `Canonical Maps CID is missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('"propertyID":"GooglePlaceID","value":"ChIJyZWbyoMZDTkRfJeSnn2GA7g"'), `Canonical Google Place ID is missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('"latitude":28.4529') && normalizedLocation.includes('"longitude":77.0508791'), `Locked Maps coordinates are missing or changed on location ${location.slug}.`);
  expect(normalizedLocation.includes('"opens":"00:00"') && normalizedLocation.includes('"closes":"23:59"'), `Locked 24x7 hours are missing or changed on location ${location.slug}.`);
  expect(html.includes('"@type":"FAQPage"'), `FAQ schema missing for location ${location.slug}.`);
}

const adminRoutes = [
  'admin',
  'admin/login',
  'admin/gallery',
  'admin/artists',
  'admin/piercing',
  'admin/services',
  'admin/homepage',
  'admin/reviews',
  'admin/faqs',
  'admin/offers',
  'admin/contact',
  'admin/seo',
];

for (const route of adminRoutes) {
  const pagePath = resolve(dist, ...route.split('/'), 'index.html');
  expect(await exists(pagePath), `Missing generated admin route: /${route}/.`);
  if (!(await exists(pagePath))) continue;

  const html = await read(pagePath);
  expect(
    html.includes('content="noindex, nofollow, noarchive"'),
    `Admin route /${route}/ must stay noindex.`,
  );
  expect(!html.includes('rel="canonical"'), `Admin route /${route}/ must not publish a canonical URL.`);
  expect(!html.includes('application/ld+json'), `Admin route /${route}/ must not publish public structured data.`);
}

const sitemapPath = resolve(dist, 'sitemap.xml');
expect(await exists(sitemapPath), 'dist/sitemap.xml must exist.');
if (await exists(sitemapPath)) {
  const sitemap = await read(sitemapPath);
  const expectedPublicUrls = [
    'https://divineinktattoos.in/',
    'https://divineinktattoos.in/studio/',
    ...servicePages.map((service) => `https://divineinktattoos.in/services/${service.slug}/`),
    ...locationPages.map((location) => `https://divineinktattoos.in/locations/${location.slug}/`),
  ];

  for (const url of expectedPublicUrls) {
    expect(sitemap.includes(`<loc>${url}</loc>`), `Sitemap is missing ${url}.`);
  }

  const urlCount = (sitemap.match(/<url>/g) || []).length;
  expect(urlCount === expectedPublicUrls.length, `Sitemap should contain ${expectedPublicUrls.length} public URLs, found ${urlCount}.`);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(new Set(sitemapUrls).size === sitemapUrls.length, 'Sitemap must not contain duplicate URLs.');
  expect(sitemapUrls.every((url) => /^https:\/\/divineinktattoos\.in\/[^?]*$/.test(url)), 'Sitemap URLs must use the canonical HTTPS host without query strings.');
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
  expect(lastmods.length <= urlCount, 'Sitemap lastmod count cannot exceed the number of public URLs.');
  expect(lastmods.every((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)), 'Sitemap lastmod values must use ISO date format.');
  expect(
    lastmods.every((value) => {
      const timestamp = Date.parse(`${value}T00:00:00Z`);
      return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
    }),
    'Sitemap lastmod values must be valid calendar dates, not just date-shaped strings.',
  );
  const publicUrlBlocks = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  expect(publicUrlBlocks.length === urlCount, 'Sitemap URL block count must match URL count.');
  expect(publicUrlBlocks.every((block) => (block.match(/<loc>/g) || []).length === 1 && (block.match(/<lastmod>/g) || []).length <= 1), 'Each sitemap URL block must contain exactly one loc and at most one lastmod.');
  expect(!sitemap.includes('/admin/'), 'Sitemap must never include admin URLs.');
}

const studioHtmlPath = resolve(dist, 'studio', 'index.html');
expect(await exists(studioHtmlPath), 'dist/studio/index.html must exist.');
if (await exists(studioHtmlPath)) {
  const studioHtml = await read(studioHtmlPath);
  expect(studioHtml.includes('<link rel="canonical" href="https://divineinktattoos.in/studio/">'), 'Studio canonical must be exact.');
  expect(studioHtml.includes('<meta name="description" content="Divine Ink is a tattoo-focused studio in Sector 31, Gurugram, offering custom, fine line, realism, portrait, black and grey, cover-up, sleeve and minimal tattoos plus professional piercing.">'), 'Studio meta description drifted.');
  expect(studioHtml.includes('<meta property="og:title" content="Divine Ink Tattoos &amp; Piercing Studio | Sector 31 Gurgaon">'), 'Studio OG title drifted.');
  expect(studioHtml.includes('<meta property="og:description" content="Divine Ink is a tattoo-focused studio in Sector 31, Gurugram, offering custom, fine line, realism, portrait, black and grey, cover-up, sleeve and minimal tattoos plus professional piercing.">'), 'Studio OG description drifted.');
  expect(studioHtml.includes('<meta name="twitter:title" content="Divine Ink Tattoos &amp; Piercing Studio | Sector 31 Gurgaon">'), 'Studio Twitter title drifted.');
  expect(studioHtml.includes('<meta name="twitter:description" content="Divine Ink is a tattoo-focused studio in Sector 31, Gurugram, offering custom, fine line, realism, portrait, black and grey, cover-up, sleeve and minimal tattoos plus professional piercing.">'), 'Studio Twitter description drifted.');
  expect((studioHtml.match(/<meta name="description"/g) || []).length === 1, 'Studio page must have exactly one meta description.');
  expect((studioHtml.match(/<meta property="og:description"/g) || []).length === 1, 'Studio page must have exactly one OG description.');
  expect((studioHtml.match(/<meta name="twitter:description"/g) || []).length === 1, 'Studio page must have exactly one Twitter description.');
  expect(studioHtml.includes('name="robots" content="index, follow'), 'Studio page must be explicitly indexable.');
  expect(studioHtml.includes('https://divineinktattoos.in/studio/#webpage'), 'Studio WebPage schema link missing.');
  expect(studioHtml.includes('https://divineinktattoos.in/studio/#breadcrumb'), 'Studio breadcrumb schema link missing.');
  expect(countJsonLdEntities(studioHtml, (entity) => entity?.['@id'] === 'https://divineinktattoos.in/studio/#webpage') === 1, 'Studio page must publish exactly one WebPage entity.');
  expect(countJsonLdEntities(studioHtml, (entity) => entity?.['@id'] === 'https://divineinktattoos.in/studio/#breadcrumb') === 1, 'Studio page must publish exactly one breadcrumb entity.');
  const studioWebPageSchema = getJsonLdEntities(studioHtml).find((entity) => entity?.['@id'] === 'https://divineinktattoos.in/studio/#webpage');
  expect(studioWebPageSchema?.name === 'Divine Ink Tattoos & Piercing Studio | Sector 31 Gurgaon', 'Studio WebPage name drifted.');
  expect(studioWebPageSchema?.description === 'Divine Ink is a tattoo-focused studio in Sector 31, Gurugram, offering custom, fine line, realism, portrait, black and grey, cover-up, sleeve and minimal tattoos plus professional piercing.', 'Studio WebPage description drifted.');
  expect(studioWebPageSchema?.url === 'https://divineinktattoos.in/studio/', 'Studio WebPage URL drifted.');
  expect(studioWebPageSchema?.mainEntity?.['@id'] === 'https://divineinktattoos.in/#localbusiness', 'Studio WebPage mainEntity drifted.');
  expect(studioWebPageSchema?.breadcrumb?.['@id'] === 'https://divineinktattoos.in/studio/#breadcrumb', 'Studio WebPage breadcrumb drifted.');
  expect(studioHtml.includes('"breadcrumb":{"@id":"https://divineinktattoos.in/studio/#breadcrumb"}'), 'Studio WebPage must link its breadcrumb entity.');
  expect(studioHtml.includes('"mainEntity":{"@id":"https://divineinktattoos.in/#localbusiness"}'), 'Studio WebPage must link the local business entity.');
  const normalizedStudio = studioHtml.replace(/\s+/g, '');
  expect(normalizedStudio.includes('"telephone":"+918445702782"'), 'Locked phone is missing or changed on studio page.');
  expect(normalizedStudio.includes('"postalCode":"122001"'), 'Locked postal code is missing or changed on studio page.');
  expect(normalizedStudio.includes('"addressLocality":"Gurugram"'), 'Locked city is missing or changed on studio page.');
  expect(normalizedStudio.includes('cid=13259589601998313340'), 'Canonical Maps CID is missing or changed on studio page.');
  expect(normalizedStudio.includes('"latitude":28.4529') && normalizedStudio.includes('"longitude":77.0508791'), 'Locked Maps coordinates are missing or changed on studio page.');
}

const robotsPath = resolve(dist, 'robots.txt');
expect(await exists(robotsPath), 'dist/robots.txt must exist.');
if (await exists(robotsPath)) {
  const robots = await read(robotsPath);
  expect(robots.includes('User-agent: *'), 'robots.txt must declare a user agent rule.');
  expect(robots.includes('Allow: /'), 'robots.txt must allow public crawling.');
  expect(
    robots.includes('Sitemap: https://divineinktattoos.in/sitemap.xml'),
    'robots.txt sitemap reference is missing or changed.',
  );
}

const appSource = await read(resolve('src', 'App.jsx'));
  expect(
    appSource.includes('For accurate directions, contact details, and studio information, use this official website') &&
      appSource.includes('Sector 31, Gurugram studio') &&
      !['sector 38', 'islampur', 'samvit hospital', 'shop no. 9', 'shop no 9'].some((value) => appSource.toLowerCase().includes(value)),
    'Homepage copy must reinforce the official Sector 31 studio without repeating conflicting listing details.',
  );
expect(appSource.includes("const defaultPhone = '918445702782';"), 'Default homepage phone changed unexpectedly.');
expect(appSource.includes("const { homepage: homepageSettings, contact: contactSettings } = usePublicCms();"), 'Contact settings must be connected without enabling other CMS sections.');
expect(appSource.includes('Array.isArray(contactSettings?.phones)'), 'Public site must support multiple managed phone numbers.');
expect(appSource.includes('primaryPhoneDigits'), 'Public site must support a primary managed Call number.');
expect(appSource.includes("contactSettings?.noCallNumbers === true"), 'Call buttons may hide only after an explicit no-call-numbers save.');
expect(appSource.includes('whatsappDigits'), 'Public site must support an independently managed WhatsApp number.');
expect(appSource.includes('<Phone size={18}/> Book on Call'), 'Original Book on Call CTA must remain present.');
expect(appSource.includes('<MessageCircle size={19}/> Book on WhatsApp'), 'Original Book on WhatsApp CTA must remain present.');
expect(!appSource.includes('cmsServices') && !appSource.includes('cmsFaqs') && !appSource.includes('cmsReviews') && !appSource.includes('cmsOffers') && !appSource.includes('useManagedSeo'), 'Only Contact CMS may be newly connected in this change.');
const contactAdminSource = await read(resolve('src', 'admin', 'contact', 'ContactPage.jsx'));
expect(contactAdminSource.includes('Add phone number'), 'Contact admin must allow adding phone numbers.');
expect(contactAdminSource.includes('removePhone'), 'Contact admin must allow removing phone numbers.');
expect(contactAdminSource.includes('setPrimaryPhone'), 'Contact admin must allow choosing the primary number.');
expect(contactAdminSource.includes('settingValue'), 'Contact fields must remain independently editable/removable.');
expect(appSource.includes('Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001'), 'Homepage studio address changed unexpectedly.');
expect(appSource.includes('Open 24x7'), 'Homepage 24x7 availability signal changed unexpectedly.');
expect(appSource.includes('data-embed-id="25698491"'), 'Google Reviews embed ID changed unexpectedly.');
expect(!appSource.includes('Filter portfolio by artist'), 'Public gallery must not show the artist filter button row.');
expect(appSource.includes("['Portfolio', '#gallery']"), 'Top navigation must label the tattoo gallery destination as Portfolio.');
expect(appSource.includes('getPreviewPiercingItems(homepageSettings?.piercingItems)'), 'Public piercing section must remain connected to managed piercing data with built-in fallback.');
expect(appSource.includes('piercingGallery.map(({ id, src, title, images })'), 'Piercing types must render as one grouped public card per type.');
expect(appSource.includes('piercingLightbox.images[piercingLightbox.index]'), 'Grouped piercing photos must be viewable inside the piercing lightbox.');
const piercingDataSource = await read(resolve('src', 'piercingData.js'));
expect(!piercingDataSource.includes('.flatMap((item) => getPiercingImages(item)'), 'Piercing photos must not flatten into separate public category cards.');
const piercingAdminSource = await read(resolve('src', 'admin', 'piercing', 'PiercingPage.jsx'));
expect(piercingAdminSource.includes('Photo removed from the live piercing section.'), 'Saved piercing photo removal must persist immediately.');
const publicCmsSource = await read(resolve('src', 'usePublicCms.js'));
expect(publicCmsSource.includes('divine-ink-piercing-updated-at'), 'Public site must refresh piercing data when another live tab saves piercing changes.');

if (failures.length) {
  console.error('\nRegression check FAILED:\n');
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log(`Regression check passed: ${servicePages.length} service pages, ${locationPages.length} location pages, ${adminRoutes.length} admin routes, sitemap, robots, SEO locks, reviews loader, and critical business details verified.`);
