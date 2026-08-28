import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

let app = execFileSync(
  'git',
  ['show', 'origin/phase-2-gallery-cms:src/App.jsx'],
  { encoding: 'utf8' },
);

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

for (const [name, startMarker, endMarker] of blocks) {
  const start = app.indexOf(startMarker);
  const end = app.indexOf(endMarker, start + 1);
  if (start < 0 || end < 0) throw new Error(`Could not isolate ${name} section`);
  const section = app.slice(start, end);
  const wrapped = `        {showSection('${name}') && (\n          <>\n${section}          </>\n        )}\n\n`;
  app = app.slice(0, start) + wrapped + app.slice(end);
}

app = app.replace(
  '<div><h4>Quick Links</h4><a href="#services">Services</a><a href="#gallery">Gallery</a><a href="#artists">Artists</a><a href="#reviews">Reviews</a></div>',
  '<div><h4>Quick Links</h4><a href="/services/">Services</a><a href="/gallery/">Gallery</a><a href="/artists/">Artists</a><a href="/reviews/">Reviews</a></div>',
);

await writeFile('src/App.jsx', app, 'utf8');
console.log('Corrected multipage App structure from production baseline.');
