import { describe, expect, it } from "vitest";
import { buildBook, dropDuplicatePages } from "@/lib/book/buildBook";
import type { DraftNode } from "@/lib/book/types";

function pagePaths(nodes: DraftNode[]): string[] {
  return nodes.flatMap((node) => [...(node.pagePath ? [node.pagePath] : []), ...pagePaths(node.children)]);
}

describe("dropDuplicatePages", () => {
  it("keeps the first node for a page and drops later leaf duplicates", () => {
    const nodes: DraftNode[] = [
      { title: "A", pagePath: "a.md", children: [] },
      { title: "A again", pagePath: "a.md", children: [] },
      { title: "B", pagePath: "b.md", children: [] },
    ];
    expect(dropDuplicatePages(nodes).map((node) => node.title)).toEqual(["A", "B"]);
  });

  it("keeps a duplicate node that has children, without its page", () => {
    const nodes: DraftNode[] = [
      { title: "A", pagePath: "a.md", children: [] },
      { title: "Chapter", pagePath: "a.md", children: [{ title: "B", pagePath: "b.md", children: [] }] },
    ];
    const result = dropDuplicatePages(nodes);
    expect(result[1].pagePath).toBeUndefined();
    expect(result[1].children).toHaveLength(1);
  });
});

describe("buildBook", () => {
  it("never attaches one page to two nodes when the README links it twice", () => {
    const readme = ["# Book", "", "- [A](a.md)", "- Chapter", "  - [A again](a.md)", "  - [B](b.md)", ""].join("\n");
    const draft = buildBook(
      [
        { path: "README.md", content: readme },
        { path: "a.md", content: "# A" },
        { path: "b.md", content: "# B" },
      ],
      "book",
    );
    const paths = pagePaths(draft.nodes);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expect.arrayContaining(["a.md", "b.md"]));
  });
});
