/**
 * Time and Date formatters supporting 12-hour AM/PM display and user local timezone.
 */

// Convert "14:30" or "9:00" to "2:30 PM" / "9:00 AM"
export function convert24To12(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const trimmed = timeStr.trim();
  
  // If already contains AM or PM, return as is
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }

  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);

  if (isNaN(hours)) return trimmed;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12

  return `${hours}:${minutes} ${ampm}`;
}

// Convert "4:00 PM" or "16:00" to "16:00" for standard HTML time input
export function parseTo24Time(timeStr, defaultTime = '16:00') {
  if (!timeStr || typeof timeStr !== 'string') return defaultTime;
  const trimmed = timeStr.trim();

  // Match 12-hour time like "4:00 PM", "04:30 pm", "11:00 AM"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3].toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // Match 24-hour time like "16:00", "09:30"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    return `${match24[1].padStart(2, '0')}:${match24[2]}`;
  }

  return defaultTime;
}

// Format an arrival window like "16:00 - 17:00" into "4:00 PM – 5:00 PM"
export function formatArrivalWindow(windowStr) {
  if (!windowStr || typeof windowStr !== 'string') return 'Timing pending';
  const trimmed = windowStr.trim();
  if (!trimmed || trimmed.toLowerCase() === 'timing pending' || trimmed.toLowerCase() === 'tbd window') {
    return 'Timing pending';
  }

  // If it's a range separated by "-" or "–"
  if (trimmed.includes('-') || trimmed.includes('–')) {
    const separator = trimmed.includes('–') ? '–' : '-';
    const [start, end] = trimmed.split(separator).map((s) => s.trim());
    const start12 = convert24To12(start);
    const end12 = convert24To12(end);
    if (start12 && end12) {
      return `${start12} – ${end12}`;
    }
  }

  return convert24To12(trimmed);
}

// Format date in user's local timezone
export function formatLocalDate(dateInput, options = {}) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const defaultOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...options,
  };

  return d.toLocaleDateString(undefined, defaultOptions);
}

// Format date and time in user's local timezone with 12-hour AM/PM
export function formatLocalDateTime(dateInput, options = {}) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...options,
  };

  return d.toLocaleString(undefined, defaultOptions);
}

// Helper to format ISO date to YYYY-MM-DD for <input type="date">
export function toDateInputValue(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Truncate text to a maximum number of words with trailing ellipsis
export function truncateWords(text, maxWords = 4) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  if (!clean) return '';
  const words = clean.split(/\s+/);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ') + '...';
}
