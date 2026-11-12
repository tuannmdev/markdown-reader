"use client";

import { useId, useState, type FormEvent } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "@/components/auth/LoginForm.module.css";

export function LoginForm() {
  const id = useId();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");
    const message = await signIn(email.trim(), password);
    if (message) {
      setError(message);
      setBusy(false);
    }
  }

  return (
    <div className={`page ${styles.wrap}`}>
      <Eyebrow active>Đăng nhập</Eyebrow>
      <h1 className={styles.title}>Chào mừng trở lại</h1>
      <p className={styles.note}>
        Đăng nhập để nhập và quản lý sách của bạn. Không cần tài khoản để đọc một cuốn sách mà chủ sách đã chia sẻ công khai.
      </p>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`} className={styles.label}>
            Email
          </label>
          <input
            id={`${id}-email`}
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-password`} className={styles.label}>
            Mật khẩu
          </label>
          <input
            id={`${id}-password`}
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <p className={styles.error} role="alert">
          {error}
        </p>
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
