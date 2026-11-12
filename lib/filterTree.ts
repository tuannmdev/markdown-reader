import type { TreeNode } from "@/lib/types";

export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

export function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const needle = normalize(query);
  if (!needle) {
    return nodes;
  }

  const result: TreeNode[] = [];
  for (const node of nodes) {
    if (node.kind === "doc") {
      if (normalize(node.title).includes(needle)) {
        result.push(node);
      }
      continue;
    }
    if (normalize(node.name).includes(needle)) {
      result.push(node);
      continue;
    }
    const children = filterTree(node.children, query);
    if (children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

export function containsHref(node: TreeNode, href: string): boolean {
  if (node.kind === "doc") {
    return node.href === href;
  }
  return node.children.some((child) => containsHref(child, href));
}
