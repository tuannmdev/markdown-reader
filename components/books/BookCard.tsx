"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/IconTrash";
import type { BookSummary } from "@/lib/api/types";
import { readHref } from "@/lib/book/tree";
import styles from "@/components/books/BookCard.module.css";

interface BookCardProps {
  book: BookSummary;
  canWrite: boolean;
  onDelete: (id: string) => void;
  onTogglePublic: (id: string, isPublic: boolean) => Promise<void>;
}

export function BookCard({ book, canWrite, onDelete, onTogglePublic }: BookCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}${readHref("public", book.id)}`;
  const manage = canWrite && book.isOwner;

  async function toggleShare(): Promise<void> {
    setSharing(true);
    setCopied(false);
    try {
      await onTogglePublic(book.id, !book.isPublic);
    } finally {
      setSharing(false);
    }
  }

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={styles.card}>
      <p className={styles.meta}>
        {book.pageCount} trang · {new Date(book.createdAt).toLocaleDateString("vi-VN")}
        {book.isPublic ? " · Công khai" : ""}
      </p>
      <h3 className={styles.title}>{book.title}</h3>
      {book.description ? <p className={styles.description}>{book.description}</p> : null}
      {book.isPublic && manage ? (
        <div className={styles.share}>
          <input className={styles.shareInput} readOnly value={shareUrl} aria-label="Link chia sẻ" />
          <Button size="sm" onClick={() => void copyLink()}>
            {copied ? "Đã sao chép" : "Sao chép link"}
          </Button>
        </div>
      ) : null}
      <div className={styles.actions}>
        <Button href={readHref("private", book.id)} variant="primary" size="sm">
          Đọc sách
        </Button>
        {manage ? (
          <Button size="sm" disabled={sharing} onClick={() => void toggleShare()}>
            {book.isPublic ? "Tắt chia sẻ" : "Chia sẻ công khai"}
          </Button>
        ) : null}
        {manage && confirming ? (
          <>
            <Button size="sm" onClick={() => onDelete(book.id)}>
              Xác nhận xóa
            </Button>
            <Button size="sm" variant="dashed" onClick={() => setConfirming(false)}>
              Hủy
            </Button>
          </>
        ) : manage ? (
          <Button size="sm" icon={<IconTrash />} onClick={() => setConfirming(true)}>
            Xóa
          </Button>
        ) : null}
      </div>
    </article>
  );
}
