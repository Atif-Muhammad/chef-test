import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Card from './Card';

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '550px',
  footer,
  cardStyle = {},
  className = '',
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll and prevent background interaction when dialog is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="shared-dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="shared-dialog-wrapper"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth, display: 'flex', justifyContent: 'center' }}
      >
        <Card className={`shared-dialog-card ${className}`} style={{ maxWidth, ...cardStyle }}>
          <div className="shared-dialog-header">
            <h3 className="shared-dialog-title">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="shared-dialog-close"
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>

          <div className="shared-dialog-body">
            {children}
          </div>

          {footer && (
            <div className="shared-dialog-footer">
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>,
    document.body
  );
}
