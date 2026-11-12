import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i;

function isBlank(node: ElementContent): boolean {
  return node.type === "text" && node.value.trim() === "";
}

// Turns GitHub-style alerts (> [!NOTE]) into blockquotes tagged with data-callout.
export function rehypeCallouts() {
  return (tree: Root): void => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "blockquote") {
        return;
      }
      const paragraph = node.children.find((child): child is Element => child.type === "element");
      if (!paragraph || paragraph.tagName !== "p") {
        return;
      }
      const first = paragraph.children[0];
      if (!first || first.type !== "text") {
        return;
      }
      const match = MARKER.exec(first.value);
      if (!match) {
        return;
      }

      first.value = first.value.slice(match[0].length);
      if (first.value === "") {
        paragraph.children.shift();
      }
      while (paragraph.children.length > 0 && isBlank(paragraph.children[0])) {
        paragraph.children.shift();
      }
      if (paragraph.children.length === 0) {
        node.children = node.children.filter((child) => child !== paragraph);
      }
      node.properties = { ...node.properties, dataCallout: match[1].toLowerCase() };
    });
  };
}
