import { requireSupabase } from "../supabase/client";
import { isUniqueViolation } from "../utils/errors";

// NOTE: no .select() after insert on purpose — visitors may insert but never read.
export async function submitContactMessage({ name, email, subject, message }) {
  const { error } = await requireSupabase()
    .from("contact_messages")
    .insert({ name, email, subject, message });
  if (error) throw error;
}

// Returns "subscribed" or "exists"
export async function subscribeNewsletter(email) {
  const { error } = await requireSupabase().from("newsletter_subscribers").insert({ email });
  if (error) {
    if (isUniqueViolation(error)) return "exists";
    throw error;
  }
  return "subscribed";
}
