import Link from "next/link";
import styles from "@/components/docs/Breadcrumb.module.css";

interface BreadcrumbProps {
  firstDocHref: string;
  folders: string[];
  title: string;
  rootLabel?: string;
}

export function Breadcrumb({ firstDocHref, folders, title, rootLabel = "Tài liệu" }: BreadcrumbProps) {
  return (
    <nav aria-label="Đường dẫn" className={styles.nav}>
      <ol className={styles.list}>
        <li>
          <Link href={firstDocHref} className={styles.link}>
            {rootLabel}
          </Link>
        </li>
        {folders.map((folder) => (
          <li key={folder}>{folder}</li>
        ))}
        <li aria-current="page" className={styles.current}>
          {title}
        </li>
      </ol>
    </nav>
  );
}
