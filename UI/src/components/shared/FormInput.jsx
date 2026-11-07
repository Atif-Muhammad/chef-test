import React from 'react';

export default function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  optional = false,
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  style = {},
  rows,
  ...props
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: 'var(--spacing-sm)',
    width: '100%',
    ...style,
  };

  const labelStyle = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
  };

  const inputStyle = {
    width: '100%',
    height: type === 'textarea' ? 'auto' : '38px',
    minHeight: type === 'textarea' ? 'auto' : '38px',
    padding: type === 'textarea' ? '8px 11px' : '0 11px',
    borderRadius: '4px',
    border: `1px solid ${error ? 'var(--color-danger, #c53030)' : 'var(--color-border, #ece7de)'}`,
    backgroundColor: error ? '#fef2f2' : disabled ? '#f8f6f0' : 'var(--color-bg, #fbf9f5)',
    color: 'var(--color-text, #1e1b16)',
    fontSize: 'var(--font-size-body, 0.88rem)',
    fontFamily: 'var(--font-family-stack)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxShadow: 'none',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          {optional && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', fontWeight: 400, marginLeft: '4px' }}>(opt)</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows || 3}
          style={{ ...inputStyle, resize: 'vertical' }}
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={inputStyle}
          {...props}
        />
      )}

      {error ? (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>{error}</span>
      ) : helperText ? (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{helperText}</span>
      ) : null}
    </div>
  );
}
