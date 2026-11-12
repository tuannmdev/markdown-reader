import fs from "node:fs";
import path from "node:path";
import { DocCard } from "@/components/docs/DocCard";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getDocMetas } from "@/lib/content";
import styles from "./page.module.css";

export default function HomePage() {
  const docs = getDocMetas();
  const hasIllustration = fs.existsSync(path.join(process.cwd(), "public", "deep-work.svg"));

  return (
    <div className="page">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.copy}>
          <Eyebrow active>Markdown Reader</Eyebrow>
          <h1 id="hero-title" className={styles.headline}>
            Đọc tài liệu. <span className={styles.accent}>Tập trung hơn.</span>
          </h1>
          <p className={styles.lead}>
            Một nơi yên tĩnh để đọc Markdown: nền tối dịu mắt, chữ rõ ràng, mục lục theo dõi vị trí của bạn. Không quảng
            cáo, không thông báo, chỉ có tài liệu.
          </p>
          <div className={styles.actions}>
            {docs[0] ? (
              <Button href={docs[0].href} variant="primary">
                Mở tài liệu đầu tiên
              </Button>
            ) : null}
            <Button href="/open">Mở file .md</Button>
          </div>
        </div>
        {hasIllustration ? (
          <div className={styles.illustration}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/deep-work.svg" alt="" />
          </div>
        ) : null}
      </section>

      <section className={styles.docs} aria-labelledby="docs-title">
        <div className={styles.docsHead}>
          <Eyebrow>{docs.length} tài liệu</Eyebrow>
          <h2 id="docs-title" className={styles.docsTitle}>
            Tài liệu
          </h2>
        </div>
        {docs.length > 0 ? (
          <ul className={styles.grid}>
            {docs.map((doc) => (
              <li key={doc.href}>
                <DocCard doc={doc} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Chưa có tài liệu nào. Thêm file .md vào thư mục content/ rồi triển khai lại.</p>
        )}
      </section>
    </div>
  );
}
