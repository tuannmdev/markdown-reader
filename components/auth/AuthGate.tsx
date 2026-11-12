"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "@/components/auth/LoginForm.module.css";

// Renders children only for a signed-in user; anyone else is sent to the login page and brought back after.
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "signedOut") {
      const here = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    }
  }, [status, router]);

  if (status === "unconfigured") {
    return (
      <div className={`page ${styles.status}`}>
        <Eyebrow active>Chưa cấu hình</Eyebrow>
        <p>Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY (xem .env.example).</p>
      </div>
    );
  }
  if (status !== "signedIn") {
    return (
      <div className={`page ${styles.status}`}>
        <Eyebrow>{status === "loading" ? "Đang kiểm tra phiên đăng nhập…" : "Đang chuyển tới trang đăng nhập…"}</Eyebrow>
      </div>
    );
  }
  return <>{children}</>;
}
