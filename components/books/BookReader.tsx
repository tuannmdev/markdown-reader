"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/useAuth";
import { ArticleBody } from "@/components/docs/ArticleBody";
import { Breadcrumb } from "@/components/docs/Breadcrumb";
import { DocNav } from "@/components/docs/DocNav";
import { LinkResolverContext, type LinkResolver } from "@/components/docs/LinkResolverContext";
import { MobileNav } from "@/components/docs/MobileNav";
import { PrevNext } from "@/components/docs/PrevNext";
import { ReadingProgress } from "@/components/docs/ReadingProgress";
import { Toc } from "@/components/docs/Toc";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Tag } from "@/components/ui/Tag";
import { ApiError } from "@/lib/api/ApiError";
import { getApi } from "@/lib/api/browserApi";
import { errorMessage } from "@/lib/api/errorMessage";
import type { BookNode, BookPage, BookPathEntry, BookSummary } from "@/lib/api/types";
import { createResolver } from "@/lib/book/paths";
import { flattenPages, readHref, toTree, type ReadMode } from "@/lib/book/tree";
import { parseFrontmatter } from "@/lib/frontmatter";
import { readingMinutes, stripFirstHeading } from "@/lib/markdownText";
import { extractHeadings } from "@/lib/toc";
import styles from "@/components/books/BookReader.module.css";

interface BookData {
  book: BookSummary;
  nodes: BookNode[];
  paths: BookPathEntry[];
}

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "forbidden" }
  | { status: "error"; message: string }
  | { status: "ready"; data: BookData };

type PageState =
  | { path: string; status: "missing" }
  | { path: string; status: "error" }
  | { path: string; status: "ready"; page: BookPage };

interface BookReaderProps {
  bookId: string;
  mode: ReadMode;
}

function splitTags(value: string | undefined): string[] {
  return value ? value.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
}

export function BookReader({ bookId, mode }: BookReaderProps) {
  const params = useSearchParams();
  const pathParam = params.get("p") ?? "";
  const { signOut } = useAuth();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [pageState, setPageState] = useState<PageState | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const reloadedFor = useRef("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const api = getApi();
        const [book, nodes, paths] = await Promise.all([api.getBook(bookId), api.getToc(bookId), api.getPaths(bookId)]);
        if (!cancelled) {
          setState({ status: "ready", data: { book, nodes, paths } });
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          void signOut();
        } else if (error instanceof ApiError && error.status === 404) {
          setState({ status: "missing" });
        } else if (error instanceof ApiError && error.status === 403) {
          setState({ status: "forbidden" });
        } else {
          setState({ status: "error", message: errorMessage(error) });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, reloadKey, signOut]);

  const data = state.status === "ready" ? state.data : undefined;
  const pathOf = useMemo(() => new Map((data?.paths ?? []).map((entry) => [entry.nodeId, entry.path])), [data]);
  const flat = useMemo(() => (data ? flattenPages(data.nodes, pathOf) : []), [data, pathOf]);
  const tree = useMemo(
    () =>
      data
        ? toTree(data.nodes, (nodeId) => {
            const path = pathOf.get(nodeId);
            return path === undefined ? undefined : readHref(mode, bookId, path);
          })
        : [],
    [data, pathOf, mode, bookId],
  );
  const activePath = flat.some((item) => item.path === pathParam) ? pathParam : flat[0]?.path;

  useEffect(() => {
    if (activePath === undefined) {
      return;
    }
    let cancelled = false;
    getApi()
      .getPage(bookId, { path: activePath })
      .then((page) => {
        if (!cancelled) {
          setPageState({ path: activePath, status: "ready", page });
          window.scrollTo({ top: 0 });
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          void signOut();
        } else if (error instanceof ApiError && error.status === 404) {
          // The book may have just been updated: refresh the toc and paths once before giving up.
          if (reloadedFor.current !== activePath) {
            reloadedFor.current = activePath;
            setReloadKey((key) => key + 1);
          } else {
            setPageState({ path: activePath, status: "missing" });
          }
        } else {
          setPageState({ path: activePath, status: "error" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bookId, activePath, reloadKey, signOut]);

  const pageForActive = pageState?.path === activePath ? pageState : undefined;
  const page = pageForActive?.status === "ready" ? pageForActive.page : undefined;

  const resolver = useMemo<LinkResolver | null>(() => {
    if (!data || !page) {
      return null;
    }
    const resolvePath = createResolver(data.paths.map((entry) => entry.path));
    const known = new Set(data.paths.map((entry) => entry.path));
    return (href) => {
      const path = resolvePath(page.path, href);
      if (path === undefined || !known.has(path)) {
        return null;
      }
      const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
      return `${readHref(mode, bookId, path)}${hash}`;
    };
  }, [data, page, mode, bookId]);

  const parsed = useMemo(() => {
    if (!page) {
      return undefined;
    }
    const { entries, body } = parseFrontmatter(page.content);
    const meta = (key: string) => entries.find((entry) => entry.key === key)?.value;
    const content = stripFirstHeading(body);
    return {
      content,
      description: meta("description"),
      tags: splitTags(meta("tags")),
      minutes: readingMinutes(content),
      headings: extractHeadings(content),
    };
  }, [page]);

  const homeHref = mode === "public" ? "/" : "/books";

  if (state.status === "loading") {
    return (
      <div className={`page ${styles.status}`}>
        <Eyebrow>Đang mở sách…</Eyebrow>
      </div>
    );
  }

  if (state.status !== "ready" || !data) {
    const title =
      state.status === "missing"
        ? "Không tìm thấy sách này."
        : state.status === "forbidden"
          ? "Tài khoản chưa được cấp quyền dùng Markdown Reader, hãy liên hệ quản trị viên."
          : "Không mở được sách.";
    return (
      <div className={`page ${styles.status}`}>
        <Eyebrow active>{state.status === "missing" ? "Không tìm thấy" : "Có trục trặc"}</Eyebrow>
        <h1 className={styles.statusTitle}>{title}</h1>
        {state.status === "error" ? <p>{state.message}</p> : null}
        <Button href={homeHref} variant="primary">
          {mode === "public" ? "Về trang chủ" : "Về thư viện sách"}
        </Button>
      </div>
    );
  }

  const index = flat.findIndex((item) => item.path === activePath);
  const current = index >= 0 ? flat[index] : undefined;
  const toLink = (item: { path: string; title: string } | undefined) =>
    item ? { href: readHref(mode, bookId, item.path), title: item.title } : undefined;
  const activeHref = activePath === undefined ? undefined : readHref(mode, bookId, activePath);

  return (
    <>
      <ReadingProgress />
      <div className={`page ${styles.layout} ${parsed && parsed.headings.length === 0 ? styles.noToc : ""}`}>
        <aside className={styles.sidebar} aria-label="Mục lục sách">
          <p className={styles.bookTitle}>{data.book.title}</p>
          <DocNav tree={tree} activeHref={activeHref} />
        </aside>

        <article className={styles.article}>
          <MobileNav tree={tree} activeHref={activeHref} />
          {current ? (
            <Breadcrumb
              firstDocHref={homeHref}
              rootLabel="Sách"
              folders={[data.book.title, ...current.trail]}
              title={current.title}
            />
          ) : null}
          {pageForActive?.status === "missing" ? (
            <Eyebrow active>Không tìm thấy trang này.</Eyebrow>
          ) : pageForActive?.status === "error" ? (
            <Eyebrow active>Không tải được trang này.</Eyebrow>
          ) : page && parsed ? (
            <>
              <header className={styles.header}>
                <Eyebrow active>~{parsed.minutes} phút đọc</Eyebrow>
                <h1 className={styles.title}>{page.title}</h1>
                {parsed.description ? <p className={styles.lead}>{parsed.description}</p> : null}
                {parsed.tags.length > 0 ? (
                  <ul className={styles.tags} aria-label="Thẻ">
                    {parsed.tags.map((tag) => (
                      <li key={tag}>
                        <Tag label={tag} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </header>
              <LinkResolverContext.Provider value={resolver}>
                <ArticleBody>{parsed.content}</ArticleBody>
              </LinkResolverContext.Provider>
              <PrevNext prev={toLink(flat[index - 1])} next={toLink(flat[index + 1])} />
            </>
          ) : (
            <Eyebrow>Đang mở trang…</Eyebrow>
          )}
        </article>

        <aside className={styles.toc}>{parsed ? <Toc key={activePath} headings={parsed.headings} /> : null}</aside>
      </div>
    </>
  );
}
