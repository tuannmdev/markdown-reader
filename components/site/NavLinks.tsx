"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/useAuth";
import styles from "@/components/site/NavLinks.module.css";

export function NavLinks({ firstDocHref }: { firstDocHref: string }) {
  const pathname = usePathname();
  const { status, signOut } = useAuth();
  const links = [
    { href: firstDocHref, label: "Tài liệu", active: pathname.startsWith("/docs"), show: true },
    // Books (create/update/delete) belong to signed-in users; everyone else sees a login link.
    { href: "/books", label: "Sách", active: pathname.startsWith("/books"), show: status === "signedIn" },
    {
      href: "/login",
      label: "Đăng nhập",
      active: pathname.startsWith("/login"),
      show: status !== "signedIn",
    },
    { href: "/open", label: "Mở file", active: pathname.startsWith("/open"), show: true },
  ].filter((link) => link.show);

  return (
    <nav aria-label="Điều hướng chính">
      <ul className={styles.list}>
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className={[styles.link, link.active ? styles.active : ""].filter(Boolean).join(" ")}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
        {status === "signedIn" ? (
          <li>
            <button type="button" className={styles.link} onClick={() => void signOut()}>
              Đăng xuất
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
