"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/types";
import styles from "@/components/docs/Toc.module.css";

export function Toc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        const current = headings.find((heading) => visible.has(heading.id));
        if (current) {
          setActiveId(current.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-labelledby="toc-title">
      <p id="toc-title" className={styles.title}>
        Trên trang này
      </p>
      <ul className={styles.list}>
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={[styles.link, heading.depth === 3 ? styles.sub : "", active ? styles.active : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "location" : undefined}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
