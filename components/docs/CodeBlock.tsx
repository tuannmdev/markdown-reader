"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ComponentProps } from "react";
import { IconCheck } from "@/components/ui/IconCheck";
import { IconCopy } from "@/components/ui/IconCopy";
import styles from "@/components/docs/CodeBlock.module.css";

function languageOf(children: ComponentProps<"pre">["children"]): string {
  for (const child of Children.toArray(children)) {
    if (isValidElement<{ className?: string }>(child)) {
      const found = /language-([\w+-]+)/.exec(child.props.className ?? "");
      if (found) {
        return found[1];
      }
    }
  }
  return "text";
}

function legacyCopy(text: string): void {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) {
    throw new Error("copy failed");
  }
}

export function CodeBlock({ children }: ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(): Promise<void> {
    const text = preRef.current?.textContent ?? "";
    try {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        legacyCopy(text);
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.block}>
      <div className={styles.bar}>
        <span className={styles.lang}>{languageOf(children)}</span>
        <button
          type="button"
          className={[styles.copy, copied ? styles.done : ""].filter(Boolean).join(" ")}
          onClick={copy}
        >
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          <span aria-live="polite">{copied ? "Đã sao chép" : "Sao chép"}</span>
        </button>
      </div>
      <pre ref={preRef} tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}
