import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { firstHeading, readingMinutes, stripLeadingHeading } from "@/lib/markdownText";
import type { Doc, DocMeta, TreeNode } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const DEFAULT_ORDER = 1000;
const MARKDOWN_FILE = /\.(md|markdown)$/i;

interface ContentIndex {
  tree: TreeNode[];
  docs: Doc[];
}

interface Entry {
  order: number;
  sortKey: string;
  node: TreeNode;
  docs: Doc[];
}

let cachedIndex: ContentIndex | undefined;

function stripPrefix(name: string): string {
  return name.replace(/^\d+[-_.]\s*/, "");
}

function numericPrefix(name: string): number | undefined {
  const match = /^(\d+)[-_.]/.exec(name);
  return match ? Number(match[1]) : undefined;
}

function prettify(name: string): string {
  const clean = stripPrefix(name).replace(/[-_]+/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function toHref(slug: string[]): string {
  return `/docs/${slug.map(encodeURIComponent).join("/")}`;
}

function readFolderMeta(dir: string): { title?: string; order?: number } {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "_meta.json"), "utf8"));
  } catch {
    return {};
  }
}

function readDoc(file: string, slug: string[], folders: string[], fileName: string): Doc {
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = parsed.data as Record<string, unknown>;
  const heading = firstHeading(parsed.content);
  const base = fileName.replace(MARKDOWN_FILE, "");
  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : (heading ?? prettify(base));
  const order = typeof data.order === "number" ? data.order : (numericPrefix(base) ?? DEFAULT_ORDER);

  return {
    slug,
    href: toHref(slug),
    title,
    description: typeof data.description === "string" ? data.description : "",
    order,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: readingMinutes(parsed.content),
    folders,
    body: stripLeadingHeading(parsed.content),
  };
}

function compareEntries(a: Entry, b: Entry): number {
  return a.order - b.order || a.sortKey.localeCompare(b.sortKey, "vi");
}

function readDirectory(dir: string, slugBase: string[], folderLabels: string[]): Entry[] {
  const entries: Entry[] = [];

  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (dirent.name.startsWith("_") || dirent.name.startsWith(".")) {
      continue;
    }
    const full = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      const meta = readFolderMeta(full);
      const label = meta.title ?? prettify(dirent.name);
      const slugSegment = stripPrefix(dirent.name);
      const children = readDirectory(full, [...slugBase, slugSegment], [...folderLabels, label]);
      if (children.length === 0) {
        continue;
      }
      children.sort(compareEntries);
      entries.push({
        order: meta.order ?? numericPrefix(dirent.name) ?? DEFAULT_ORDER,
        sortKey: label,
        node: {
          kind: "folder",
          id: [...slugBase, slugSegment].join("/"),
          name: label,
          children: children.map((child) => child.node),
        },
        docs: children.flatMap((child) => child.docs),
      });
    } else if (MARKDOWN_FILE.test(dirent.name)) {
      const slug = [...slugBase, stripPrefix(dirent.name.replace(MARKDOWN_FILE, ""))];
      const doc = readDoc(full, slug, folderLabels, dirent.name);
      entries.push({
        order: doc.order,
        sortKey: doc.title,
        node: { kind: "doc", title: doc.title, href: doc.href },
        docs: [doc],
      });
    }
  }

  return entries;
}

function buildIndex(): ContentIndex {
  if (!fs.existsSync(CONTENT_DIR)) {
    return { tree: [], docs: [] };
  }
  const entries = readDirectory(CONTENT_DIR, [], []).sort(compareEntries);
  return {
    tree: entries.map((entry) => entry.node),
    docs: entries.flatMap((entry) => entry.docs),
  };
}

function getIndex(): ContentIndex {
  if (process.env.NODE_ENV !== "production") {
    return buildIndex();
  }
  cachedIndex ??= buildIndex();
  return cachedIndex;
}

export function getTree(): TreeNode[] {
  return getIndex().tree;
}

export function getDocMetas(): DocMeta[] {
  return getIndex().docs.map(({ body, ...meta }) => {
    void body;
    return meta;
  });
}

export function getAllSlugs(): string[][] {
  return getIndex().docs.map((doc) => doc.slug);
}

export function decodeSlug(slug: string[]): string[] {
  try {
    return slug.map(decodeURIComponent);
  } catch {
    return slug;
  }
}

export function getDoc(slug: string[]): Doc | undefined {
  const wanted = decodeSlug(slug).join("/");
  return getIndex().docs.find((doc) => doc.slug.join("/") === wanted);
}

export function getAdjacent(slug: string[]): { prev?: DocMeta; next?: DocMeta } {
  const metas = getDocMetas();
  const wanted = decodeSlug(slug).join("/");
  const index = metas.findIndex((meta) => meta.slug.join("/") === wanted);
  if (index === -1) {
    return {};
  }
  return { prev: metas[index - 1], next: metas[index + 1] };
}
