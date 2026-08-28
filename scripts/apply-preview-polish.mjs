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
  return replaceRequired(
    source,
    `{['Home','About','Services','Artists','Gallery','Piercing','Reviews','Contact'].map((item) => (\n            <a key={item} href={\`#\${item.toLowerCase()}\`} onClick={closeMenu}>{item}</a>\n          ))}`,
    `{[\n            ['Home', '#home'],\n            ['About', '#about'],\n            ['Services', '#services'],\n            ['Artists', '#artists'],\n            ['Portfolio', '#gallery'],\n            ['Piercing', '#piercing'],\n            ['Reviews', '#reviews'],\n            ['Contact', '#contact'],\n          ].map(([label, href]) => (\n            <a key={label} href={href} onClick={closeMenu}>{label}</a>\n          ))}`,
    'top navigation Gallery to Portfolio alignment',
  );
});

await update('src/admin/piercing/PiercingPage.jsx', (source) => {
  return replaceRequired(
    source,
    `        <div style={{ marginTop: 28 }}>\n          <button className="admin-primary-button" disabled={saving} onClick={saveAll} type="button">\n            {saving ? 'Uploading and saving…' : 'Save piercing changes'}\n          </button>\n        </div>`,
    `        <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>\n          <button className="admin-primary-button" disabled={saving} onClick={saveAll} type="button">\n            {saving ? 'Uploading and saving…' : 'Save piercing changes'}\n          </button>\n          {previewMode && (\n            <a className="admin-secondary-button" href="/#piercing" target="_blank" rel="noreferrer">\n              View piercing on preview website\n            </a>\n          )}\n        </div>`,
    'preview piercing view button',
  );
});

await update('scripts/verify-production-build.mjs', (source) => {
  const needle = "expect(!appSource.includes('Filter portfolio by artist'), 'Public gallery must not show the artist filter button row.');";
  const replacement = `${needle}\nexpect(appSource.includes("['Portfolio', '#gallery']"), 'Top navigation must label the tattoo gallery destination as Portfolio.');`;
  return replaceRequired(source, needle, replacement, 'Portfolio navigation regression check');
});

console.log('Final preview polish applied.');
