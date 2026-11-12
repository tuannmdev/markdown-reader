import { Brand } from "@/components/site/Brand";
import { NavLinks } from "@/components/site/NavLinks";
import { ReadingPrefs } from "@/components/docs/ReadingPrefs";
import styles from "@/components/site/Header.module.css";

export function Header({ firstDocHref }: { firstDocHref: string }) {
  return (
    <header className={styles.header}>
      <div className={`page ${styles.inner}`}>
        <Brand />
        <div className={styles.actions}>
          <NavLinks firstDocHref={firstDocHref} />
          <ReadingPrefs />
        </div>
      </div>
    </header>
  );
}
