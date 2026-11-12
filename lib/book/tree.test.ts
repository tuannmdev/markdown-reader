import { describe, expect, it } from "vitest";
import type { BookNode } from "@/lib/api/types";
import { flattenPages, readHref, toTree } from "@/lib/book/tree";

const nodes: BookNode[] = [
  {
    id: 1,
    title: "Chương 1",
    hasPage: true,
    children: [{ id: 2, title: "Bài 1", hasPage: true, children: [] }],
  },
  { id: 3, title: "Danh mục trống", hasPage: false, children: [] },
];
const pathOf = new Map([
  [1, "intro.md"],
  [2, "a b/1.md"],
]);

describe("readHref", () => {
  it("builds private links keyed by page path", () => {
    expect(readHref("private", "bk", "a b/1.md")).toBe("/books/read?b=bk&p=a%20b%2F1.md");
    expect(readHref("private", "bk")).toBe("/books/read?b=bk");
  });

  it("builds public links under /read/[bookId]", () => {
    expect(readHref("public", "bk", "x.md")).toBe("/read/bk?p=x.md");
    expect(readHref("public", "bk")).toBe("/read/bk");
  });
});

describe("book tree", () => {
  it("links nodes by path and puts a chapter's own page first", () => {
    const tree = toTree(nodes, (id) => (pathOf.has(id) ? readHref("public", "bk", pathOf.get(id)) : undefined));
    expect(tree).toEqual([
      {
        kind: "folder",
        id: "n1",
        name: "Chương 1",
        children: [
          { kind: "doc", title: "Tổng quan", href: "/read/bk?p=intro.md" },
          { kind: "doc", title: "Bài 1", href: "/read/bk?p=a%20b%2F1.md" },
        ],
      },
    ]);
  });

  it("lists pages in reading order with their ancestors", () => {
    expect(flattenPages(nodes, pathOf)).toEqual([
      { path: "intro.md", title: "Chương 1", trail: [] },
      { path: "a b/1.md", title: "Bài 1", trail: ["Chương 1"] },
    ]);
  });
});
