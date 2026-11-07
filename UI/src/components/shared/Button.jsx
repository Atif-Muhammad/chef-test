import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  style = {},
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-xs)',
    fontWeight: 600,
    fontFamily: 'var(--font-family-stack)',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all var(--transition-fast)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: '1px solid transparent',
    textDecoration: 'none',
  };

  const sizeStyles = {
    sm: { height: '30px', padding: '0 12px', fontSize: 'var(--font-size-xs, 0.76rem)', borderRadius: '4px' },
    md: { height: '38px', padding: '0 18px', fontSize: 'var(--font-size-body, 0.88rem)', borderRadius: '4px' },
    lg: { height: '44px', padding: '0 24px', fontSize: 'var(--font-size-h4, 0.98rem)', borderRadius: '4px' },
  }[size] || {};

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary, #2e3b12)',
      color: '#ffffff',
      borderColor: 'var(--color-primary, #2e3b12)',
      boxShadow: 'none',
    },
    secondary: {
      backgroundColor: 'var(--color-accent, #c49e5d)',
      color: '#ffffff',
      borderColor: 'var(--color-accent, #c49e5d)',
      boxShadow: 'none',
    },
    outline: {
      backgroundColor: 'var(--color-bg, #fbf9f5)',
      color: 'var(--color-text, #1e1b16)',
      borderColor: 'var(--color-border, #ece7de)',
      boxShadow: 'none',
    },
    danger: {
      backgroundColor: 'var(--color-danger, #c53030)',
      color: '#ffffff',
      borderColor: 'var(--color-danger, #c53030)',
      boxShadow: 'none',
    },
  }[variant] || {};

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles, ...style }}
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
