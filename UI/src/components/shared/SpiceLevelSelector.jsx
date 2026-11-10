import React from 'react';

/**
 * SpiceLevelSelector
 * Reusable selector for spice levels: None / Mild / Spicy.
 * Uses exact bespoke icons from assets.
 */
export default function SpiceLevelSelector({
  value = 'none',
  onChange,
  label = 'Spice Level',
  required = false,
  optional = false,
  disabled = false,
  className = '',
  style = {},
}) {
  const options = [
    {
      id: 'none',
      label: 'None',
      hint: 'No chilli heat',
      icon: (
        <img
          src="/assets/no-spice.png"
          alt="None"
          style={{ width: '22px', height: '22px', objectFit: 'contain', display: 'block' }}
        />
      ),
    },
    {
      id: 'mild',
      label: 'Mild',
      hint: 'Gentle warmth',
      icon: (
        <img
          src="/assets/spice-mild.png"
          alt="Mild"
          style={{ width: '22px', height: '22px', objectFit: 'contain', display: 'block' }}
        />
      ),
    },
    {
      id: 'medium',
      label: 'Medium',
      hint: 'Moderate heat',
      icon: (
        <img
          src="/assets/spice-spicy.png"
          alt="Medium"
          style={{ width: '22px', height: '22px', objectFit: 'contain', display: 'block' }}
        />
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 'var(--spacing-sm, 10px)', width: '100%', ...style }} className={`spice-level-container ${className}`}>
      {label && (
        <label
          className="spice-level-label"
          style={{
            display: 'block',
            fontSize: 'var(--font-size-sm, 0.75rem)',
            fontWeight: 600,
            color: 'var(--color-text, #1e1b16)',
            marginBottom: '4px',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          {optional && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', fontWeight: 400, marginLeft: '4px' }}>(opt)</span>}
        </label>
      )}

      <div
        className="spice-level-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {options.map((opt) => {
          const isSelected = value === opt.id || (opt.id === 'medium' && value === 'spicy');
          return (
            <button
              key={opt.id}
              type="button"
              className="spice-level-btn"
              disabled={disabled}
              onClick={() => onChange && onChange(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 6px',
                borderRadius: '4px',
                border: isSelected
                  ? '1.5px solid var(--color-primary, #2e3b12)'
                  : '1px solid var(--color-border, #ece7de)',
                backgroundColor: isSelected
                  ? 'var(--color-primary-light, #f1f6ec)'
                  : 'var(--color-bg, #fbf9f5)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: 'none',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <span className="spice-level-icon" style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3px' }}>
                {opt.icon}
              </span>
              <span
                className="spice-level-title"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? 'var(--color-primary, #2e3b12)' : 'var(--color-text, #1e1b16)',
                }}
              >
                {opt.label}
              </span>
              <span
                className="spice-level-hint"
                style={{
                  fontSize: '0.64rem',
                  color: isSelected ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
                  marginTop: '1px',
                }}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
