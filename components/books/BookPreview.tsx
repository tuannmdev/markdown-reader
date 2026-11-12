"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { ImportProgress } from "@/lib/api/importBook";
import type { BookSummary } from "@/lib/api/types";
import type { BookDraft, DraftNode } from "@/lib/book/types";
import styles from "@/components/books/BookPreview.module.css";

export const NEW_BOOK = "new";

interface BookPreviewProps {
  draft: BookDraft;
  title: string;
  skipped: number;
  importing: boolean;
  progress: ImportProgress | null;
  books: BookSummary[];
  target: string;
  onTargetChange: (target: string) => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function progressText(progress: ImportProgress | null): string {
  if (!progress || progress.phase === "preparing") {
    return "Đang chuẩn bị…";
  }
  if (progress.phase === "finishing") {
    return "Đang hoàn tất…";
  }
  return `Đã tải ${progress.done}/${progress.total} trang`;
}

function countNodes(node: DraftNode): number {
  return node.children.reduce((sum, child) => sum + countNodes(child), node.pagePath ? 1 : 0);
}

const VISIBLE_CHAPTERS = 12;

export function BookPreview({
  draft,
  title,
  skipped,
  importing,
  progress,
  books,
  target,
  onTargetChange,
  onTitleChange,
  onSave,
  onCancel,
}: BookPreviewProps) {
  const id = useId();
  const chapters = draft.nodes.filter((node) => node.children.length > 0);
  const shown = chapters.slice(0, VISIBLE_CHAPTERS);

  return (
    <section className={styles.preview} aria-labelledby={`${id}-heading`}>
      <Eyebrow active>Xem trước sách</Eyebrow>
      <h2 id={`${id}-heading`} className={styles.heading}>
        {draft.pages.length} trang đã sẵn sàng
      </h2>
      <p className={styles.note}>
        {draft.usedIndex
          ? `Mục lục được đọc từ ${draft.usedIndex}.`
          : "Không tìm thấy mục lục trong README, nên cấu trúc được lấy từ các thư mục."}
      </p>

      {books.length > 0 ? (
        <div className={styles.field}>
          <label htmlFor={`${id}-target`} className={styles.label}>
            Lưu vào
          </label>
          <select
            id={`${id}-target`}
            className={styles.input}
            value={target}
            disabled={importing}
            onChange={(event) => onTargetChange(event.target.value)}
          >
            <option value={NEW_BOOK}>Tạo sách mới</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                Cập nhật sách: {book.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {target === NEW_BOOK ? (
        <div className={styles.field}>
          <label htmlFor={`${id}-title`} className={styles.label}>
            Tên sách
          </label>
          <input
            id={`${id}-title`}
            className={styles.input}
            value={title}
            disabled={importing}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>
      ) : (
        <p className={styles.note}>
          Các trang mới được thêm, trang đổi nội dung được sửa, trang không còn trong thư mục sẽ bị xóa; mục lục được dựng
          lại. Link chia sẻ và trạng thái công khai được giữ nguyên.
        </p>
      )}

      <dl className={styles.stats}>
        <div>
          <dt>Chương</dt>
          <dd>{chapters.length}</dd>
        </div>
        <div>
          <dt>Trang</dt>
          <dd>{draft.pages.length}</dd>
        </div>
        <div>
          <dt>Link không tìm thấy</dt>
          <dd>{draft.unresolvedLinks.length}</dd>
        </div>
      </dl>
      {skipped > 0 ? <p className={styles.warn}>Đã bỏ qua {skipped} file lớn hơn 5 MB.</p> : null}

      {shown.length > 0 ? (
        <ul className={styles.chapters}>
          {shown.map((chapter) => (
            <li key={chapter.title}>
              <span>{chapter.title}</span>
              <span className={styles.count}>{countNodes(chapter)}</span>
            </li>
          ))}
          {chapters.length > shown.length ? <li className={styles.count}>… và {chapters.length - shown.length} chương nữa</li> : null}
        </ul>
      ) : null}

      {importing ? (
        <p className={styles.note} role="status">
          {progressText(progress)}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button variant="primary" disabled={importing || (target === NEW_BOOK && !title.trim())} onClick={onSave}>
          {importing ? "Đang lưu…" : target === NEW_BOOK ? "Lưu thành sách" : "Cập nhật sách"}
        </Button>
        <Button onClick={onCancel}>{importing ? "Hủy nhập" : "Hủy"}</Button>
      </div>
    </section>
  );
}
