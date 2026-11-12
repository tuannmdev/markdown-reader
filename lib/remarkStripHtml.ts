import type { Html, Paragraph, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const INLINE_PARENTS = new Set(["paragraph", "heading", "emphasis", "strong", "link", "delete", "tableCell"]);

// Raw HTML is never rendered as elements. Comments (e.g. <!-- NAV:START -->) are dropped and
// other tags are stripped, keeping only their text so content is not lost.
export function remarkStripHtml() {
  return (tree: Root): void => {
    visit(tree, "html", (node: Html, index, parent) => {
      if (!parent || index === undefined) {
        return;
      }
      const text = node.value.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?[a-zA-Z][^>]*>/g, "").trim();
      if (!text) {
        parent.children.splice(index, 1);
        return ["skip", index];
      }
      const textNode: Text = { type: "text", value: text };
      if (INLINE_PARENTS.has(parent.type)) {
        parent.children.splice(index, 1, textNode as PhrasingContent);
      } else {
        const paragraph: Paragraph = { type: "paragraph", children: [textNode] };
        parent.children.splice(index, 1, paragraph);
      }
      return ["skip", index + 1];
    });
  };
}
