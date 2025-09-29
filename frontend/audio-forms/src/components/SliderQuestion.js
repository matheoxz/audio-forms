import React from 'react';

// SliderQuestion
// Props:
// - question: string
// - value: number
// - onChange: function(newValue: number)
// - min: number
// - max: number
// - show_scale: boolean (if true, show integer ticks only and hide the range input)
// - min_label: string
// - max_label: string
export default function SliderQuestion({
  question,
  value = 0,
  onChange = () => {},
  min = 0,
  max = 10,
  show_scale = false,
  min_label = '',
  max_label = '',
}) {
  const minNum = Number(min);
  const maxNum = Number(max);
  const safeValue = Number(value);

  const ticks = [];
  for (let i = minNum; i <= maxNum; i++) ticks.push(i);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{question}</div>

      {/** Layout: min label - (slider OR scale buttons) - max label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="slider-label" style={{ textAlign: 'center' }}>{min_label || minNum}</div>

        {/* show_scale: only show clickable integer buttons; otherwise show the range input */}
        {!show_scale ? (
          <input
            className="slider-range"
            type="range"
            min={minNum}
            max={maxNum}
            step={1}
            value={safeValue}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        ) : (
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {ticks.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange(t)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: t === safeValue ? '1px solid var(--button-color)' : '1px solid var(--input-border)',
                    background: t === safeValue ? 'var(--button-color)' : 'transparent',
                    color: t === safeValue ? 'var(--button-bg)' : 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="slider-label" style={{ textAlign: 'center' }}>{max_label || maxNum}</div>
        {/* removed numeric value display on purpose per request */}
      </div>
    </div>
  );
}
