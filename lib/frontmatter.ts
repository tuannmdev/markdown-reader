export interface FrontmatterEntry {
  key: string;
  value: string;
}

export interface ParsedFrontmatter {
  entries: FrontmatterEntry[];
  body: string;
}

const BLOCK = /^﻿?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

function unquote(value: string): string {
  const trimmed = value.trim();
  const quote = trimmed[0];
  if ((quote === "\"" || quote === "'") && trimmed.endsWith(quote) && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineList(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return undefined;
  }
  return trimmed
    .slice(1, -1)
    .split(",")
    .map(unquote)
    .filter(Boolean)
    .join(", ");
}

// Small YAML subset parser (scalars, inline lists, "- item" lists); enough to show frontmatter as a table.
export function parseFrontmatter(markdown: string): ParsedFrontmatter {
  const match = BLOCK.exec(markdown);
  if (!match) {
    return { entries: [], body: markdown };
  }

  const entries: FrontmatterEntry[] = [];
  let listKey: string | undefined;
  let listItems: string[] = [];

  function flushList(): void {
    if (listKey !== undefined) {
      entries.push({ key: listKey, value: listItems.join(", ") });
    }
    listKey = undefined;
    listItems = [];
  }

  for (const line of match[1].split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line) ?? /^-\s+(.*)$/.exec(line);
    if (item && listKey !== undefined) {
      listItems.push(unquote(item[1]));
      continue;
    }
    const pair = /^([\w.-]+):[ \t]*(.*)$/.exec(line);
    if (!pair) {
      continue;
    }
    flushList();
    if (pair[2].trim() === "") {
      listKey = pair[1];
    } else {
      entries.push({ key: pair[1], value: parseInlineList(pair[2]) ?? unquote(pair[2]) });
    }
  }
  flushList();

  return { entries, body: markdown.slice(match[0].length) };
}
