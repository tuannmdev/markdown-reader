"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type DragEvent } from "react";
import { ArticleBody } from "@/components/docs/ArticleBody";
import { FrontmatterTable } from "@/components/docs/FrontmatterTable";
import { parseFrontmatter } from "@/lib/frontmatter";
import { Button } from "@/components/ui/Button";
import { IconTrash } from "@/components/ui/IconTrash";
import { IconUpload } from "@/components/ui/IconUpload";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { addToHistory, clearHistory, historyStore } from "@/lib/history";
import styles from "@/components/open/OpenReader.module.css";

const MAX_BYTES = 5 * 1024 * 1024;
const MARKDOWN_NAME = /\.(md|markdown|mdx|txt)$/i;

interface OpenDocument {
  name: string;
  content: string;
}

export function OpenReader() {
  const history = useSyncExternalStore(historyStore.subscribe, historyStore.getSnapshot, historyStore.getServerSnapshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState<OpenDocument | null>(null);
  const [draft, setDraft] = useState("");
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  const frontmatter = useMemo(() => parseFrontmatter(current?.content ?? ""), [current]);

  function show(name: string, content: string): void {
    setCurrent({ name, content });
    setMessage("");
    addToHistory(name, content);
  }

  async function readFile(file: File | undefined): Promise<void> {
    if (!file) {
      return;
    }
    if (!MARKDOWN_NAME.test(file.name) && !file.type.startsWith("text/")) {
      setMessage("Chỉ hỗ trợ file Markdown (.md) hoặc văn bản thuần.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage("File lớn hơn 5 MB, hãy thử một file nhỏ hơn.");
      return;
    }
    try {
      show(file.name, await file.text());
    } catch {
      setMessage("Không đọc được file này.");
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setDragging(false);
    void readFile(event.dataTransfer.files[0]);
  }

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.header}>
        <Eyebrow active>Mở file</Eyebrow>
        <h1 className={styles.title}>Mở file .md</h1>
        <p className={styles.lead}>File được đọc ngay trong trình duyệt của bạn và không bao giờ được tải lên máy chủ.</p>
      </header>

      <div className={styles.inputs}>
        <div
          className={[styles.drop, dragging ? styles.dragging : ""].filter(Boolean).join(" ")}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <IconUpload size={28} />
          <p className={styles.dropText}>Kéo thả file .md vào đây</p>
          <Button variant="dashed" onClick={() => inputRef.current?.click()}>
            Chọn file .md
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".md,.markdown,.mdx,.txt,text/markdown,text/plain"
            className="sr-only"
            tabIndex={-1}
            aria-label="Chọn file Markdown"
            onChange={(event) => {
              void readFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>

        <form
          className={styles.paste}
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim()) {
              show("Văn bản dán", draft);
            }
          }}
        >
          <label htmlFor="paste-markdown" className={styles.label}>
            Hoặc dán Markdown
          </label>
          <textarea
            id="paste-markdown"
            className={styles.textarea}
            rows={6}
            placeholder="# Tiêu đề&#10;&#10;Nội dung…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div>
            <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
              Hiển thị
            </Button>
          </div>
        </form>
      </div>

      <p className={styles.message} role="status">
        {message}
      </p>

      <section className={styles.history} aria-labelledby="history-title">
        <div className={styles.historyHead}>
          <h2 id="history-title" className={styles.label}>
            Đã mở gần đây
          </h2>
          {history.length > 0 ? (
            <Button variant="secondary" size="sm" icon={<IconTrash />} onClick={clearHistory}>
              Xóa lịch sử
            </Button>
          ) : null}
        </div>
        {history.length > 0 ? (
          <ul className={styles.historyList}>
            {history.map((entry) => {
              const active = current?.name === entry.name && current.content === entry.content;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={[styles.historyItem, active ? styles.historyActive : ""].filter(Boolean).join(" ")}
                    aria-pressed={active}
                    onClick={() => show(entry.name, entry.content)}
                  >
                    {entry.name}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.muted}>Chưa có file nào.</p>
        )}
      </section>

      {current ? (
        <section className={styles.result} aria-label={`Nội dung ${current.name}`}>
          <Eyebrow>{current.name}</Eyebrow>
          <div className={styles.article}>
            <FrontmatterTable entries={frontmatter.entries} />
            <ArticleBody>{frontmatter.body}</ArticleBody>
          </div>
        </section>
      ) : null}
    </div>
  );
}
