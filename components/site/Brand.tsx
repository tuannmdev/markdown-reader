import Link from "next/link";
import styles from "@/components/site/Brand.module.css";

export function Brand() {
  return (
    <Link href="/" className={styles.brand} aria-label="Markdown Reader, về trang chủ">
      <span className={styles.mark} aria-hidden="true" />
      <span className={styles.name}>Markdown Reader</span>
    </Link>
  );
}
