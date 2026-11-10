import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * FilterDrawer Component
 * Slide-out sidebar drawer from the right for managing page filters.
 * Keeps tables uncluttered on both mobile screens and large displays.
 */
export default function FilterDrawer({
  isOpen,
  onClose,
  title = 'Filters',
  activeCount = 0,
  onReset,
  children,
  applyText = 'Show Results',
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9990,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(25, 20, 15, 0.45)',
          backdropFilter: 'blur(3px)',
          animation: 'dialogFadeIn 200ms ease-out',
        }}
      />

      {/* Slide-out Sidebar Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '350px',
          height: '100%',
          backgroundColor: 'var(--color-bg, #fbf9f5)',
          borderLeft: '1px solid var(--color-border, #ece7de)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          animation: 'slideInRight 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border, #ece7de)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f6f3eb',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #2e3b12)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <h3
              style={{
                margin: 0,
                fontSize: '0.92rem',
                fontWeight: 700,
                color: 'var(--color-primary, #2e3b12)',
                fontFamily: "var(--font-heading, 'Cormorant Garamond', Georgia, serif)",
              }}
            >
              {title}
            </h3>
            {activeCount > 0 && (
              <span
                style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-primary, #2e3b12)',
                  color: '#ffffff',
                }}
              >
                {activeCount} active
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '1.25rem',
              lineHeight: 1,
              color: '#716c62',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            &times;
          </button>
        </div>

        {/* Drawer Filter Controls Body */}
        <div
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {children}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--color-border, #ece7de)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={activeCount === 0}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--color-border, #ece7de)',
                backgroundColor: 'var(--color-bg, #fbf9f5)',
                color: activeCount === 0 ? '#a8a29e' : '#4a453e',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: activeCount === 0 ? 'not-allowed' : 'pointer',
                opacity: activeCount === 0 ? 0.6 : 1,
              }}
            >
              Reset All
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '7px 14px',
              borderRadius: '4px',
              border: '1px solid var(--color-primary, #2e3b12)',
              backgroundColor: 'var(--color-primary, #2e3b12)',
              color: '#ffffff',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {applyText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
