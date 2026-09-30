// Tiny cache (memory + sessionStorage) with a time-to-live, so we don't
// re-download the same data on every page change.
const memory = new Map();
const PREFIX = "naqsh_cache_";

export function getCached(key) {
  const now = Date.now();
  const hit = memory.get(key);
  if (hit && hit.expires > now) return hit.data;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expires > now) {
        memory.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(PREFIX + key);
    }
  } catch {
    /* ignore */
  }
  return null;
}

// Returns stale data too (used as a fallback when the network fails)
export function getStale(key) {
  const hit = memory.get(key);
  if (hit) return hit.data;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw).data : null;
  } catch {
    return null;
  }
}

export function setCached(key, data, ttlMs = 5 * 60 * 1000) {
  const entry = { data, expires: Date.now() + ttlMs };
  memory.set(key, entry);
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota exceeded or unavailable — memory cache still works */
  }
}

export function invalidateCache(key) {
  memory.delete(key);
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
