import React from 'react';

// MultiOptionsQuestion
// Props:
// - question: string
// - options: array of strings or { value, label }
// - value: array of selected values
// - onChange: function(newValues: array)
export default function MultiOptionsQuestion({ question, options = [], value = [], onChange = () => {} }) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

  function toggle(val) {
    const exists = value.includes(val);
    const next = exists ? value.filter((v) => v !== val) : [...value, val];
    onChange(next);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{question}</div>
      {normalized.map((opt) => (
        <label key={opt.value} style={{ marginRight: 12, display: 'inline-flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            value={opt.value}
            checked={value.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            style={{ marginRight: 6 }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

