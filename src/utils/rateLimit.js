// Client-side rate limiter (UX protection). It stops accidental spam and slows
// down casual brute-force attempts. The REAL enforcement is server-side:
// Supabase Auth's built-in limits + the RATE_LIMITED checks in supabase/schema.sql.

export function createRateLimiter({ key, max, windowMs }) {
  const storageKey = `naqsh_rl_${key}`;

  const read = () => {
    try {
      const list = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const now = Date.now();
      return Array.isArray(list) ? list.filter((t) => now - t < windowMs) : [];
    } catch {
      return [];
    }
  };

  const write = (list) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch {
      /* storage unavailable — limiter simply becomes a no-op */
    }
  };

  return {
    // { allowed, retryAfterMs }
    check() {
      const hits = read();
      if (hits.length < max) return { allowed: true, retryAfterMs: 0 };
      return { allowed: false, retryAfterMs: Math.max(0, windowMs - (Date.now() - hits[0])) };
    },
    hit() {
      write([...read(), Date.now()]);
    },
    reset() {
      write([]);
    },
  };
}

export function formatWait(ms) {
  const s = Math.ceil(ms / 1000);
  if (s < 60) return `${s} second${s === 1 ? "" : "s"}`;
  const m = Math.ceil(s / 60);
  return `${m} minute${m === 1 ? "" : "s"}`;
}

// Shared limiters used across the app
export const limiters = {
  login: createRateLimiter({ key: "login", max: 5, windowMs: 5 * 60 * 1000 }), // failed attempts only
  register: createRateLimiter({ key: "register", max: 5, windowMs: 30 * 60 * 1000 }),
  passwordReset: createRateLimiter({ key: "pwreset", max: 3, windowMs: 10 * 60 * 1000 }),
  contact: createRateLimiter({ key: "contact", max: 3, windowMs: 10 * 60 * 1000 }),
  newsletter: createRateLimiter({ key: "newsletter", max: 3, windowMs: 10 * 60 * 1000 }),
  promo: createRateLimiter({ key: "promo", max: 8, windowMs: 5 * 60 * 1000 }),
  review: createRateLimiter({ key: "review", max: 5, windowMs: 10 * 60 * 1000 }),
  order: createRateLimiter({ key: "order", max: 5, windowMs: 10 * 60 * 1000 }),
};
