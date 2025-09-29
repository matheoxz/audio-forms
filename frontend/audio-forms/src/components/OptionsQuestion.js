import React from 'react';

// OptionsQuestion
// Props:
// - question: string
// - options: array of strings or { value, label }
// - value: selected value (string)
// - onChange: function(newValue: string)
export default function OptionsQuestion({ question, options = [], value = '', onChange = () => {} }) {
  const normalized = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{question}</div>
      {normalized.map((opt) => (
        <label key={opt.value} style={{ marginRight: 16, display: 'inline-flex', alignItems: 'center' }}>
          <input
            type="radio"
            name={question}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginRight: 6 }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

