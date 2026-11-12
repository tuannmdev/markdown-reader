import styles from "@/components/site/SkipLink.module.css";

export function SkipLink() {
  return (
    <a href="#main" className={styles.skip}>
      Bỏ qua đến nội dung
    </a>
  );
}
