"use client";

import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export type AuthStatus = "loading" | "signedOut" | "signedIn" | "unconfigured";

export interface AuthValue {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthValue | null>(null);
