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
    "import { getPublicPiercingGallery } from './piercingData.js';",
    "import { getPreviewPiercingItems, getPublicPiercingGallery } from './piercingData.js';",
    'piercing data import',
  );
  app = replaceRequired(
    app,
    "  const piercingGallery = getPublicPiercingGallery(homepageSettings?.piercingItems);",
    "  const managedPiercingItems = getPreviewPiercingItems(homepageSettings?.piercingItems);\n  const piercingGallery = getPublicPiercingGallery(managedPiercingItems);",
    'preview piercing data binding',
  );
  app = replaceRequired(
    app,
    "  const artistFilters = ['All Artists', ...visibleArtists.map((artist) => artist.name)];\n",
    '',
    'artist filter data row',
  );
  app = replaceRequired(
    app,
    `          <div className="filter-row" aria-label="Filter portfolio by artist">\n            {artistFilters.map((artist) => <button key={artist} className={activeArtist === artist ? 'active' : ''} onClick={() => setActiveArtist(artist)}>{artist}</button>)}\n          </div>\n`,
    '',
    'visible artist filter buttons',
  );
  app = replaceRequired(
    app,
    "{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}",
    "{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'active' : ''} onClick={() => { setActiveFilter(filter); setActiveArtist('All Artists'); }}>{filter}</button>)}",
    'category filter reset',
  );
  app = replaceRequired(
    app,
    "{piercingGallery.map(([src,title]) => <figure key={title}><img src={src} alt={title} loading=\"lazy\"/><figcaption>{title}</figcaption></figure>)}",
    "{piercingGallery.map(({ id, src, title }) => <figure key={id}><img src={src} alt={title} loading=\"lazy\"/><figcaption>{title}</figcaption></figure>)}",
    'multi-photo public piercing rendering',
  );
  return app;
});

await update('scripts/verify-production-build.mjs', (source) => {
  const needle = "expect(appSource.includes('data-embed-id=\"25698491\"'), 'Google Reviews embed ID changed unexpectedly.');";
  const replacement = `${needle}\nexpect(appSource.includes('getPreviewPiercingItems(homepageSettings?.piercingItems)'), 'Piercing preview/managed data binding is missing.');\nexpect(!appSource.includes('Filter portfolio by artist'), 'Public gallery must not show the artist filter button row.');`;
  return replaceRequired(source, needle, replacement, 'regression protections');
});

console.log('Piercing multi-photo and portfolio filter preview patch applied.');
