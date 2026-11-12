import styles from "@/components/ui/Tag.module.css";

const DOT_COLORS = [
  "var(--cat-orange)",
  "var(--cat-teal)",
  "var(--cat-blue)",
  "var(--cat-green)",
  "var(--cat-purple)",
  "var(--cat-grey)",
];

function colorFor(label: string): string {
  let hash = 0;
  for (const char of label) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }
  return DOT_COLORS[hash % DOT_COLORS.length];
}

export function Tag({ label }: { label: string }) {
  return (
    <span className={styles.tag}>
      <span className={styles.dot} style={{ background: colorFor(label) }} aria-hidden="true" />
      {label}
    </span>
  );
}
