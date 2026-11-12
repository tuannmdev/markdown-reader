import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import styles from "./status.module.css";

export const metadata: Metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <div className={`page ${styles.status}`}>
      <Eyebrow active>Lỗi 404</Eyebrow>
      <h1 className={styles.headline}>Không tìm thấy trang này.</h1>
      <p className={styles.lead}>Đường dẫn có thể đã đổi hoặc tài liệu chưa được xuất bản. Bạn có thể quay lại trang chủ.</p>
      <Button href="/" variant="primary">
        Về trang chủ
      </Button>
    </div>
  );
}
