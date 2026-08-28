import { readFile, writeFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const write = (path, content) => writeFile(path, content, 'utf8');

const sitePages = `export const mainPages = [
  {
    slug: 'about',
    label: 'About',
    view: 'about',
    metaTitle: 'About Divine Ink Tattoos | Tattoo Studio in Gurugram',
    description: 'Learn about Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram, including the studio approach, hygiene-focused preparation and custom consultation process.',
  },
  {
    slug: 'services',
    label: 'Services',
    view: 'services',
    metaTitle: 'Tattoo & Piercing Services in Gurugram | Divine Ink Tattoos',
    description: 'Explore tattoo and piercing services at Divine Ink in Sector 31, Gurugram, including custom tattoos, cover-ups, portraits, minimal tattoos and professional piercing.',
  },
  {
    slug: 'artists',
    label: 'Artists',
    view: 'artists',
    metaTitle: 'Tattoo Artists in Gurugram | Divine Ink Tattoos',
    description: 'Meet the tattoo artists at Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram and explore portfolio work by artist.',
  },
  {
    slug: 'gallery',
    label: 'Gallery',
    view: 'gallery',
    metaTitle: 'Tattoo Gallery & Portfolio | Divine Ink Tattoos Gurugram',
    description: 'Browse the Divine Ink tattoo portfolio featuring portrait, realism, religious, minimal, floral, geometric and colour tattoo work.',
  },
  {
    slug: 'piercing',
    label: 'Piercing',
    view: 'piercing',
    metaTitle: 'Professional Piercing in Gurugram | Divine Ink Tattoos',
    description: 'Explore professional piercing services at Divine Ink in Sector 31, Gurugram, including lobe, helix, septum, nose, belly, eyebrow, lip and tongue piercing.',
  },
  {
    slug: 'reviews',
    label: 'Reviews',
    view: 'reviews',
    metaTitle: 'Google Reviews | Divine Ink Tattoos Gurugram',
    description: 'Read live Google reviews for Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram.',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    view: 'faq',
    metaTitle: 'Tattoo & Piercing FAQs | Divine Ink Tattoos Gurugram',
    description: 'Read common tattoo and piercing questions about pricing, custom designs, cover-ups, appointments, hygiene and aftercare at Divine Ink in Gurugram.',
  },
  {
    slug: 'contact',
    label: 'Contact',
    view: 'contact',
    metaTitle: 'Contact Divine Ink Tattoos | Sector 31 Gurugram',
    description: 'Contact Divine Ink Tattoos & Piercing Studio in Sector 31, Gurugram for tattoo or piercing enquiries, appointments, directions and consultation.',
  },
];

export const mainPageMap = new Map(mainPages.map((page) => [page.slug, page]));
`;
await write('src/sitePages.js', sitePages);

let app = await read('src/App.jsx');
app = app.replace("import { usePublicCms } from './usePublicCms.js';", "import { usePublicCms } from './usePublicCms.js';\nimport { mainPages } from './sitePages.js';");
app = app.replace('function App() {', "function App({ view = 'all' }) {");
app = app.replace("  const [activeArtist, setActiveArtist] = useState('All Artists');", "  const requestedArtist = new URLSearchParams(window.location.search).get('artist');\n  const [activeArtist, setActiveArtist] = useState(requestedArtist || 'All Artists');");
app = app.replace(
  "  const closeMenu = () => setMenuOpen(false);",
  "  const closeMenu = () => setMenuOpen(false);\n  const showSection = (section) => view === 'all' || view === section;\n  const headerNavigation = [\n    { label: 'Home', path: '/' },\n    ...mainPages.filter((page) => page.slug !== 'faq').map((page) => ({ label: page.label, path: `/${page.slug}/` })),\n  ];",
);

const oldPortfolio = `  const viewArtistPortfolio = (artist) => {
    setActiveArtist(artist);
    setActiveFilter('All');
    window.requestAnimationFrame(() => {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };`;
const newPortfolio = `  const viewArtistPortfolio = (artist) => {
    setActiveArtist(artist);
    setActiveFilter('All');
    window.requestAnimationFrame(() => {
      const gallerySection = document.getElementById('gallery');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      window.location.assign(\`/gallery/?artist=\${encodeURIComponent(artist)}\`);
    });
  };`;
if (!app.includes(oldPortfolio)) throw new Error('Portfolio navigation block not found');
app = app.replace(oldPortfolio, newPortfolio);

const oldNav = `        <a className="brand" href="#home" onClick={closeMenu} aria-label="Divine Ink home">
          <img src={logo} alt="Divine Ink Tattoos & Piercing Studio logo" />
        </a>
        <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          {['Home','About','Services','Artists','Gallery','Piercing','Reviews','Contact'].map((item) => (
            <a key={item} href={\`#\${item.toLowerCase()}\`} onClick={closeMenu}>{item}</a>
          ))}`;
const newNav = `        <a className="brand" href="/" onClick={closeMenu} aria-label="Divine Ink home">
          <img src={logo} alt="Divine Ink Tattoos & Piercing Studio logo" />
        </a>
        <nav id="main-navigation" className={menuOpen ? 'nav open' : 'nav'} aria-label="Main navigation">
          {headerNavigation.map((item) => (
            <a key={item.label} href={item.path} onClick={closeMenu}>{item.label}</a>
          ))}`;
if (!app.includes(oldNav)) throw new Error('Homepage navigation block not found');
app = app.replace(oldNav, newNav);

const blocks = [
  ['home', '        <section id="home"', '        <section id="about"'],
  ['about', '        <section id="about"', '        <section id="services"'],
  ['services', '        <section id="services"', '        <section id="artists"'],
  ['artists', '        <section id="artists"', '        <section id="gallery"'],
  ['gallery', '        <section id="gallery"', '        <section id="piercing"'],
  ['piercing', '        <section id="piercing"', '        <section id="reviews"'],
  ['reviews', '        <section id="reviews"', '        <section id="faq"'],
  ['faq', '        <section id="faq"', '        <section id="contact"'],
  ['contact', '        <section id="contact"', '      </main>'],
];
for (const [name, startMarker, endMarker] of [...blocks].reverse()) {
  const start = app.indexOf(startMarker);
  const end = app.indexOf(endMarker, start + 1);
  if (start < 0 || end < 0) throw new Error(`Could not isolate ${name} section`);
  const section = app.slice(start, end);
  const wrapped = `        {showSection('${name}') && (\n${section}        )}\n\n`;
  app = app.slice(0, start) + wrapped + app.slice(end);
}

app = app.replace(
  '<div><h4>Quick Links</h4><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#artists">Artists</a><a href="#reviews">Reviews</a></div>',
  '<div><h4>Quick Links</h4><a href="/services/">Services</a><a href="/gallery/">Gallery</a><a href="/artists/">Artists</a><a href="/reviews/">Reviews</a></div>',
);
await write('src/App.jsx', app);

let main = await read('src/main.jsx');
main = main.replace("import './gallerySliderEffect.js';", "import './gallerySliderEffect.js';\nimport { mainPages } from './sitePages.js';");
main = main.replace(
  '          <Route path="/" element={<App />} />',
  '          <Route path="/" element={<App />} />\n          {mainPages.map((page) => (\n            <Route key={page.slug} path={`/${page.slug}/`} element={<App view={page.view} />} />\n          ))}',
);
await write('src/main.jsx', main);

const generator = `import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { mainPages } from '../src/sitePages.js';

const distDirectory = resolve('dist');
const homepageHtml = await readFile(resolve(distDirectory, 'index.html'), 'utf8');
const socialImage = 'https://divineinktattoos.in/divine-ink-logo.png';

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(\`<meta(?=[^>]*\${attribute}=["']\${key}["'])(?=[^>]*content=["'][^"']*["'])[^>]*>\`, 'i');
  return html.replace(pattern, \`<meta \${attribute}="\${key}" content="\${escapeAttribute(content)}">\`);
}

for (const page of mainPages) {
  const canonical = \`https://divineinktattoos.in/\${page.slug}/\`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://divineinktattoos.in/' },
      { '@type': 'ListItem', position: 2, name: page.label, item: canonical },
    ],
  };

  let html = homepageHtml
    .replace(/<title>[\\s\\S]*?<\\/title>/i, \`<title>\${page.metaTitle}</title>\`)
    .replace(/<link rel="canonical" href="[^"]*"\\s*\\/?>/i, \`<link rel="canonical" href="\${canonical}">\`);

  html = replaceMeta(html, 'name', 'description', page.description);
  html = replaceMeta(html, 'property', 'og:title', page.metaTitle);
  html = replaceMeta(html, 'property', 'og:description', page.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:type', 'website');
  html = replaceMeta(html, 'property', 'og:image', socialImage);
  html = replaceMeta(html, 'name', 'twitter:card', 'summary');
  html = replaceMeta(html, 'name', 'twitter:title', page.metaTitle);
  html = replaceMeta(html, 'name', 'twitter:description', page.description);
  html = replaceMeta(html, 'name', 'twitter:image', socialImage);
  html = html.replace('</head>', \`<script type="application/ld+json">\${JSON.stringify(schema).replaceAll('<', '\\\\u003c')}</script></head>\`);

  const pageDirectory = resolve(distDirectory, page.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(resolve(pageDirectory, 'index.html'), html);
}

console.log(\`Generated \${mainPages.length} top-level page HTML entries.\`);
`;
await write('scripts/generate-main-page-html.mjs', generator);

const packageJson = JSON.parse(await read('package.json'));
const build = packageJson.scripts.build;
if (!build.includes('vite build && ')) throw new Error('Unexpected build script');
packageJson.scripts.build = build.replace('vite build && ', 'vite build && node scripts/generate-main-page-html.mjs && ');
await write('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);

let sitemap = await read('scripts/generate-sitemap.mjs');
sitemap = sitemap.replace("import { servicePages } from '../src/serviceData.js';", "import { servicePages } from '../src/serviceData.js';\nimport { mainPages } from '../src/sitePages.js';");
sitemap = sitemap.replace("const serviceLastmod = latestGitDate([", "const mainPageLastmod = latestGitDate([\n  'src/App.jsx',\n  'src/main.jsx',\n  'src/sitePages.js',\n  'scripts/generate-main-page-html.mjs',\n]);\n\nconst serviceLastmod = latestGitDate([");
sitemap = sitemap.replace("  urlEntry('/', homepageLastmod),\n  ...servicePages.map", "  urlEntry('/', homepageLastmod),\n  ...mainPages.map((page) => urlEntry(`/${page.slug}/`, mainPageLastmod)),\n  ...servicePages.map");
await write('scripts/generate-sitemap.mjs', sitemap);

let verify = await read('scripts/verify-production-build.mjs');
verify = verify.replace("import { servicePages } from '../src/serviceData.js';", "import { servicePages } from '../src/serviceData.js';\nimport { mainPages } from '../src/sitePages.js';");
const pageChecks = `for (const page of mainPages) {
  const pagePath = resolve(dist, page.slug, 'index.html');
  expect(await exists(pagePath), \`Missing generated top-level page: /\${page.slug}/.\`);
  if (!(await exists(pagePath))) continue;

  const html = await read(pagePath);
  const canonical = \`https://divineinktattoos.in/\${page.slug}/\`;
  expect(html.includes(\`<title>\${page.metaTitle}</title>\`), \`Wrong SEO title for /\${page.slug}/.\`);
  expect(html.includes(\`rel="canonical" href="\${canonical}"\`), \`Wrong canonical for /\${page.slug}/.\`);
  expect(!html.includes('content="noindex, nofollow, noarchive"'), \`Public page /\${page.slug}/ must remain indexable.\`);
}

`;
verify = verify.replace('for (const service of servicePages) {', pageChecks + 'for (const service of servicePages) {');
verify = verify.replace("    'https://divineinktattoos.in/',\n    ...servicePages.map", "    'https://divineinktattoos.in/',\n    ...mainPages.map((page) => `https://divineinktattoos.in/${page.slug}/`),\n    ...servicePages.map");
verify = verify.replace(
  'console.log(`Regression check passed: ${servicePages.length} service pages, ${locationPages.length} location pages, ${adminRoutes.length} admin routes, sitemap, robots, SEO locks, reviews loader, and critical business details verified.`);',
  'console.log(`Regression check passed: ${mainPages.length} top-level pages, ${servicePages.length} service pages, ${locationPages.length} location pages, ${adminRoutes.length} admin routes, sitemap, robots, SEO locks, reviews loader, and critical business details verified.`);',
);
await write('scripts/verify-production-build.mjs', verify);

console.log('Multipage preview source changes prepared.');
