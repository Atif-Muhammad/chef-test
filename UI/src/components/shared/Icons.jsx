import React from 'react';
import { Clock } from 'lucide-react';

/**
 * Cohesive, lightweight, colored vector SVG icons for Private Chef Missy.
 * Replaces system keyboard emojis with crisp, luxury culinary branding.
 */

// Herb / Leaf Icon (Gentle / None Spice / Vegetarian)
export function HerbIcon({ size = 18, style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      {/* Stem */}
      <path
        d="M3 21C6 17 8 13 12 10"
        stroke="#2e3b12"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Main leaf */}
      <path
        d="M12 10C10 5 14 2 19 3C22 8 19 12 14 14C12.5 14.5 12 11.5 12 10Z"
        fill="#16a34a"
        stroke="#15803d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Side leaf left */}
      <path
        d="M9 13C6 11 6 8 8 7C10 7 11 9 10.5 11.5L9 13Z"
        fill="#4ade80"
        stroke="#16a34a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Side leaf right */}
      <path
        d="M13 16C15 14 18 14 18 16C18 18 15 19 13.5 18L13 16Z"
        fill="#22c55e"
        stroke="#15803d"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Single Red Chili Icon (Mild Spice)
export function ChiliIcon({ size = 18, style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      {/* Chili Body */}
      <path
        d="M19.5 5.5C18 7.5 16 11 16 14.5C16 18.5 13 21 9 20C5.5 19.2 4 16.5 4.5 13.5C5 10 9 7.5 14 6C16 5.4 18 5.2 19.5 5.5Z"
        fill="#dc2626"
        stroke="#b91c1c"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Highlight curve */}
      <path
        d="M8.5 10.5C10.5 9 13 8 15.5 7.5"
        stroke="#f87171"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Calyx & Stem */}
      <path
        d="M16 5.5C17.5 4 19 3 21 3C20.5 4.5 19.5 5 18 6.5"
        stroke="#15803d"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M15 6.5C16 6 18 6 19.5 6.5C19 7.5 18 8 16.5 7.5"
        fill="#16a34a"
      />
    </svg>
  );
}

// Double Red Chili Icon (Spicy)
export function ChiliDoubleIcon({ size = 20, style = {}, className = '' }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        lineHeight: 1,
        ...style,
      }}
      className={className}
    >
      <ChiliIcon size={size * 0.9} />
      <ChiliIcon size={size * 0.9} />
    </div>
  );
}

// Lock Icon (Confidential Private Chef Notes)
export function LockIcon({ size = 16, color = '#ea580c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="11"
        width="16"
        height="11"
        rx="3"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
      />
      <circle cx="12" cy="16" r="1.5" fill="#ffffff" />
      <path d="M12 17.5V19.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Warning Triangle Icon (Allergens & Health Cautions)
export function WarningIcon({ size = 16, color = '#d97706', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M12 3L22 20H2L12 3Z"
        fill="#fef3c7"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 9V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r="1" fill={color} />
    </svg>
  );
}

// Snowflake Icon (Freezer Safe)
export function SnowflakeIcon({ size = 16, color = '#2563eb', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <path d="M10 5L12 3L14 5M10 19L12 21L14 19M5 10L3 12L5 14M19 10L21 12L19 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Lucide React Clock Icon (Official Lucide icon for dates, times, and arrival windows)
export { Clock };
export const ClockIcon = Clock;
export const TimerIcon = Clock;

// Sparkle Icon (Nutritional Highlights & Wellness)
export function SparkleIcon({ size = 16, color = '#c49e5d', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M12 2L14.2 8.8L21 11L14.2 13.2L12 20L9.8 13.2L3 11L9.8 8.8L12 2Z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="5" r="1.5" fill={color} />
      <circle cx="6" cy="18" r="1.2" fill={color} />
    </svg>
  );
}

// Heart Icon (Personal Favourites)
export function HeartIcon({
  filled = false,
  size = 18,
  color = '#dc2626',
  animating = false,
  isAnimating = false,
  style = {},
  className = '',
}) {
  const shouldAnimate = animating || isAnimating;
  const animClass = shouldAnimate ? 'heart-pop-anim' : '';
  const combinedClass = [animClass, className].filter(Boolean).join(' ');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? color : '#9ca3af'}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        transition: 'fill 0.2s ease, stroke 0.2s ease, transform 0.18s ease',
        ...style,
      }}
      className={combinedClass}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Checkmark Circle Icon (Verified / Success / Compliant)
export function CheckCircleIcon({ size = 16, color = '#15803d', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#ecfdf5" stroke={color} strokeWidth="1.8" />
      <polyline points="16 9 10.5 14.5 8 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Cross / X Circle Icon (Conflicts / Alerts)
export function CrossCircleIcon({ size = 16, color = '#dc2626', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="12" r="10" fill="#fee2e2" stroke={color} strokeWidth="1.8" />
      <line x1="15" y1="9" x2="9" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="9" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Chef Hat Icon (Prepared By / Culinary Lead)
export function ChefHatIcon({ size = 18, color = '#2e3b12', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M6 18H18M6 21H18M7 18C4 18 3 15 4 12C2.5 10 3 6.5 6 6C7.5 4 11 3.5 12 5C13 3.5 16.5 4 18 6C21 6.5 21.5 10 20 12C21 15 20 18 17 18H7Z"
        fill="#f1f6ec"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Camera Icon (Photo Upload)
export function CameraIcon({ size = 18, color = '#716c62', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M23 19C23 20.1 22.1 21 21 21H3C1.9 21 1 20.1 1 19V8C1 6.9 1.9 6 3 6H7L9 3H15L17 6H21C22.1 6 23 6.9 23 8V19Z"
        fill="#f7f4ee"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// Calendar Icon (Scheduled Visits)
export function CalendarIcon({ size = 16, color = '#2e3b12', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="3" fill="#ffffff" stroke={color} strokeWidth="1.8" />
      <line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.8" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" fill={color} />
      <rect x="14" y="13" width="3" height="3" rx="0.5" fill="#c49e5d" />
    </svg>
  );
}

// Users / Family Icon (Adults & Children)
export function UsersIcon({ size = 16, color = '#2e3b12', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M17 21V19C17 17.3 15.7 16 14 16H8C6.3 16 5 17.3 5 19V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11" cy="9" r="4" fill="#f1f6ec" stroke={color} strokeWidth="1.8" />
      <path d="M21 21V19C21 17.8 20.3 16.8 19.3 16.3" stroke="#8c857b" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17.5" cy="9.5" r="3" stroke="#8c857b" strokeWidth="1.5" />
    </svg>
  );
}

// Kids / Child Icon (Ages 1-5)
export function ChildIcon({ size = 16, color = '#c49e5d', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="7" r="4.5" fill="#fef3c7" stroke={color} strokeWidth="1.8" />
      <path d="M9 7.5C9 8 10.5 9 12 9C13.5 9 15 8 15 7.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="10" cy="6" r="0.8" fill={color} />
      <circle cx="14" cy="6" r="0.8" fill={color} />
      <path d="M7 19C7 16 9.2 13.5 12 13.5C14.8 13.5 17 16 17 19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Printer Icon (Print Shopping List)
export function PrinterIcon({ size = 16, color = '#2e3b12', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M6 9V2H18V9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 18H4C2.9 18 2 17.1 2 16V11C2 9.9 2.9 9 4 9H20C21.1 9 22 9.9 22 11V16C22 17.1 21.1 18 20 18H18"
        fill="#f7f4ee"
        stroke={color}
        strokeWidth="1.8"
      />
      <rect x="6" y="14" width="12" height="8" rx="1" fill="#ffffff" stroke={color} strokeWidth="1.8" />
      <line x1="9" y1="18" x2="15" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Phone Icon
export function PhoneIcon({ size = 15, color = '#4a463e', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M22 16.92V19.92C22 20.48 21.54 20.93 20.98 20.92C10.5 20.73 3.27 13.5 3.08 3.02C3.07 2.46 3.52 2 4.08 2H7.08C7.58 2 8 2.37 8.07 2.86C8.2 3.8 8.46 4.71 8.83 5.56C8.98 5.89 8.89 6.27 8.62 6.54L6.96 8.2C8.36 11.23 10.77 13.64 13.8 15.04L15.46 13.38C15.73 13.11 16.11 13.02 16.44 13.17C17.29 13.54 18.2 13.8 19.14 13.93C19.63 14 20 14.42 20 14.92V16.92H22Z"
        fill="#f1f6ec"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Lightning Bolt Icon (Quick Actions)
export function BoltIcon({ size = 16, color = '#d97706', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// Settings Gear Icon (System Overview)
export function GearIcon({ size = 16, color = '#4b5563', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Clipboard / Document Icon
export function ClipboardIcon({ size = 16, color = '#2e3b12', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M16 4H18C19.1 4 20 4.9 20 6V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V6C4 4.9 4.9 4 6 4H8" stroke={color} strokeWidth="1.8" />
      <rect x="8" y="2" width="8" height="4" rx="1" fill="#f1f6ec" stroke={color} strokeWidth="1.8" />
      <line x1="8" y1="11" x2="16" y2="11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="15" x2="14" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Eye Icon (Preview / View)
export function EyeIcon({ size = 16, color = '#4a463e', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3.5" fill="#f1f6ec" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// More Vertical Icon (3 Dots Action Trigger)
export function MoreVerticalIcon({ size = 18, color = '#4a463e', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="5" r="1.8" fill={color} />
      <circle cx="12" cy="12" r="1.8" fill={color} />
      <circle cx="12" cy="19" r="1.8" fill={color} />
    </svg>
  );
}

// Edit Icon (Pencil)
export function EditIcon({ size = 15, color = '#4a463e', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56263 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trash / Delete Icon
export function TrashIcon({ size = 15, color = '#dc2626', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M3 6H5H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="10" y1="11" x2="10" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14" y1="11" x2="14" y2="17" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Mail / Envelope Icon
export function MailIcon({ size = 16, color = '#36441c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="3" stroke={color} strokeWidth="1.8" />
      <path d="M22 6L12 13L2 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Eye Off / Hidden Password Icon
export function EyeOffIcon({ size = 16, color = '#6b7280', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 6.06 6.06" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 19.8 16.13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Globe Icon (Language Selector)
export function GlobeIcon({ size = 15, color = '#292524', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.8" />
      <path d="M12 2A15.3 15.3 0 0 1 16.5 12A15.3 15.3 0 0 1 12 22A15.3 15.3 0 0 1 7.5 12A15.3 15.3 0 0 1 12 2Z" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

// Shield Icon (Security / Safe Account)
export function ShieldIcon({ size = 18, color = '#36441c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M12 22S4 18 4 11V5L12 2L20 5V11C20 18 12 22 12 22Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Cloche / Food Cover Icon (Browse & Select)
export function ClocheIcon({ size = 18, color = '#36441c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="12" cy="6" r="1.5" stroke={color} strokeWidth="1.8" />
      <path d="M4 18A8 8 0 0 1 20 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="2" y1="19" x2="22" y2="19" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Single User Silhouette Icon (Full Name / User)
export function UserIcon({ size = 16, color = '#36441c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Utensils / Dining Menu Icon (Lucide Utensils)
export function UtensilsIcon({ size = 16, color = '#36441c', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
      <path d="M15 2v19" />
      <path d="M5 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
      <path d="M8 12v9" />
    </svg>
  );
}

// Search Lens Icon
export function SearchIcon({ size = 16, color = '#6b7280', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Layers / Categories Stack Icon
export function LayersIcon({ size = 16, color = '#4b5563', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

// Clean Vector Leaf Icon (Dietary Tags - Stroke vector, not emoji)
export function LeafIcon({ size = 15, color = '#4b5563', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

// Map Pin Icon (Location marker)
export function MapPinIcon({ size = 14, color = '#655e53', style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}



