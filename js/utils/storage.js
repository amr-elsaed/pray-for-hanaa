/**
 * Storage — localStorage wrapper for persistent data
 * Stores dhikr counts and visitor du'as per-device.
 */

const STORAGE_KEYS = {
  DHIKR: 'prayForHanaa_dhikr',
  VISITOR_DUAS: 'prayForHanaa_visitorDuas',
  STATS: 'prayForHanaa_stats',
};

/**
 * Safely get a value from localStorage.
 * Returns fallback if key doesn't exist or JSON is invalid.
 */
export function getStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Safely set a value in localStorage.
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// === Dhikr Helpers ===

const DEFAULT_DHIKR = {
  subhanallah: 0,
  alhamdulillah: 0,
  astaghfirullah: 0,
  lahawla: 0,
};

export function getDhikrCounts() {
  return getStorage(STORAGE_KEYS.DHIKR, { ...DEFAULT_DHIKR });
}

export function incrementDhikr(key) {
  const counts = getDhikrCounts();
  counts[key] = (counts[key] || 0) + 1;
  setStorage(STORAGE_KEYS.DHIKR, counts);
  return counts;
}

export function getDhikrTotal() {
  const counts = getDhikrCounts();
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

// === Visitor Du'as Helpers ===

export function getVisitorDuas() {
  return getStorage(STORAGE_KEYS.VISITOR_DUAS, []);
}

export function addVisitorDua(name, message) {
  const duas = getVisitorDuas();
  const entry = {
    id: generateId(),
    name,
    message,
    createdAt: new Date().toISOString(),
  };
  duas.unshift(entry); // newest first
  setStorage(STORAGE_KEYS.VISITOR_DUAS, duas);
  return entry;
}

// === Stats Helpers ===

export function getStats() {
  return getStorage(STORAGE_KEYS.STATS, { duasRead: 0 });
}

export function incrementDuasStat() {
  const stats = getStats();
  stats.duasRead = (stats.duasRead || 0) + 1;
  setStorage(STORAGE_KEYS.STATS, stats);
  return stats;
}

// === Arabic Numeral Formatting ===

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(num) {
  return String(num).replace(/\d/g, (d) => ARABIC_DIGITS[d]);
}

// === Utilities ===

function generateId() {
  return Math.random().toString(36).substring(2, 14);
}

export { STORAGE_KEYS };
