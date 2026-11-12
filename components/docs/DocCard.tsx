import Link from "next/link";
import { Tag } from "@/components/ui/Tag";
import type { DocMeta } from "@/lib/types";
import styles from "@/components/docs/DocCard.module.css";

export function DocCard({ doc }: { doc: DocMeta }) {
  return (
    <Link href={doc.href} className={styles.card}>
      <span className={styles.meta}>
        {[...doc.folders, `~${doc.readingMinutes} phút đọc`].join(" · ")}
      </span>
      <span className={styles.title}>{doc.title}</span>
      {doc.description ? <span className={styles.description}>{doc.description}</span> : null}
      {doc.tags.length > 0 ? (
        <span className={styles.tags}>
          {doc.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </span>
      ) : null}
    </Link>
  );
}
