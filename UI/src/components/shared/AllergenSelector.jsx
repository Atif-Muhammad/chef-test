import React from 'react';

/**
 * AllergenSelector
 * Clickable chips for selecting canonical master allergens (matched against client profiles).
 */
export default function AllergenSelector({
  masterAllergens = [],
  selectedAllergens = [],
  onToggleAllergen,
  label = 'Canonical Allergens',
  required = false,
  optional = false,
  helperText = 'Matched automatically against client dietary profiles to safeguard guest health.',
  disabled = false,
  className = '',
  style = {},
}) {
  const defaultMasterList = [
    'Gluten', 'Dairy', 'Shellfish', 'Fish', 'Eggs', 'Peanuts', 'Tree Nuts', 'Soy', 'Sesame', 'Mustard', 'Celery', 'Lupin', 'Sulphites'
  ];

  const allAllergenNames = Array.from(
    new Set([
      ...masterAllergens.map((a) => (typeof a === 'string' ? a : a.name)),
      ...defaultMasterList,
    ])
  ).filter(Boolean);

  return (
    <div style={{ marginBottom: 'var(--spacing-sm, 10px)', width: '100%', ...style }} className={className}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: 'var(--font-size-sm, 0.75rem)',
            fontWeight: 600,
            color: 'var(--color-text, #1e1b16)',
            marginBottom: '3px',
          }}
        >
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          {optional && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', fontWeight: 400, marginLeft: '4px' }}>(opt)</span>}
        </label>
      )}

      {helperText && (
        <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted, #716c62)', margin: '0 0 6px' }}>
          {helperText}
        </p>
      )}

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {allAllergenNames.map((name) => {
          const isSelected = selectedAllergens.includes(name);
          return (
            <button
              type="button"
              key={name}
              disabled={disabled}
              onClick={() => onToggleAllergen && onToggleAllergen(name)}
              style={{
                padding: '3px 8px',
                borderRadius: '3px',
                border: isSelected
                  ? '1px solid var(--color-danger, #c53030)'
                  : '1px solid var(--color-border, #ece7de)',
                backgroundColor: isSelected ? 'var(--color-danger-bg, #feefef)' : 'var(--color-bg, #fbf9f5)',
                color: isSelected ? 'var(--color-danger, #c53030)' : 'var(--color-text, #1e1b16)',
                fontSize: '0.72rem',
                fontWeight: isSelected ? 600 : 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: 'none',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', lineHeight: 1, fontWeight: 700 }}>
                {isSelected ? '✓' : '+'}
              </span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
