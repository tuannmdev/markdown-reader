"use client";

import Link from "next/link";
import { useContext, type ComponentProps } from "react";
import type { ExtraProps } from "react-markdown";
import { LinkResolverContext } from "@/components/docs/LinkResolverContext";
import { isExternalOrAnchor } from "@/lib/book/paths";
import { stripNode } from "@/lib/stripNode";

export function MarkdownLink(props: ComponentProps<"a"> & ExtraProps) {
  const { href, children, ...rest } = stripNode(props);
  const resolver = useContext(LinkResolverContext);
  const external = typeof href === "string" && /^https?:\/\//i.test(href);

  if (external) {
    return (
      <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (mở trong tab mới)</span>
      </a>
    );
  }

  if (resolver && typeof href === "string" && href !== "" && !isExternalOrAnchor(href)) {
    const target = resolver(href);
    if (target) {
      return (
        <Link href={target} className={rest.className}>
          {children}
        </Link>
      );
    }
    return <span title="Trang này không có trong cuốn sách">{children}</span>;
  }

  return (
    <a {...rest} href={href}>
      {children}
    </a>
  );
}
