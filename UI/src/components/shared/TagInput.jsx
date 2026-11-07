import React, { useState } from 'react';

/**
 * TagInput
 * Multi-tag selector with interactive pill badges and quick presets.
 */
export default function TagInput({
  label,
  id,
  value = [],
  onChange,
  presets = [],
  placeholder = 'Type tag and press Enter...',
  helperText = '',
  required = false,
  optional = false,
  error = '',
  className = '',
  style = {},
}) {
  const [inputValue, setInputValue] = useState('');

  // Normalize value to array of non-empty strings
  const currentTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
    ? value.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const handleAddTag = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!currentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...currentTags, trimmed];
      if (onChange) onChange(updated);
    }
    setInputValue('');
  };

  const handleRemoveTag = (indexToRemove) => {
    const updated = currentTags.filter((_, idx) => idx !== indexToRemove);
    if (onChange) onChange(updated);
  };

  const handleTogglePreset = (preset) => {
    const exists = currentTags.some((t) => t.toLowerCase() === preset.toLowerCase());
    if (exists) {
      const updated = currentTags.filter((t) => t.toLowerCase() !== preset.toLowerCase());
      if (onChange) onChange(updated);
    } else {
      handleAddTag(preset);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      handleRemoveTag(currentTags.length - 1);
    }
  };

  return (
    <div style={{ marginBottom: 'var(--spacing-sm, 10px)', width: '100%', ...style }} className={className}>
      {label && (
        <label
          htmlFor={id}
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

      {/* Selected tags container with input */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          padding: '5px 8px',
          borderRadius: '4px',
          border: `1px solid ${error ? 'var(--color-danger, #c53030)' : 'var(--color-border, #ece7de)'}`,
          backgroundColor: 'var(--color-bg, #fbf9f5)',
          minHeight: '36px',
          alignItems: 'center',
          boxShadow: 'none',
        }}
      >
        {currentTags.map((tag, idx) => (
          <span
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 7px',
              backgroundColor: '#f1f6ec',
              color: 'var(--color-primary, #2e3b12)',
              borderRadius: '3px',
              fontSize: '0.74rem',
              fontWeight: 500,
              border: '1px solid rgba(46, 59, 18, 0.15)',
            }}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(idx)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary, #2e3b12)',
                cursor: 'pointer',
                padding: '0 2px',
                fontSize: '0.85rem',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
              }}
              title="Remove tag"
            >
              &times;
            </button>
          </span>
        ))}

        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) handleAddTag(inputValue);
          }}
          placeholder={currentTags.length === 0 ? placeholder : 'Add more...'}
          style={{
            flex: '1 1 120px',
            border: 'none',
            outline: 'none',
            fontSize: 'var(--font-size-body, 0.8rem)',
            fontFamily: 'var(--font-family-stack)',
            padding: '2px 4px',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
          }}
        />
      </div>

      {/* Suggested Quick Presets */}
      {presets.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted, #716c62)', marginRight: '2px', fontWeight: 500 }}>
            Quick suggestions:
          </span>
          {presets.map((preset) => {
            const isSelected = currentTags.some((t) => t.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleTogglePreset(preset)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 7px',
                  borderRadius: '3px',
                  fontSize: '0.68rem',
                  fontWeight: isSelected ? 600 : 500,
                  border: isSelected
                    ? '1px solid #7a9460'
                    : '1px solid var(--color-border, #ece7de)',
                  backgroundColor: isSelected ? '#edf4e8' : 'var(--color-bg, #fbf9f5)',
                  color: isSelected ? 'var(--color-primary, #2e3b12)' : 'var(--color-text-muted, #716c62)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {isSelected ? '✓' : '+'}
                </span>
                <span>{preset}</span>
              </button>
            );
          })}
        </div>
      )}

      {helperText && (
        <span style={{ display: 'block', fontSize: 'var(--font-size-xs, 0.68rem)', color: 'var(--color-text-muted)', marginTop: '3px' }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
