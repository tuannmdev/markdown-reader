import ReactMarkdown, { type Components } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Callout } from "@/components/docs/Callout";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { MarkdownImage } from "@/components/docs/MarkdownImage";
import { MarkdownLink } from "@/components/docs/MarkdownLink";
import { MarkdownTable } from "@/components/docs/MarkdownTable";
import { rehypeCallouts } from "@/lib/rehypeCallouts";
import { remarkStripHtml } from "@/lib/remarkStripHtml";
import styles from "@/components/docs/ArticleBody.module.css";

// Raw HTML is deliberately NOT enabled (no rehype-raw): HTML in a document is never
// parsed into elements, and react-markdown's default URL transform blocks javascript: URLs.
const components: Components = {
  a: MarkdownLink,
  img: MarkdownImage,
  pre: CodeBlock,
  table: MarkdownTable,
  blockquote: Callout,
};

const autolinkOptions = {
  behavior: "append",
  properties: { className: ["heading-anchor"], ariaLabel: "Liên kết tới mục này" },
  content: { type: "text", value: "#" },
} as const;

export function ArticleBody({ children }: { children: string }) {
  return (
    <div className={styles.body}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkStripHtml]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, autolinkOptions],
          [rehypeHighlight, { detect: false, ignoreMissing: true }],
          rehypeCallouts,
        ]}
        remarkRehypeOptions={{
          footnoteLabel: "Chú thích",
          footnoteBackLabel: "Quay lại nội dung",
        }}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
