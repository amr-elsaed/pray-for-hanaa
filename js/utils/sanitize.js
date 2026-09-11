/**
 * Sanitize — XSS prevention for user-generated content
 */

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

/**
 * Sanitize user input: trim, limit length, remove control characters
 */
export function sanitizeInput(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  // Remove control characters except newlines
  let cleaned = str.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  cleaned = cleaned.trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  return cleaned;
}

/**
 * Rate limiter — prevents spam submissions
 */
const rateLimitMap = new Map();

export function isRateLimited(key, intervalMs = 10000) {
  const now = Date.now();
  const last = rateLimitMap.get(key) || 0;
  if (now - last < intervalMs) return true;
  rateLimitMap.set(key, now);
  return false;
}
