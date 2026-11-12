import type { ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { stripNode } from "@/lib/stripNode";
import styles from "@/components/docs/MarkdownTable.module.css";

export function MarkdownTable(props: ComponentProps<"table"> & ExtraProps) {
  const { children, ...rest } = stripNode(props);

  return (
    <div className={styles.wrapper} role="region" aria-label="Bảng dữ liệu" tabIndex={0}>
      <table {...rest}>{children}</table>
    </div>
  );
}
