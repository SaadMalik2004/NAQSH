import { requireSupabase } from "../supabase/client";

export async function signUp({ fullName, email, password }) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  // If email confirmation is ON, Supabase returns a user but no session.
  // When the email already exists it returns a user with an empty identities list.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("User already registered");
  }
  return { needsEmailConfirmation: !data.session };
}

export async function signIn({ email, password }) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword) {
  const { error } = await requireSupabase().auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .select("id, full_name, phone, preferred_size, silhouette, role")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, values) {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .update(values)
    .eq("id", userId)
    .select("id, full_name, phone, preferred_size, silhouette, role")
    .single();
  if (error) throw error;
  return data;
}
