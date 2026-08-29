import { readFile, writeFile } from 'node:fs/promises';

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) throw new Error(`Missing expected source for ${label}`);
  return source.replace(search, replacement);
}

let app = await readFile('src/App.jsx', 'utf8');
app = replaceRequired(
  app,
  `  const phoneDisplay = String(contactSettings?.phone || defaultPhoneDisplay).trim();\n  const phone = String(contactSettings?.phone || defaultPhone).replace(/\\D/g, '') || defaultPhone;`,
  `  const phoneRecords = Array.isArray(contactSettings?.phones)\n    ? contactSettings.phones\n        .filter((item) => item && typeof item === 'object' && String(item.number || '').trim())\n        .map((item, index) => ({\n          id: item.id || \`phone-\${index}\`,\n          number: String(item.number || '').trim(),\n          label: String(item.label || (index === 0 ? 'Primary' : 'Phone')).trim(),\n          primary: Boolean(item.primary),\n        }))\n    : [{ id: 'legacy-primary', number: String(contactSettings?.phone || defaultPhoneDisplay).trim(), label: 'Primary', primary: true }];\n  const primaryPhoneRecord = phoneRecords.find((item) => item.primary) || phoneRecords[0] || null;\n  const phoneDisplay = primaryPhoneRecord?.number || '';\n  const phone = phoneDisplay.replace(/\\D/g, '');`,
  'managed phone records',
);
app = replaceRequired(
  app,
  `<a className="btn primary" href={\`tel:+\${phone}\`}><Phone size={18}/> Book on Call</a>`,
  `{phone && <a className="btn primary" href={\`tel:+\${phone}\`}><Phone size={18}/> Book on Call</a>}`,
  'hero call conditional',
);
app = replaceRequired(
  app,
  `<a href={\`tel:+\${phone}\`}><Phone/> {phoneDisplay}</a>`,
  `{phoneRecords.map((item) => {\n                  const digits = item.number.replace(/\\D/g, '');\n                  return digits ? <a key={item.id} href={\`tel:+\${digits}\`}><Phone/> {item.label ? \`\${item.label}: \` : ''}{item.number}</a> : null;\n                })}`,
  'contact phone list',
);
app = replaceRequired(
  app,
  `<div><h4>Contact</h4><a href={\`tel:+\${phone}\`}>{phoneDisplay}</a><a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>`,
  `<div><h4>Contact</h4>{phoneRecords.map((item) => { const digits = item.number.replace(/\\D/g, ''); return digits ? <a key={item.id} href={\`tel:+\${digits}\`}>{item.number}</a> : null; })}<a href="mailto:divinetattoostudio1@gmail.com">divinetattoostudio1@gmail.com</a><a href={mapLink} target="_blank" rel="noreferrer">Get Directions</a></div>`,
  'footer phone list',
);
await writeFile('src/App.jsx', app, 'utf8');

let verify = await readFile('scripts/verify-production-build.mjs', 'utf8');
verify = replaceRequired(
  verify,
  `expect(appSource.includes('contactSettings?.phone'), 'Contact admin settings must be connected to public contact details.');`,
  `expect(appSource.includes('contactSettings?.phone'), 'Legacy contact phone must remain supported as a fallback.');\nexpect(appSource.includes('contactSettings?.phones'), 'Public contact area must support multiple managed phone numbers.');\nconst contactAdminSource = await read(resolve('src', 'admin', 'contact', 'ContactPage.jsx'));\nexpect(contactAdminSource.includes('Add phone number'), 'Contact admin must let the owner add phone numbers individually.');\nexpect(contactAdminSource.includes('removePhone'), 'Contact admin must let the owner remove phone numbers individually.');\nexpect(contactAdminSource.includes('setPrimaryPhone'), 'Contact admin must let the owner choose the primary call number.');`,
  'contact regression checks',
);
await writeFile('scripts/verify-production-build.mjs', verify, 'utf8');
