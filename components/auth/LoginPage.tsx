"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/components/auth/useAuth";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { safeNext } from "@/lib/auth/safeNext";
import styles from "@/components/auth/LoginForm.module.css";

export function LoginPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "signedIn") {
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
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
  if (status === "signedOut") {
    return <LoginForm />;
  }
  return (
    <div className={`page ${styles.status}`}>
      <Eyebrow>{status === "signedIn" ? "Đang chuyển trang…" : "Đang kiểm tra phiên đăng nhập…"}</Eyebrow>
    </div>
  );
}
