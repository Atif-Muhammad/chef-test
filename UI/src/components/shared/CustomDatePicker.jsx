import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Helper to parse a 'YYYY-MM-DD' string safely into year, month (0-indexed), date.
 */
function parseDateParts(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10) - 1;
  const d = parseInt(match[3], 10);
  return { year: y, month: m, date: d };
}

/**
 * Format year, month (0-indexed), date into 'YYYY-MM-DD'
 */
function toDateStr(year, month, date) {
  const y = String(year).padStart(4, '0');
  const m = String(month + 1).padStart(2, '0');
  const d = String(date).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Custom Luxury Date Picker for Private Chef Missy
 * Drop-in replacement for native <input type="date">
 */
export default function CustomDatePicker({
  value = '',
  onChange,
  min = '',
  max = '',
  placeholder = 'Select date',
  disabled = false,
  required = false,
  id,
  name,
  style = {},
  wrapperStyle = {},
  className = '',
  allowClear = true,
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value
  const parsedValue = parseDateParts(value);

  // Internal view navigation state (year & month currently in view)
  const today = new Date();
  const [viewYear, setViewYear] = useState(() => parsedValue ? parsedValue.year : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parsedValue ? parsedValue.month : today.getMonth());

  // When value prop changes, synchronize view year/month
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  // Click outside listener to close calendar popup
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle date selection
  const handleSelectDate = (y, m, d) => {
    if (disabled) return;
    const dateStr = toDateStr(y, m, d);

    if (isDateDisabled(dateStr)) return;

    if (onChange) {
      // Pass a synthetic event for 100% compatibility with standard e => onChange(e.target.value)
      const syntheticEvent = {
        target: {
          value: dateStr,
          name: name || '',
          id: id || '',
        },
      };
      onChange(syntheticEvent);
    }

    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      onChange({
        target: {
          value: '',
          name: name || '',
          id: id || '',
        },
      });
    }
  };

  // Check if a date string is out of bounds (< min or > max)
  const isDateDisabled = (dateStr) => {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  // Month navigation
  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate Year Options for quick selection (e.g. for DOB or future bookings)
  const minParsed = parseDateParts(min);
  const maxParsed = parseDateParts(max);
  const currentYear = today.getFullYear();
  const startYear = minParsed ? minParsed.year : currentYear - 90;
  const endYear = maxParsed ? maxParsed.year : currentYear + 15;
  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  // Compute days in view month
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Grid cells
  const days = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthIdx = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    days.push({
      day: d,
      month: prevMonthIdx,
      year: prevYear,
      isCurrentMonth: false,
      dateStr: toDateStr(prevYear, prevMonthIdx, d),
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    days.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateStr: toDateStr(viewYear, viewMonth, d),
    });
  }

  // 3. Next month leading days (to complete 5 or 6 rows)
  const totalSlots = Math.ceil(days.length / 7) * 7;
  const remaining = totalSlots - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthIdx = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    days.push({
      day: d,
      month: nextMonthIdx,
      year: nextYear,
      isCurrentMonth: false,
      dateStr: toDateStr(nextYear, nextMonthIdx, d),
    });
  }

  // Friendly formatted display text for the input trigger
  const formattedDisplay = parsedValue
    ? new Date(parsedValue.year, parsedValue.month, parsedValue.date).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        ...wrapperStyle,
      }}
      className={className}
    >
      {/* Trigger Button / Input Display */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        style={{
          width: '100%',
          height: style.height || '36px',
          padding: '0 10px',
          borderRadius: '4px',
          border: isOpen ? '1px solid #2e3b12' : style.border || '1px solid #ece7de',
          backgroundColor: disabled ? '#faf8f5' : style.backgroundColor || '#ffffff',
          color: parsedValue ? '#1a1814' : '#8c857b',
          fontSize: style.fontSize || '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: 'none',
          userSelect: 'none',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: parsedValue ? 600 : 400,
            color: parsedValue ? '#1a1814' : '#8c857b',
          }}
        >
          {formattedDisplay || placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
          {allowClear && parsedValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              style={{
                background: 'none',
                border: 'none',
                padding: '1px',
                cursor: 'pointer',
                color: '#8c857b',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '2px',
              }}
            >
              <X size={13} />
            </button>
          )}
          <Calendar size={14} color={isOpen ? '#2e3b12' : '#8c857b'} />
        </div>
      </div>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 10000,
            width: '272px',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #ece7de',
            boxShadow: '0 8px 24px rgba(46, 59, 18, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header with Month/Year Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={prevMonth}
              title="Previous Month"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '4px',
                border: '1px solid #ece7de',
                backgroundColor: '#ffffff',
                color: '#2e3b12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronLeft size={15} />
            </button>

            {/* Quick Month & Year Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                style={{
                  border: '1px solid #ece7de',
                  borderRadius: '4px',
                  backgroundColor: '#faf8f5',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#2e3b12',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                style={{
                  border: '1px solid #ece7de',
                  borderRadius: '4px',
                  backgroundColor: '#faf8f5',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#2e3b12',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              title="Next Month"
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '4px',
                border: '1px solid #ece7de',
                backgroundColor: '#ffffff',
                color: '#2e3b12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday Names Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            {WEEKDAY_NAMES.map((wd) => (
              <span
                key={wd}
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: '#8c857b',
                  textTransform: 'uppercase',
                  padding: '2px 0',
                }}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {days.map((item, idx) => {
              const isSelected = value === item.dateStr;
              const isToday = todayStr === item.dateStr;
              const disabledDay = isDateDisabled(item.dateStr);

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => handleSelectDate(item.year, item.month, item.day)}
                  style={{
                    height: '28px',
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: isSelected
                      ? '#2e3b12'
                      : isToday
                      ? '#f1f6ec'
                      : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : disabledDay
                      ? '#d4cdc5'
                      : !item.isCurrentMonth
                      ? '#a8a29e'
                      : '#1a1814',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : isToday ? 700 : 500,
                    cursor: disabledDay ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !disabledDay) {
                      e.currentTarget.style.backgroundColor = '#f1f6ec';
                      e.currentTarget.style.color = '#2e3b12';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !disabledDay) {
                      e.currentTarget.style.backgroundColor = isToday ? '#f1f6ec' : 'transparent';
                      e.currentTarget.style.color = isToday ? '#1a1814' : !item.isCurrentMonth ? '#a8a29e' : '#1a1814';
                    }
                  }}
                >
                  {item.day}
                  {isToday && !isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        backgroundColor: '#2e3b12',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid #ece7de',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              disabled={isDateDisabled(todayStr)}
              onClick={() => handleSelectDate(today.getFullYear(), today.getMonth(), today.getDate())}
              style={{
                background: 'none',
                border: 'none',
                color: isDateDisabled(todayStr) ? '#d4cdc5' : '#2e3b12',
                fontSize: '0.70rem',
                fontWeight: 600,
                cursor: isDateDisabled(todayStr) ? 'not-allowed' : 'pointer',
                padding: '2px 4px',
              }}
            >
              Today
            </button>

            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#8c857b',
                  fontSize: '0.70rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '2px 4px',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
