"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext, type AuthStatus, type AuthValue } from "@/components/auth/AuthContext";
import { getSupabase, isSupabaseConfigured } from "@/lib/auth/supabaseBrowser";

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<{ ready: boolean; user: User | null }>({ ready: false, user: null });

  useEffect(() => {
    if (!configured) {
      return;
    }
    const supabase = getSupabase();
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) {
          setSession({ ready: true, user: data.session?.user ?? null });
        }
      })
      .catch(() => {
        // A broken or unreadable session must not leave the app stuck in "loading".
        if (!cancelled) {
          setSession({ ready: true, user: null });
        }
      });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession({ ready: true, user: next?.user ?? null });
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (!error) {
      return null;
    }
    return error.status === 400 ? "Email hoặc mật khẩu không đúng." : "Không đăng nhập được. Hãy thử lại.";
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await getSupabase().auth.signOut();
  }, []);

  const status: AuthStatus = !configured
    ? "unconfigured"
    : !session.ready
      ? "loading"
      : session.user
        ? "signedIn"
        : "signedOut";

  const value = useMemo<AuthValue>(
    () => ({ status, user: session.user, signIn, signOut }),
    [status, session.user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
