"use client";

import Link from "next/link";
import { useState } from "react";
import { IconChevron } from "@/components/ui/IconChevron";
import { containsHref } from "@/lib/filterTree";
import type { TreeNode } from "@/lib/types";
import styles from "@/components/docs/DocTreeNode.module.css";

interface DocTreeNodeProps {
  node: TreeNode;
  activeHref?: string;
  forceOpen: boolean;
}

export function DocTreeNode({ node, activeHref, forceOpen }: DocTreeNodeProps) {
  const [open, setOpen] = useState(() => (activeHref ? containsHref(node, activeHref) : false));

  if (node.kind === "doc") {
    const active = node.href === activeHref;
    return (
      <li>
        <Link
          href={node.href}
          className={[styles.doc, active ? styles.active : ""].filter(Boolean).join(" ")}
          aria-current={active ? "page" : undefined}
        >
          {node.title}
        </Link>
      </li>
    );
  }

  const expanded = forceOpen || open;
  return (
    <li>
      <button
        type="button"
        className={styles.folder}
        aria-expanded={expanded}
        onClick={() => setOpen(!expanded)}
      >
        <IconChevron className={expanded ? styles.chevronOpen : styles.chevron} size={14} />
        {node.name}
      </button>
      {expanded ? (
        <ul className={styles.list}>
          {node.children.map((child) => (
            <DocTreeNode
              key={child.kind === "doc" ? child.href : child.id}
              node={child}
              activeHref={activeHref}
              forceOpen={forceOpen}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
