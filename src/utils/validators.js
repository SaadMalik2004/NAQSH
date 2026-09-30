// Input validation helpers. The database re-checks everything (CHECK constraints
// + place_order()), this file gives users instant, friendly feedback.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

// Remove control characters, collapse whitespace, trim and cap the length.
export function clean(value, max = 500) {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// Same as clean() but keeps line breaks (for message boxes).
export function cleanMultiline(value, max = 2000) {
  return String(value ?? "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

export const required = (label) => (v) =>
  clean(v).length === 0 ? `${label} is required` : "";

export const minLen = (label, n) => (v) =>
  clean(v).length < n ? `${label} must be at least ${n} characters` : "";

export const maxLen = (label, n) => (v) =>
  String(v ?? "").length > n ? `${label} must be at most ${n} characters` : "";

export const email = (v) => {
  const value = clean(v, 254);
  if (!value) return "Email is required";
  return EMAIL_RE.test(value) ? "" : "Enter a valid email address";
};

export const phone = (v) => {
  const value = clean(v, 30);
  if (!value) return "Phone number is required";
  return PHONE_RE.test(value) ? "" : "Enter a valid phone number (e.g. +92 300 1234567)";
};

export const password = (v) => {
  const value = String(v ?? "");
  if (!value) return "Password is required";
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 72) return "Password must be at most 72 characters";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
    return "Use at least one letter and one number";
  return "";
};

// Run several validators for one field; return the first error message.
export const all =
  (...fns) =>
  (v, values) => {
    for (const fn of fns) {
      const msg = fn(v, values);
      if (msg) return msg;
    }
    return "";
  };

// validate(values, { field: validatorFn }) -> { field: "message" } (empty = valid)
export function validate(values, schema) {
  const errors = {};
  for (const [field, fn] of Object.entries(schema)) {
    const msg = fn(values[field], values);
    if (msg) errors[field] = msg;
  }
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;

// 0–4 strength score for the password meter
export function passwordStrength(v) {
  const value = String(v ?? "");
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

// Delivery address rules (shared by checkout + profile)
export const addressSchema = {
  fullName: all(required("Full name"), minLen("Full name", 2), maxLen("Full name", 100)),
  phone,
  address: all(required("Address"), minLen("Address", 5), maxLen("Address", 200)),
  city: all(required("City"), minLen("City", 2), maxLen("City", 80)),
  postalCode: all(required("Postal code"), minLen("Postal code", 3), maxLen("Postal code", 12)),
  country: all(required("Country"), minLen("Country", 2), maxLen("Country", 60)),
};
