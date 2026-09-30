/* eslint-disable react-refresh/only-export-components -- context + hook live together on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import * as auth from "../services/authService";

const AuthContext = createContext(null);

export const SIGNED_OUT_EVENT = "naqsh:signed-out";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(isSupabaseConfigured);
  const [profileState, setProfileState] = useState({ userId: null, profile: null });

  // Restore the session + listen for sign in / sign out / token refresh.
  useEffect(() => {
    if (!supabase) return undefined;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    // NOTE: keep this callback synchronous (no awaiting Supabase calls inside it).
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "SIGNED_OUT") window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  // Load the user's profile (name, phone, role...) whenever the user changes.
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    auth
      .fetchProfile(userId)
      .then((profile) => !cancelled && setProfileState({ userId, profile }))
      .catch(() => !cancelled && setProfileState({ userId, profile: null }));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = profileState.userId === userId ? profileState.profile : null;
  const profileLoading = Boolean(userId) && profileState.userId !== userId;

  const updateProfile = useCallback(
    async (values) => {
      const updated = await auth.updateProfile(userId, values);
      setProfileState({ userId, profile: updated });
      return updated;
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isAuthenticated: Boolean(user),
      isAdmin: profile?.role === "admin",
      loading: initializing,
      profileLoading,
      signUp: auth.signUp,
      signIn: auth.signIn,
      signOut: auth.signOut,
      sendPasswordReset: auth.sendPasswordReset,
      updatePassword: auth.updatePassword,
      updateProfile,
    }),
    [session, user, profile, initializing, profileLoading, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
