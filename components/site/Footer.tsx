import styles from "@/components/site/Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.inner}`}>
        <p className={styles.text}>Markdown Reader</p>
        <p className={styles.text}>Tài liệu được đọc ngay trên máy bạn, không tải lên đâu cả.</p>
      </div>
    </footer>
  );
}
