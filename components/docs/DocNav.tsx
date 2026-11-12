"use client";

import { useState } from "react";
import { DocSearch } from "@/components/docs/DocSearch";
import { DocTreeNode } from "@/components/docs/DocTreeNode";
import { filterTree } from "@/lib/filterTree";
import type { TreeNode } from "@/lib/types";
import styles from "@/components/docs/DocNav.module.css";

interface DocNavProps {
  tree: TreeNode[];
  activeHref?: string;
}

export function DocNav({ tree, activeHref }: DocNavProps) {
  const [query, setQuery] = useState("");
  const visible = filterTree(tree, query);
  const filtering = query.trim() !== "";

  return (
    <div className={styles.nav}>
      <DocSearch value={query} onChange={setQuery} />
      <nav aria-label="Danh sách tài liệu">
        {visible.length > 0 ? (
          <ul className={styles.list}>
            {visible.map((node) => (
              <DocTreeNode
                key={node.kind === "doc" ? node.href : node.id}
                node={node}
                activeHref={activeHref}
                forceOpen={filtering}
              />
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Không có tài liệu phù hợp.</p>
        )}
      </nav>
    </div>
  );
}
