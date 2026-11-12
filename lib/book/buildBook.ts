import { toString } from "mdast-util-to-string";
import type { Link, List, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parseFrontmatter } from "@/lib/frontmatter";
import { firstHeading } from "@/lib/markdownText";
import { baseName, createResolver, isExternalOrAnchor, type PathResolver } from "@/lib/book/paths";
import type { BookDraft, DraftNode, DraftPage, SourceFile } from "@/lib/book/types";

const INDEX_NAMES = ["readme.md", "index.md", "summary.md", "readme.markdown"];
const MAX_DESCRIPTION = 240;

function parse(markdown: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(markdown);
}

function prettify(name: string): string {
  const clean = name.replace(/\.(md|markdown)$/i, "").replace(/^\d+[-_.]\s*/, "").replace(/[-_]+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function findIndexFile(files: SourceFile[]): SourceFile | undefined {
  for (const name of INDEX_NAMES) {
    const hit = files.find((file) => file.path.toLowerCase() === name);
    if (hit) {
      return hit;
    }
  }
  return undefined;
}

function titleOf(file: SourceFile): string {
  const { entries, body } = parseFrontmatter(file.content);
  const fromMeta = entries.find((entry) => entry.key === "title")?.value;
  return fromMeta || firstHeading(body) || prettify(baseName(file.path));
}

function sortKeyOf(file: SourceFile): number {
  const { entries } = parseFrontmatter(file.content);
  const raw = entries.find((entry) => entry.key === "sort" || entry.key === "order")?.value;
  const value = raw === undefined ? Number.NaN : Number(raw);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function listToNodes(list: List, fromPath: string, resolve: PathResolver, unresolved: string[]): DraftNode[] {
  const nodes: DraftNode[] = [];

  for (const item of list.children) {
    let title = "";
    let href: string | undefined;
    const children: DraftNode[] = [];

    for (const child of item.children) {
      if (child.type === "paragraph" && !title) {
        const found: { link?: Link } = {};
        visit(child, "link", (node) => {
          found.link ??= node;
        });
        title = toString(found.link ?? child).trim();
        href = found.link?.url;
      } else if (child.type === "list") {
        children.push(...listToNodes(child, fromPath, resolve, unresolved));
      }
    }
    if (!title) {
      continue;
    }

    let pagePath: string | undefined;
    if (href && !isExternalOrAnchor(href)) {
      pagePath = resolve(fromPath, href);
      if (!pagePath && /\.(md|markdown)(#|\?|$)/i.test(href)) {
        unresolved.push(href);
      }
    }
    nodes.push({ title, pagePath, children });
  }
  return nodes;
}

function countPages(nodes: DraftNode[]): number {
  return nodes.reduce((sum, node) => sum + (node.pagePath ? 1 : 0) + countPages(node.children), 0);
}

function nodesFromIndex(index: SourceFile, resolve: PathResolver, unresolved: string[]): DraftNode[] {
  const tree = parse(index.content);
  let best: DraftNode[] = [];
  let bestScore = 0;

  for (const child of tree.children) {
    if (child.type !== "list") {
      continue;
    }
    const candidate = listToNodes(child, index.path, resolve, []);
    const score = countPages(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  // Re-run the winning list only so unresolved links are reported for it alone.
  if (bestScore > 0) {
    for (const child of tree.children) {
      if (child.type === "list" && countPages(listToNodes(child, index.path, resolve, [])) === bestScore) {
        best = listToNodes(child, index.path, resolve, unresolved);
        break;
      }
    }
  }
  return best;
}

interface Dir {
  name: string;
  dirs: Map<string, Dir>;
  files: SourceFile[];
}

function nodesFromFolders(files: SourceFile[], skipPath?: string): DraftNode[] {
  const root: Dir = { name: "", dirs: new Map(), files: [] };

  for (const file of files) {
    if (file.path === skipPath) {
      continue;
    }
    const segments = file.path.split("/");
    let dir = root;
    for (const segment of segments.slice(0, -1)) {
      let next = dir.dirs.get(segment);
      if (!next) {
        next = { name: segment, dirs: new Map(), files: [] };
        dir.dirs.set(segment, next);
      }
      dir = next;
    }
    dir.files.push(file);
  }

  function convert(dir: Dir): DraftNode[] {
    const fileNodes = [...dir.files]
      .sort((a, b) => sortKeyOf(a) - sortKeyOf(b) || a.path.localeCompare(b.path, "vi"))
      .map((file): DraftNode => ({ title: titleOf(file), pagePath: file.path, children: [] }));
    const dirNodes = [...dir.dirs.values()]
      .sort((a, b) => a.name.localeCompare(b.name, "vi"))
      .map((child): DraftNode => ({ title: prettify(child.name), children: convert(child) }));
    return [...fileNodes, ...dirNodes];
  }

  return convert(root);
}

function collectPaths(nodes: DraftNode[], into: string[]): void {
  for (const node of nodes) {
    if (node.pagePath && !into.includes(node.pagePath)) {
      into.push(node.pagePath);
    }
    collectPaths(node.children, into);
  }
}

function describe(index: SourceFile | undefined): { title?: string; description: string } {
  if (!index) {
    return { description: "" };
  }
  const tree = parse(parseFrontmatter(index.content).body);
  let title: string | undefined;
  let description = "";
  let afterTitle = false;

  for (const child of tree.children) {
    if (child.type === "heading" && child.depth === 1 && title === undefined) {
      title = toString(child).trim();
      afterTitle = true;
    } else if (afterTitle && child.type === "paragraph") {
      description = toString(child).trim().slice(0, MAX_DESCRIPTION);
      break;
    }
  }
  return { title, description };
}

// Builds a book from a folder of markdown files: the table of contents comes from the index
// file (README.md) when it has a list of links, otherwise from the folder structure.
// The server allows a page on only one table-of-contents node, but a README often links the same page
// twice. The first node keeps the page; a later duplicate loses it (and is dropped if it has no children).
export function dropDuplicatePages(nodes: DraftNode[], seen: Set<string> = new Set()): DraftNode[] {
  const result: DraftNode[] = [];
  for (const node of nodes) {
    const duplicate = node.pagePath !== undefined && seen.has(node.pagePath);
    if (node.pagePath !== undefined) {
      seen.add(node.pagePath);
    }
    const children = dropDuplicatePages(node.children, seen);
    if (duplicate && children.length === 0) {
      continue;
    }
    result.push({ ...node, pagePath: duplicate ? undefined : node.pagePath, children });
  }
  return result;
}

export function buildBook(files: SourceFile[], folderName: string): BookDraft {
  const markdown = files.filter((file) => /\.(md|markdown)$/i.test(file.path));
  const resolve = createResolver(markdown.map((file) => file.path));
  const index = findIndexFile(markdown);
  const unresolved: string[] = [];

  let nodes = index ? nodesFromIndex(index, resolve, unresolved) : [];
  const usedIndex = nodes.length > 0 ? index?.path : undefined;
  if (nodes.length === 0) {
    nodes = nodesFromFolders(markdown, index?.path);
  }
  if (index && usedIndex) {
    nodes = [{ title: "Giới thiệu và mục lục", pagePath: index.path, children: [] }, ...nodes];
  }

  nodes = dropDuplicatePages(nodes);

  const paths: string[] = [];
  collectPaths(nodes, paths);
  const byPath = new Map(markdown.map((file) => [file.path, file]));
  const pages: DraftPage[] = [];
  for (const path of paths) {
    const file = byPath.get(path);
    if (file) {
      pages.push({ path, title: titleOf(file), content: file.content });
    }
  }

  const { title, description } = describe(index);
  return {
    title: title || prettify(folderName) || "Cuốn sách mới",
    description,
    nodes,
    pages,
    unresolvedLinks: unresolved,
    usedIndex,
  };
}
