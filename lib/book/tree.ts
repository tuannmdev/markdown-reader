import type { BookNode } from "@/lib/api/types";
import type { TreeNode } from "@/lib/types";

export type ReadMode = "private" | "public";

// A page is identified by its path, never by node id (node ids change whenever a book is updated).
export function readHref(mode: ReadMode, bookId: string, path?: string): string {
  const query = path === undefined ? "" : `p=${encodeURIComponent(path)}`;
  if (mode === "public") {
    return `/read/${encodeURIComponent(bookId)}${query ? `?${query}` : ""}`;
  }
  return `/books/read?b=${encodeURIComponent(bookId)}${query ? `&${query}` : ""}`;
}

// Converts book nodes into the tree shape used by the document sidebar. A node that has both a
// page and children becomes a folder whose first entry is its own page.
export function toTree(nodes: BookNode[], hrefOf: (nodeId: number) => string | undefined): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    const href = node.hasPage ? hrefOf(node.id) : undefined;
    if (node.children.length === 0) {
      if (href) {
        result.push({ kind: "doc", title: node.title, href });
      }
      continue;
    }
    const children = toTree(node.children, hrefOf);
    if (href) {
      children.unshift({ kind: "doc", title: "Tổng quan", href });
    }
    result.push({ kind: "folder", id: `n${node.id}`, name: node.title, children });
  }
  return result;
}

export interface FlatPage {
  path: string;
  title: string;
  trail: string[];
}

// Pages in reading order, each with the titles of its ancestors.
export function flattenPages(nodes: BookNode[], pathOf: Map<number, string>, trail: string[] = []): FlatPage[] {
  return nodes.flatMap((node) => {
    const path = node.hasPage ? pathOf.get(node.id) : undefined;
    return [
      ...(path ? [{ path, title: node.title, trail }] : []),
      ...flattenPages(node.children, pathOf, [...trail, node.title]),
    ];
  });
}
