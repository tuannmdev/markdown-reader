"use client";

import { useRef } from "react";
import { DocNav } from "@/components/docs/DocNav";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { IconClose } from "@/components/ui/IconClose";
import { IconMenu } from "@/components/ui/IconMenu";
import type { TreeNode } from "@/lib/types";
import styles from "@/components/docs/MobileNav.module.css";

interface MobileNavProps {
  tree: TreeNode[];
  activeHref?: string;
}

export function MobileNav({ tree, activeHref }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function close(): void {
    dialogRef.current?.close();
  }

  return (
    <div className={styles.wrapper}>
      <Button size="sm" icon={<IconMenu size={18} />} onClick={() => dialogRef.current?.showModal()}>
        Danh sách tài liệu
      </Button>
      <dialog
        ref={dialogRef}
        className={styles.drawer}
        aria-labelledby="mobile-nav-title"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target === dialogRef.current || target.closest("a")) {
            close();
          }
        }}
      >
        <div className={styles.head}>
          <h2 id="mobile-nav-title" className={styles.title}>
            Tài liệu
          </h2>
          <IconButton label="Đóng danh sách" onClick={close}>
            <IconClose />
          </IconButton>
        </div>
        <DocNav tree={tree} activeHref={activeHref} />
      </dialog>
    </div>
  );
}
