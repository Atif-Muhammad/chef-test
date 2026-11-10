import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

/**
 * KebabMenu Component
 * Compact 3-vertical-dots action menu for data tables.
 * Rendered via createPortal to document.body to prevent table/card overflow clipping.
 */
export default function KebabMenu({
  items = [],
  align = 'right',
  ariaLabel = 'Row actions',
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, bottom: 0, left: 0, right: 0, openUpwards: false });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const estimatedHeight = items.length * 36 + 12;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const rightPos = Math.max(8, window.innerWidth - rect.right);
    const leftPos = Math.max(8, rect.left);

    setPosition({
      top: rect.bottom + 4,
      bottom: window.innerHeight - rect.top + 4,
      left: leftPos,
      right: rightPos,
      openUpwards,
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open) {
      calculatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    calculatePosition();

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const handleScrollOrResize = () => {
      // Reposition on scroll/resize or close if scrolled out of view
      calculatePosition();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open, items.length, align]);

  if (!items || items.length === 0) return null;

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        title={ariaLabel}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '4px',
          border: '1px solid #e7e2d8',
          backgroundColor: open ? '#ede8df' : '#ffffff',
          color: '#4a453e',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          boxShadow: 'none',
          transition: 'all 0.12s ease',
        }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = '#f7f4ec';
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: position.openUpwards ? undefined : `${position.top}px`,
              bottom: position.openUpwards ? `${position.bottom}px` : undefined,
              [align === 'right' ? 'right' : 'left']:
                align === 'right' ? `${position.right}px` : `${position.left}px`,
              zIndex: 99999,
              minWidth: '154px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border, #ece7de)',
              borderRadius: '6px',
              boxShadow: '0 10px 28px -3px rgba(25, 20, 15, 0.22), 0 4px 10px rgba(0, 0, 0, 0.06)',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              animation: 'dialogFadeIn 120ms ease-out',
            }}
          >
            {items.map((item, idx) => {
              if (!item) return null;
              const isDanger = item.variant === 'danger';
              const commonStyle = {
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 9px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                color: isDanger ? '#dc2626' : '#1e1b16',
                fontSize: '0.74rem',
                fontWeight: 500,
                textAlign: 'left',
                textDecoration: 'none',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                opacity: item.disabled ? 0.45 : 1,
                transition: 'background-color 0.1s ease',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              };

              const handleMouseEnter = (e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = isDanger ? '#fef2f2' : '#f6f3eb';
                }
              };
              const handleMouseLeave = (e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              };

              const content = (
                <>
                  {item.icon && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isDanger ? '#dc2626' : '#6b665c',
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                </>
              );

              if (item.to) {
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    style={commonStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                  style={commonStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
