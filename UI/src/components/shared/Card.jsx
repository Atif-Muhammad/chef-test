import React from 'react';

export default function Card({
  children,
  className = '',
  style = {},
  onClick,
  hoverable = false,
  ...props
}) {
  const cardStyles = {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-card)',
    padding: '18px 20px',
    transition: hoverable ? 'transform var(--transition-fast), box-shadow var(--transition-fast)' : 'box-shadow var(--transition-fast)',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      className={`card ${hoverable ? 'hoverable' : ''} ${className}`}
      style={cardStyles}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
