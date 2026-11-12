import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { stripNode } from "@/lib/stripNode";
import styles from "@/components/docs/MarkdownImage.module.css";

// Spans keep the markup valid inside the paragraph markdown wraps images in.
export function MarkdownImage(props: ComponentProps<"img"> & ExtraProps) {
  const { alt, ...rest } = stripNode(props);

  return (
    <span className={styles.figure}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...rest} alt={alt ?? ""} loading="lazy" decoding="async" className={styles.image} />
      {alt ? <span className={styles.caption}>{alt}</span> : null}
    </span>
  );
}
