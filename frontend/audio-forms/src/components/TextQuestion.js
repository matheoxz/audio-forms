import React from 'react';

// TextQuestion (controlled version)
// Props:
// - question: string
// - value: { "Audio 1": string, "Audio 2": string, "Audio 3": string } (optional)
// - onChange: function(newValue: object) called with the JSON mapping when any field changes
// - placeholder?: string
export default function TextQuestion({ question, value = null, onChange = () => {}, placeholder = '' }) {
  const INCOMPREENSIVEL = 'Incompreensível';

  // Ensure value object exists
  const val = value && typeof value === 'object' ? {
    'Audio 1': value['Audio 1'] || '',
    'Audio 2': value['Audio 2'] || '',
    'Audio 3': value['Audio 3'] || '',
  } : { 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' };

  function handleTextChange(key, next) {
    const nextPayload = { ...val, [key]: next };
    onChange(nextPayload);
  }

  function toggleIncompr(key) {
    const currently = val[key] === INCOMPREENSIVEL;
    const nextPayload = { ...val, [key]: currently ? '' : INCOMPREENSIVEL };
    onChange(nextPayload);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{question}</div>

      {['Audio 1', 'Audio 2', 'Audio 3'].map((key) => {
        const isIncompr = val[key] === INCOMPREENSIVEL;
        return (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={{  fontWeight: 500, fontSize: 12  }}>{key}</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 6 }}>
              <textarea
                rows={2}
                style={{ flex: 1, background: 'var(--input-bg)', color: 'var(--text)', border: '1px solid var(--input-border)', padding: 8, borderRadius: 6 }}
                value={isIncompr ? INCOMPREENSIVEL : (val[key] || '')}
                onChange={(e) => handleTextChange(key, e.target.value)}
                placeholder={placeholder || `Escreva o que é dito em ${key}`}
                disabled={isIncompr}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={isIncompr} onChange={() => toggleIncompr(key)} />
                <span>{INCOMPREENSIVEL}</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
