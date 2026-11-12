"use client";

import { useContext } from "react";
import { AuthContext, type AuthValue } from "@/components/auth/AuthContext";

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  }
  return value;
}
