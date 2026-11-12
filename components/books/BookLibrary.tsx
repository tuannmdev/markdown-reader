"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { BookCard } from "@/components/books/BookCard";
import { BookPreview, NEW_BOOK } from "@/components/books/BookPreview";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconUpload } from "@/components/ui/IconUpload";
import { ApiError } from "@/lib/api/ApiError";
import { getApi } from "@/lib/api/browserApi";
import { errorMessage } from "@/lib/api/errorMessage";
import { importBook, type ImportProgress } from "@/lib/api/importBook";
import { loadMyBooks } from "@/lib/api/loadMyBooks";
import type { BookSummary, ImportSummary } from "@/lib/api/types";
import { buildBook } from "@/lib/book/buildBook";
import {
  folderNameOf,
  fromDataTransfer,
  fromFileList,
  readSources,
  type PickedFile,
} from "@/lib/book/readFolder";
import type { BookDraft } from "@/lib/book/types";
import styles from "@/components/books/BookLibrary.module.css";

interface Pending {
  draft: BookDraft;
  title: string;
  skipped: number;
}

function summaryText(title: string, summary: ImportSummary): string {
  return `Đã cập nhật "${title}": thêm ${summary.added}, sửa ${summary.updated}, xóa ${summary.removed}, giữ nguyên ${summary.unchanged} trang.`;
}

export function BookLibrary() {
  const { signOut } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [books, setBooks] = useState<BookSummary[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [target, setTarget] = useState(NEW_BOOK);
  const [reading, setReading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  function handleError(error: unknown, write: boolean): void {
    if (error instanceof ApiError && error.status === 401) {
      void signOut();
      return;
    }
    if (write && error instanceof ApiError && error.status === 403) {
      setReadOnly(true);
    }
    setMessage(errorMessage(error));
  }

  useEffect(() => {
    let cancelled = false;
    loadMyBooks(getApi())
      .then((result) => {
        if (!cancelled) {
          setBooks(result);
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          void signOut();
        } else if (error instanceof ApiError && error.code === "not_member") {
          setDenied(true);
          setBooks([]);
        } else {
          setBooks([]);
          setMessage(errorMessage(error));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [signOut]);

  async function refresh(): Promise<void> {
    try {
      setBooks(await getApi().listBooks());
    } catch (error) {
      handleError(error, false);
    }
  }

  async function prepare(picked: PickedFile[], folderName: string): Promise<void> {
    setReading(true);
    setMessage("");
    try {
      const { sources, skipped } = await readSources(picked);
      if (sources.length === 0) {
        setMessage("Không tìm thấy file .md nào trong thư mục này.");
        return;
      }
      const draft = buildBook(sources, folderName);
      if (draft.pages.length === 0) {
        setMessage("Không dựng được trang nào từ thư mục này.");
        return;
      }
      setTarget(NEW_BOOK);
      setPending({ draft, title: draft.title, skipped });
    } catch {
      setMessage("Không đọc được thư mục này.");
    } finally {
      setReading(false);
    }
  }

  async function onDrop(event: DragEvent<HTMLDivElement>): Promise<void> {
    event.preventDefault();
    setDragging(false);
    try {
      const { files, folderName } = await fromDataTransfer(event.dataTransfer);
      await prepare(files, folderName);
    } catch {
      setMessage("Không đọc được thư mục được thả vào.");
    }
  }

  async function save(): Promise<void> {
    if (!pending) {
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setImporting(true);
    setProgress(null);
    setMessage("");
    try {
      const title = pending.title.trim();
      const result = await importBook(getApi(), {
        bookId: target === NEW_BOOK ? undefined : target,
        title,
        description: pending.draft.description,
        pages: pending.draft.pages,
        nodes: pending.draft.nodes,
        onProgress: setProgress,
        signal: controller.signal,
      });
      setPending(null);
      setMessage(
        result.summary && target !== NEW_BOOK
          ? summaryText(result.book.title, result.summary)
          : `Đã lưu "${result.book.title}" với ${result.book.pageCount} trang.`,
      );
      await refresh();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("Đã hủy nhập sách. Sách không bị thay đổi.");
      } else {
        handleError(error, true);
      }
    } finally {
      controllerRef.current = null;
      setImporting(false);
    }
  }

  function cancel(): void {
    if (importing) {
      controllerRef.current?.abort();
    } else {
      setPending(null);
    }
  }

  async function remove(id: string): Promise<void> {
    try {
      await getApi().deleteBook(id);
      setMessage("Đã xóa sách.");
      await refresh();
    } catch (error) {
      handleError(error, true);
    }
  }

  async function togglePublic(id: string, isPublic: boolean): Promise<void> {
    try {
      const updated = await getApi().updateBook({ bookId: id, isPublic });
      setBooks((current) => current?.map((book) => (book.id === id ? updated : book)) ?? current);
      setMessage(isPublic ? "Sách đã được chia sẻ công khai." : "Đã tắt chia sẻ công khai.");
    } catch (error) {
      handleError(error, true);
    }
  }

  if (denied) {
    return (
      <div className={`page ${styles.page}`}>
        <Eyebrow active>Chưa được cấp quyền</Eyebrow>
        <h1 className={styles.title}>Chưa có quyền truy cập</h1>
        <p className={styles.lead}>
          Tài khoản chưa được cấp quyền dùng Markdown Reader, hãy liên hệ quản trị viên.
        </p>
      </div>
    );
  }

  const ownBooks = (books ?? []).filter((book) => book.isOwner);

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.header}>
        <Eyebrow active>Thư viện sách</Eyebrow>
        <h1 className={styles.title}>Sách của bạn</h1>
        <p className={styles.lead}>
          Chọn một thư mục chứa file Markdown để dựng thành sách. Mục lục lấy từ README.md; sách được lưu trên máy chủ, gắn
          với tài khoản của bạn, và có thể chia sẻ công khai bằng một đường link.
        </p>
      </header>

      {readOnly ? (
        <p className={styles.message}>Tài khoản của bạn chỉ có quyền đọc, nên không thể nhập hay sửa sách.</p>
      ) : (
        <div
          className={[styles.drop, dragging ? styles.dragging : ""].filter(Boolean).join(" ")}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => void onDrop(event)}
        >
          <IconUpload size={28} />
          <p>Kéo thả thư mục vào đây</p>
          <Button variant="dashed" disabled={reading || importing} onClick={() => inputRef.current?.click()}>
            {reading ? "Đang đọc thư mục…" : "Chọn thư mục"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label="Chọn thư mục sách"
            {...({ webkitdirectory: "" } as object)}
            onChange={(event) => {
              const list = event.target.files;
              if (list && list.length > 0) {
                void prepare(fromFileList(list), folderNameOf(list));
              }
              event.target.value = "";
            }}
          />
        </div>
      )}

      <p className={styles.message} role="status">
        {message}
      </p>

      {pending && !readOnly ? (
        <BookPreview
          draft={pending.draft}
          title={pending.title}
          skipped={pending.skipped}
          importing={importing}
          progress={progress}
          books={ownBooks}
          target={target}
          onTargetChange={setTarget}
          onTitleChange={(title) => setPending({ ...pending, title })}
          onSave={() => void save()}
          onCancel={cancel}
        />
      ) : null}

      <section className={styles.library} aria-labelledby="library-title">
        <h2 id="library-title" className={styles.sectionTitle}>
          Đã lưu
        </h2>
        {books === null ? (
          <p className={styles.muted}>Đang tải…</p>
        ) : books.length === 0 ? (
          <p className={styles.muted}>Chưa có cuốn sách nào.</p>
        ) : (
          <ul className={styles.grid}>
            {books.map((book) => (
              <li key={book.id}>
                <BookCard
                  book={book}
                  canWrite={!readOnly}
                  onDelete={(id) => void remove(id)}
                  onTogglePublic={togglePublic}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
