import React from 'react';

/**
 * ToggleSwitch
 * Elegant iOS/dashboard styled toggle switch card.
 */
export default function ToggleSwitch({
  id,
  label,
  description = '',
  checked = false,
  onChange,
  badge = '',
  badgeColor = 'primary', // 'primary' | 'warning' | 'danger'
  required = false,
  optional = false,
  disabled = false,
  className = '',
  style = {},
}) {
  const badgeStyle = {
    fontSize: '0.66rem',
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: '3px',
    marginLeft: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    verticalAlign: 'middle',
    ...(badgeColor === 'warning'
      ? { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }
      : badgeColor === 'danger'
      ? { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
      : { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }),
  };

  return (
    <div
      onClick={() => {
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={`toggle-switch-card ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '4px',
        border: checked
          ? '1px solid var(--color-primary, #2e3b12)'
          : '1px solid var(--color-border, #ece7de)',
        backgroundColor: checked
          ? 'var(--color-primary-light, #f1f6ec)'
          : 'var(--color-bg, #fbf9f5)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-fast, 150ms)',
        userSelect: 'none',
        boxShadow: 'none',
        opacity: disabled ? 0.6 : 1,
        marginBottom: 'var(--spacing-sm, 8px)',
        ...style,
      }}
    >
      <div style={{ flex: 1, paddingRight: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: checked ? 'var(--color-primary, #2e3b12)' : 'var(--color-text, #1e1b16)',
            }}
          >
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
            {optional && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem', fontWeight: 400, marginLeft: '4px' }}>(opt)</span>}
          </span>
          {badge && <span style={badgeStyle}>{badge}</span>}
        </div>
        {description && (
          <p
            style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-muted, #716c62)',
              margin: '2px 0 0',
              lineHeight: 1.3,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Switch Track & Thumb */}
      <div
        style={{
          width: '38px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: checked ? '#15803d' : '#d1d5db',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            position: 'absolute',
            top: '2px',
            left: checked ? '18px' : '2px',
            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </div>
    </div>
  );
}
