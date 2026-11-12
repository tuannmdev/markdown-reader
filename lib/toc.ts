import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Heading } from "@/lib/types";

export function extractHeadings(markdown: string): Heading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  // Every heading must pass through the slugger so duplicate suffixes match rehype-slug.
  visit(tree, "heading", (node) => {
    const text = toString(node);
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) {
      headings.push({ id, text, depth: node.depth });
    }
  });

  return headings;
}
