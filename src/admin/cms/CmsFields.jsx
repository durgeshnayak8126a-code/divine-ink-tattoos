export function initialValues(fields, record = null) {
  return Object.fromEntries(fields.map((field) => [
    field.name,
    record?.[field.name] ?? field.defaultValue ?? (field.type === 'checkbox' ? false : ''),
  ]));
}

export function serializeValues(fields, values) {
  return Object.fromEntries(fields.map((field) => {
    let value = values[field.name];
    if (field.type === 'json') {
      try {
        value = JSON.parse(value || (Array.isArray(field.defaultValue) ? '[]' : '{}'));
      } catch {
        throw new Error(`${field.label} must contain valid JSON.`);
      }
    } else if (field.type === 'number') {
      value = Number(value);
      if (!Number.isFinite(value)) throw new Error(`${field.label} must be a number.`);
    } else if (typeof value === 'string') {
      value = value.trim();
    }
    if (field.required && (value === '' || value == null)) {
      throw new Error(`${field.label} is required.`);
    }
    return [field.name, value];
  }));
}

export default function CmsFields({ fields, values, onChange }) {
  return (
    <div className="cms-fields-grid">
      {fields.map((field) => {
        const value = values[field.name];
        if (field.type === 'checkbox') {
          return (
            <label className="cms-checkbox" key={field.name}>
              <input
                checked={Boolean(value)}
                name={field.name}
                onChange={onChange}
                type="checkbox"
              />
              {field.label}
            </label>
          );
        }
        const common = {
          maxLength: field.maxLength,
          min: field.min,
          max: field.max,
          name: field.name,
          onChange,
          required: field.required,
          value: field.type === 'json' && typeof value !== 'string'
            ? JSON.stringify(value, null, 2)
            : value,
        };
        return (
          <label className={field.type === 'textarea' || field.type === 'json' ? 'cms-full-field' : ''} key={field.name}>
            <span>{field.label}{field.required ? ' *' : ''}</span>
            {field.type === 'textarea' || field.type === 'json'
              ? <textarea {...common} rows={field.type === 'json' ? 7 : 4} />
              : <input {...common} type={field.type || 'text'} />}
          </label>
        );
      })}
    </div>
  );
}
