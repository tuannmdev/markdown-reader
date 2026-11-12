import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/docs/ArticleBody";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { DocNav } from "@/components/docs/DocNav";
import { MobileNav } from "@/components/docs/MobileNav";
import { PrevNext } from "@/components/docs/PrevNext";
import { ReadingProgress } from "@/components/docs/ReadingProgress";
import { Toc } from "@/components/docs/Toc";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { getAdjacent, getAllSlugs, getDoc, getDocMetas, getTree } from "@/lib/content";
import { extractHeadings } from "@/lib/toc";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[...slug]">): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return doc ? { title: doc.title, description: doc.description || undefined } : {};
}

export default async function DocPage({ params }: PageProps<"/docs/[...slug]">) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) {
    notFound();
  }

  const tree = getTree();
  const headings = extractHeadings(doc.body);
  const { prev, next } = getAdjacent(slug);
  const firstDocHref = getDocMetas()[0]?.href ?? "/";

  return (
    <>
      <ReadingProgress />
      <div className={`page ${styles.layout}`}>
        <aside className={styles.sidebar} aria-label="Thư viện tài liệu">
          <DocNav tree={tree} activeHref={doc.href} />
        </aside>

        <article className={styles.article}>
          <MobileNav tree={tree} activeHref={doc.href} />
          <Breadcrumb firstDocHref={firstDocHref} folders={doc.folders} title={doc.title} />
          <header className={styles.header}>
            <Eyebrow active>~{doc.readingMinutes} phút đọc</Eyebrow>
            <h1 className={styles.title}>{doc.title}</h1>
            {doc.description ? <p className={styles.lead}>{doc.description}</p> : null}
            {doc.tags.length > 0 ? (
              <ul className={styles.tags} aria-label="Thẻ">
                {doc.tags.map((tag) => (
                  <li key={tag}>
                    <Tag label={tag} />
                  </li>
                ))}
              </ul>
            ) : null}
          </header>
          <ArticleBody>{doc.body}</ArticleBody>
          <PrevNext prev={prev} next={next} />
        </article>

        <aside className={styles.toc}>
          <Toc headings={headings} />
        </aside>
      </div>
    </>
  );
}
