"use client";

import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./status.module.css";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={`page ${styles.status}`}>
      <Eyebrow active>Có trục trặc</Eyebrow>
      <h1 className={styles.headline}>Đã xảy ra lỗi.</h1>
      <p className={styles.lead}>Không sao cả. Hãy thử tải lại, hoặc quay về trang chủ.</p>
      <div className={styles.actions}>
        <Button variant="primary" onClick={reset}>
          Thử lại
        </Button>
        <Button href="/">Về trang chủ</Button>
      </div>
    </div>
  );
}
