from pathlib import Path

app = Path('src/App.jsx')
s = app.read_text()
old = """  const phoneRecords = Array.isArray(contactSettings?.phones)
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
      : [{ id: 'default-primary', number: defaultPhoneDisplay, label: 'Primary', primary: true }];"""
new = """  const managedPhoneRecords = Array.isArray(contactSettings?.phones)
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
        : [{ id: 'default-primary', number: defaultPhoneDisplay, label: 'Primary', primary: true }];"""
if old not in s:
    raise SystemExit('Expected phoneRecords block not found')
app.write_text(s.replace(old, new, 1))

contact = Path('src/admin/contact/ContactPage.jsx')
c = contact.read_text()
old = """        phone: primary?.number || '',
        whatsapp: values.whatsapp.trim(),"""
new = """        phone: primary?.number || '',
        noCallNumbers: phones.length === 0,
        whatsapp: values.whatsapp.trim(),"""
if old not in c:
    raise SystemExit('Expected contact save payload not found')
contact.write_text(c.replace(old, new, 1))

verify = Path('scripts/verify-production-build.mjs')
v = verify.read_text()
anchor = "expect(appSource.includes('primaryPhoneDigits'), 'Public site must support a primary managed Call number.');\n"
extra = "expect(appSource.includes(\"contactSettings?.noCallNumbers === true\"), 'Call buttons may hide only after an explicit no-call-numbers save.');\n"
if anchor not in v:
    raise SystemExit('Expected regression anchor not found')
if extra not in v:
    v = v.replace(anchor, anchor + extra, 1)
verify.write_text(v)
