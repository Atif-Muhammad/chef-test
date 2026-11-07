import React, { useEffect } from 'react';
import Card from './Card';

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
  footer,
  cardStyle = {},
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 29, 16, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '12px',
  };

  const dialogCardStyle = {
    width: '100%',
    maxWidth,
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'dialogFadeIn 200ms ease-out',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg, #fbf9f5)',
    borderRadius: '4px',
    border: '1px solid var(--color-border, #ece7de)',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14)',
    padding: '16px 20px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--color-border, #ece7de)',
    flexShrink: 0,
  };

  const bodyStyle = {
    flex: '1 1 auto',
    overflowY: 'auto',
    minHeight: 0,
    paddingRight: '4px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#d6ccbe transparent',
  };

  const footerStyle = {
    marginTop: '12px',
    paddingTop: '10px',
    borderTop: '1px solid var(--color-border, #ece7de)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    flexShrink: 0,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth, display: 'flex', justifyContent: 'center' }}>
        <Card style={{ ...dialogCardStyle, ...cardStyle }}>
          <div style={headerStyle}>
            <h3
              style={{
                margin: 0,
                fontSize: '0.98rem',
                fontWeight: 700,
                color: 'var(--color-primary, #2e3b12)',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'var(--color-text-muted, #716c62)',
                padding: '0 4px',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>

          <div style={bodyStyle}>
            {children}
          </div>

          {footer && (
            <div style={footerStyle}>
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
