// filepath: c:\Users\mathe\Code\audio-forms\frontend\audio-forms\src\components\EvaluationQuestion.js
import React from 'react';

// EvaluationQuestion (controlled)
// Props:
// - question: string
// - value: { "Audio 1": string, "Audio 2": string, "Audio 3": string } (selected value '1'..'5')
// - onChange: function(newValue: object) called when any field changes
export default function EvaluationQuestion({ question, value = null, onChange = () => {} }) {
  const val = value && typeof value === 'object' ? {
    'Audio 1': value['Audio 1'] || '',
    'Audio 2': value['Audio 2'] || '',
    'Audio 3': value['Audio 3'] || '',
  } : { 'Audio 1': '', 'Audio 2': '', 'Audio 3': '' };

  function handleSelect(key, score) {
    const next = { ...val, [key]: String(score) };
    onChange(next);
  }

  const optionStyle = (selected) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 6,
    cursor: 'pointer',
    border: selected ? '2px solid var(--accent, #2563eb)' : '1px solid var(--input-border)',
    background: selected ? 'rgba(37,99,235,0.12)' : 'var(--input-bg)',
    color: 'var(--text)'
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{question}</div>

      {['Audio 1', 'Audio 2', 'Audio 3'].map((key) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 500, fontSize: 12 }}>{key}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
            {[1,2,3,4,5].map((n) => {
              const selected = val[key] === String(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleSelect(key, n)}
                  style={optionStyle(selected)}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

