import { Button } from "@/components/ui/Button";
import { IconArrowLeft } from "@/components/ui/IconArrowLeft";
import { IconArrowRight } from "@/components/ui/IconArrowRight";
import styles from "@/components/docs/PrevNext.module.css";

interface PageLink {
  href: string;
  title: string;
}

interface PrevNextProps {
  prev?: PageLink;
  next?: PageLink;
}

export function PrevNext({ prev, next }: PrevNextProps) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav aria-label="Tài liệu trước và sau" className={styles.nav}>
      <div className={styles.slot}>
        {prev ? (
          <>
            <span className={styles.label}>Trước đó</span>
            <Button href={prev.href} icon={<IconArrowLeft />} className={styles.button}>
              {prev.title}
            </Button>
          </>
        ) : null}
      </div>
      <div className={`${styles.slot} ${styles.right}`}>
        {next ? (
          <>
            <span className={styles.label}>Tiếp theo</span>
            <Button href={next.href} variant="primary" icon={<IconArrowRight />} className={`${styles.button} ${styles.reverse}`}>
              {next.title}
            </Button>
          </>
        ) : null}
      </div>
    </nav>
  );
}
