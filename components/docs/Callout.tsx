import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { stripNode } from "@/lib/stripNode";
import styles from "@/components/docs/Callout.module.css";

const KINDS: Record<string, { label: string; className: string }> = {
  note: { label: "Ghi chú", className: styles.note },
  tip: { label: "Mẹo", className: styles.tip },
  warning: { label: "Cảnh báo", className: styles.warning },
  important: { label: "Quan trọng", className: styles.important },
  caution: { label: "Thận trọng", className: styles.caution },
};

// Renders a blockquote; when the rehypeCallouts plugin tagged it, renders a GitHub-style alert.
export function Callout(props: ComponentProps<"blockquote"> & ExtraProps) {
  const { children, ...rest } = stripNode(props);
  const kindKey = (rest as Record<string, unknown>)["data-callout"];
  const kind = typeof kindKey === "string" ? KINDS[kindKey] : undefined;

  if (!kind) {
    return <blockquote {...rest}>{children}</blockquote>;
  }

  return (
    <aside className={`${styles.callout} ${kind.className}`} aria-label={kind.label}>
      <p className={styles.label}>{kind.label}</p>
      {children}
    </aside>
  );
}
