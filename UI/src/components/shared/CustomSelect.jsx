import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function CustomSelect({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = '-- Select an option --',
  error = '',
  helperText = '',
  size = 'md', // 'sm' | 'md'
  leadingIcon = null,
  disabled = false,
  required = false,
  optional = false,
  className = '',
  style = {},
  triggerStyle = {},
  menuStyle = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: 'bottom',
    maxHeight: 230,
  });

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listboxRef = useRef(null);

  // Normalize options to { value, label, icon?, description? }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: opt, label: String(opt) };
    }
    return {
      value: opt.value,
      label: opt.label || String(opt.value),
      icon: opt.icon,
      description: opt.description,
    };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Compute position relative to viewport for the portal
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const defaultMaxHeight = 230;

    // Flip upwards if below space is tight (< 200px) and there is more room above
    const openUpwards = spaceBelow < 200 && spaceAbove > spaceBelow;

    if (openUpwards) {
      const availableHeight = Math.max(90, Math.min(defaultMaxHeight, spaceAbove - 12));
      setCoords({
        top: rect.top - 4,
        left: rect.left,
        width: rect.width,
        placement: 'top',
        maxHeight: availableHeight,
      });
    } else {
      const availableHeight = Math.max(90, Math.min(defaultMaxHeight, spaceBelow - 12));
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        placement: 'bottom',
        maxHeight: availableHeight,
      });
    }
  }, []);

  // Recalculate position on scroll (capture all scrolling containers) and window resize
  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateCoords]);

  // Click outside listener (checking both container and portaled listbox)
  useEffect(() => {
    function handleClickOutside(event) {
      const isInsideContainer = containerRef.current && containerRef.current.contains(event.target);
      const isInsideListbox = listboxRef.current && listboxRef.current.contains(event.target);

      if (!isInsideContainer && !isInsideListbox) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        const curIdx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(curIdx >= 0 ? curIdx : 0);
      }
      return next;
    });
  };

  const handleSelect = (optValue) => {
    if (disabled) return;
    if (onChange) onChange(optValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        const curIdx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(curIdx >= 0 ? curIdx : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
          handleSelect(normalizedOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const isSmall = size === 'sm';
  const triggerHeight = isSmall ? '30px' : '38px';
  const fontSize = isSmall ? '0.74rem' : '0.84rem';
  const paddingX = isSmall ? '8px' : '11px';

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: '100%',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={id}
          className="custom-select-label"
          style={{
            fontSize: 'var(--font-size-sm, 0.82rem)',
            fontWeight: 600,
            color: 'var(--color-text, #1e1b16)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger, #c53030)' }}>*</span>}
          {optional && (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.74rem', fontWeight: 400 }}>
              (opt)
            </span>
          )}
        </label>
      )}

      {/* Select Trigger */}
      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="custom-select-trigger"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        style={{
          height: triggerHeight,
          minHeight: triggerHeight,
          padding: `0 ${paddingX}`,
          borderRadius: '4px',
          border: `1px solid ${error ? 'var(--color-danger, #c53030)' : isOpen ? 'var(--color-primary, #2e3b12)' : 'var(--color-border, #ece7de)'}`,
          backgroundColor: error ? '#fef2f2' : disabled ? '#f8f6f0' : 'var(--color-bg, #fbf9f5)',
          color: selectedOption ? 'var(--color-text, #1e1b16)' : 'var(--color-text-muted, #716c62)',
          fontSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          boxShadow: 'none',
          transition: 'border-color 0.15s ease',
          outline: 'none',
          ...triggerStyle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, flex: 1 }}>
          {(leadingIcon || selectedOption?.icon) && (
            <span style={{ display: 'inline-flex', flexShrink: 0 }}>{leadingIcon || selectedOption?.icon}</span>
          )}
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: selectedOption ? 500 : 400,
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Elegant Animated Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted, #716c62)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            marginLeft: '6px',
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {/* Floating Options Menu portaled directly to document.body (prevents any modal/card clipping or scrollbar issues) */}
      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            style={{
              position: 'fixed',
              top: coords.placement === 'top' ? 'auto' : `${coords.top}px`,
              bottom: coords.placement === 'top' ? `${window.innerHeight - coords.top}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 10001, // Always render above dialogs (zIndex 1000)
              maxHeight: `${coords.maxHeight}px`,
              overflowY: 'auto',
              backgroundColor: 'var(--color-bg, #fbf9f5)',
              borderRadius: '4px',
              border: '1px solid var(--color-border, #ece7de)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              padding: '4px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d6ccbe transparent',
              boxSizing: 'border-box',
              ...menuStyle,
            }}
          >
            {normalizedOptions.length === 0 ? (
              <div
                style={{
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                }}
              >
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: isSmall ? '5px 8px' : '7px 10px',
                      borderRadius: '4px',
                      backgroundColor: isSelected
                        ? '#f3eee6'
                        : isHighlighted
                        ? '#faf7f2'
                        : 'transparent',
                      color: isSelected ? 'var(--color-primary, #2e3b12)' : 'var(--color-text, #1e1b16)',
                      fontWeight: isSelected ? 600 : 400,
                      fontSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.12s ease',
                      marginBottom: '1px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                      {opt.icon && <span style={{ display: 'inline-flex' }}>{opt.icon}</span>}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{opt.label}</span>
                        {opt.description && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-primary, #2e3b12)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>,
          document.body
        )}

      {error && (
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-danger, #c53030)',
            fontWeight: 500,
            marginTop: '1px',
            display: 'block',
          }}
        >
          {error}
        </span>
      )}

      {helperText && !error && (
        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--color-text-muted, #716c62)',
            marginTop: '1px',
            display: 'block',
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
}
