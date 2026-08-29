import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { locationPages } from '../src/locationData.js';
import { servicePages } from '../src/serviceData.js';

const dist = resolve('dist');
const failures = [];

function fail(message) {
  failures.push(message);
}

function expect(condition, message) {
  if (!condition) fail(message);
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
    for (const relatedSlug of item.related || []) {
      expect(slugs.has(relatedSlug), `${itemLabel} ${item.slug} references missing related slug ${relatedSlug}.`);
      expect(relatedSlug !== item.slug, `${itemLabel} ${item.slug} must not relate to itself.`);
    }
  }
}

expectUnique(servicePages.map((item) => item.slug), 'Service slugs');
expectUnique(locationPages.map((item) => item.slug), 'Location slugs');
validateRelated(servicePages, 'Service');
validateRelated(locationPages, 'Location');

const homepagePath = resolve(dist, 'index.html');
expect(await exists(homepagePath), 'dist/index.html must exist after build.');

if (await exists(homepagePath)) {
  const homepage = await read(homepagePath);
  expect(
    homepage.includes('<title>Tattoo Studio in Gurgaon (Gurugram) | Divine Ink Tattoos</title>'),
    'Homepage SEO title changed unexpectedly.',
  );
  expect(
    homepage.includes('<link rel="canonical" href="https://divineinktattoos.in/"'),
    'Homepage canonical URL is missing or changed.',
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
  const expectedTitle = service.slug === 'fine-line-tattoos'
    ? 'Fine Line Tattoo Artist in Gurgaon (Gurugram) | Divine Ink'
    : service.metaTitle;

  expect(html.includes(`<title>${expectedTitle}</title>`), `Wrong SEO title for service ${service.slug}.`);
  expect(html.includes(`rel="canonical" href="${canonical}"`), `Wrong canonical for service ${service.slug}.`);
  expect(!html.includes('content="noindex, nofollow, noarchive"'), `Public service ${service.slug} must remain indexable.`);
  expect(html.includes('"@type":"Service"'), `Service schema missing for ${service.slug}.`);
}

for (const location of locationPages) {
  const pagePath = resolve(dist, 'locations', location.slug, 'index.html');
  expect(await exists(pagePath), `Missing generated location page: ${location.slug}.`);
  if (!(await exists(pagePath))) continue;

  const html = await read(pagePath);
  const canonical = `https://divineinktattoos.in/locations/${location.slug}/`;

  expect(html.includes(`<title>${location.metaTitle}</title>`), `Wrong SEO title for location ${location.slug}.`);
  expect(html.includes(`rel="canonical" href="${canonical}"`), `Wrong canonical for location ${location.slug}.`);
  expect(!html.includes('content="noindex, nofollow, noarchive"'), `Public location ${location.slug} must remain indexable.`);
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
    ...servicePages.map((service) => `https://divineinktattoos.in/services/${service.slug}/`),
    ...locationPages.map((location) => `https://divineinktattoos.in/locations/${location.slug}/`),
  ];

  for (const url of expectedPublicUrls) {
    expect(sitemap.includes(`<loc>${url}</loc>`), `Sitemap is missing ${url}.`);
  }

  const urlCount = (sitemap.match(/<url>/g) || []).length;
  expect(urlCount === expectedPublicUrls.length, `Sitemap should contain ${expectedPublicUrls.length} public URLs, found ${urlCount}.`);
  expect(!sitemap.includes('/admin/'), 'Sitemap must never include admin URLs.');
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
expect(appSource.includes("const defaultPhone = '918445702782';"), 'Homepage phone constant changed unexpectedly.');
expect(appSource.includes('Shop No. 155, Basement, Near Apollo Pharmacy, Main HUDA Market, Sector 31, Gurugram, Haryana 122001'), 'Homepage studio address changed unexpectedly.');
expect(appSource.includes('Open 24x7'), 'Homepage 24x7 availability signal changed unexpectedly.');
expect(appSource.includes('data-embed-id="25698491"'), 'Google Reviews embed ID changed unexpectedly.');
expect(!appSource.includes('Filter portfolio by artist'), 'Public gallery must not show the artist filter button row.');
expect(appSource.includes("['Portfolio', '#gallery']"), 'Top navigation must label the tattoo gallery destination as Portfolio.');
expect(appSource.includes('getPreviewPiercingItems(homepageSettings?.piercingItems)'), 'Public piercing section must remain connected to managed piercing data with built-in fallback.');
expect(appSource.includes('useManagedSeo(seoSettings)'), 'Homepage SEO admin settings must be connected to the public site.');
expect(appSource.includes('cmsFaqs.length'), 'FAQ admin content must be connected to the public FAQ section.');
expect(appSource.includes('activeOffers.map'), 'Offers admin content must be connected to the public site.');
expect(appSource.includes('managedReviews.map'), 'Reviews admin content must be connected to the public site.');
expect(appSource.includes('contactSettings?.phone'), 'Contact admin settings must be connected to public contact details.');
expect(appSource.includes('homepageServices.map'), 'Services admin content must be connected to homepage service cards.');

const servicePageSource = await read(resolve('src', 'ServicePage.jsx'));
expect(servicePageSource.includes('usePublicCms()'), 'Service pages must read managed CMS service data.');
expect(servicePageSource.includes('managed?.pricing'), 'Service page pricing must be connected to admin service data.');
expect(servicePageSource.includes('normalizeServiceFaqs'), 'Service page FAQs must be connected to admin service data.');

const cmsLoaderSource = await read(resolve('src', 'usePublicCms.js'));
expect(cmsLoaderSource.includes("collection(db, 'reviews')"), 'Public CMS loader must load published reviews.');
expect(cmsLoaderSource.includes("collection(db, 'offers')"), 'Public CMS loader must load active offers.');
expect(cmsLoaderSource.includes('admin-managed-seo-schema'), 'Managed SEO schema must be isolated from the built-in LocalBusiness schema.');
expect(cmsLoaderSource.includes("normalized.includes('noindex')"), 'Managed SEO must block accidental noindex publishing.');
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
