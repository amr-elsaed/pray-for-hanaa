/**
 * Storage — API + localStorage hybrid
 * 
 * Uses Vercel KV via API routes for shared state (all visitors see same data).
 * Falls back to localStorage if API is unavailable (offline/local dev).
 */

const STORAGE_KEYS = {
  DHIKR: 'prayForHanaa_dhikr',
  VISITOR_DUAS: 'prayForHanaa_visitorDuas',
  STATS: 'prayForHanaa_stats',
};

// === API Helpers ===

/**
 * Generic GET request to API
 */
export async function apiGet(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Generic POST request to API
 */
export async function apiPost(endpoint, data) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

// === Local Storage Helpers (fallback / cache) ===

export function getLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

// === Dhikr API Functions ===

/**
 * Fetch shared dhikr counts from API (all visitors' combined total)
 */
export async function fetchDhikrCounts() {
  try {
    const counts = await apiGet('/api/dhikr');
    setLocal(STORAGE_KEYS.DHIKR, counts); // cache locally
    return counts;
  } catch {
    // Fallback to cached local data
    return getLocal(STORAGE_KEYS.DHIKR, {
      subhanallah: 0,
      alhamdulillah: 0,
      astaghfirullah: 0,
      lahawla: 0,
    });
  }
}

/**
 * Increment a dhikr counter on the server (shared across all visitors)
 */
export async function incrementDhikrAPI(key) {
  try {
    const counts = await apiPost('/api/dhikr', { key });
    setLocal(STORAGE_KEYS.DHIKR, counts); // cache locally
    return counts;
  } catch {
    // Offline fallback: increment locally
    const counts = getLocal(STORAGE_KEYS.DHIKR, {
      subhanallah: 0, alhamdulillah: 0, astaghfirullah: 0, lahawla: 0,
    });
    counts[key] = (counts[key] || 0) + 1;
    setLocal(STORAGE_KEYS.DHIKR, counts);
    return counts;
  }
}

/**
 * Get total dhikr count from a counts object
 */
export function getDhikrTotal(counts) {
  if (!counts) return 0;
  return Object.values(counts).reduce((sum, n) => sum + (n || 0), 0);
}

// === Visitor Du'as API Functions ===

/**
 * Fetch all shared visitor du'as from API
 */
export async function fetchVisitorDuas() {
  try {
    const duas = await apiGet('/api/visitor-duas');
    setLocal(STORAGE_KEYS.VISITOR_DUAS, duas); // cache locally
    return duas;
  } catch {
    return getLocal(STORAGE_KEYS.VISITOR_DUAS, []);
  }
}

/**
 * Submit a new visitor du'a to the server (visible to all visitors)
 */
export async function submitVisitorDua(name, message) {
  // Try API first
  const dua = await apiPost('/api/visitor-duas', { name, message });
  // Update local cache
  const cached = getLocal(STORAGE_KEYS.VISITOR_DUAS, []);
  cached.unshift(dua);
  setLocal(STORAGE_KEYS.VISITOR_DUAS, cached);
  return dua;
}

// === Arabic Numeral Formatting ===

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(num) {
  return String(num).replace(/\d/g, (d) => ARABIC_DIGITS[d]);
}

export { STORAGE_KEYS };
