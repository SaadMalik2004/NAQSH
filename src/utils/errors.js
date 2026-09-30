// Turn technical errors into messages that are safe and helpful to show users.
// The raw error is only logged to the console during development.

const GENERIC = "Something went wrong. Please try again.";
const NETWORK = "We can't reach the server. Please check your internet connection and try again.";
const RATE = "Too many attempts. Please wait a few minutes and try again.";

export function getErrorMessage(error, fallback = GENERIC) {
  if (import.meta.env.DEV && error) console.error("[NAQSH]", error);

  if (typeof navigator !== "undefined" && navigator.onLine === false) return NETWORK;

  const raw = String(error?.message ?? error ?? "");
  const code = String(error?.code ?? "");
  const status = error?.status;

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) return NETWORK;
  if (raw === "BACKEND_NOT_CONFIGURED")
    return "The store backend isn't connected yet. Add your Supabase keys to the .env file.";

  // --- authentication ---
  if (/invalid login credentials/i.test(raw)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(raw)) return "Please confirm your email first — check your inbox for the link.";
  if (/user already registered|already been registered/i.test(raw))
    return "An account with this email already exists. Try signing in instead.";
  if (/rate limit|too many requests/i.test(raw) || status === 429 || code === "over_email_send_rate_limit")
    return RATE;
  if (/password should be at least|weak password/i.test(raw))
    return "That password is too weak. Use at least 8 characters with letters and numbers.";
  if (/different from the old password/i.test(raw))
    return "Your new password must be different from the old one.";
  if (/auth session missing|jwt expired|invalid jwt/i.test(raw))
    return "Your session has expired. Please sign in again.";
  if (/signup.*disabled/i.test(raw)) return "New sign-ups are currently disabled.";

  // --- errors raised by our database functions (see supabase/schema.sql) ---
  if (raw.includes("NOT_AUTHENTICATED")) return "Please sign in to continue.";
  if (raw.includes("RATE_LIMITED")) return RATE;
  if (raw.includes("OUT_OF_STOCK:")) {
    const name = raw.split("OUT_OF_STOCK:")[1]?.split("\n")[0]?.trim();
    return `Sorry, "${name}" doesn't have enough stock for your quantity. Please lower it and try again.`;
  }
  if (raw.includes("INVALID_SIZE:")) {
    const name = raw.split("INVALID_SIZE:")[1]?.split("\n")[0]?.trim();
    return `The selected size for "${name}" is no longer available. Please re-add it to your bag.`;
  }
  if (raw.includes("PRODUCT_UNAVAILABLE"))
    return "One of the items in your bag is no longer available. Please review your bag.";
  if (raw.includes("INVALID_PROMO")) return "That promo code isn't valid for this order.";
  if (raw.includes("INVALID_SHIPPING")) return "Please double-check your delivery details.";
  if (raw.includes("INVALID_ITEMS")) return "Your bag has an invalid item or quantity. Please review it.";
  if (raw.includes("INVALID_PAYMENT")) return "Please choose a valid payment method.";
  if (raw.includes("ORDER_NOT_CANCELLABLE")) return "This order can no longer be cancelled.";
  if (raw.includes("ORDER_NOT_FOUND")) return "We couldn't find that order.";
  if (raw.includes("ORDER_CANCELLED")) return "A cancelled order can't be changed.";
  if (raw.includes("ADDRESS_LIMIT")) return "You can save up to 10 addresses. Please delete one first.";

  // --- database / permissions ---
  if (code === "42501" || /row-level security|permission denied/i.test(raw))
    return "You don't have permission to do that.";
  if (code === "23505") return "That already exists.";
  if (code === "23514") return "Some of the information you entered isn't valid. Please check and try again.";
  if (code === "PGRST116") return "We couldn't find what you were looking for.";

  return fallback;
}

export const isUniqueViolation = (error) => error?.code === "23505";
