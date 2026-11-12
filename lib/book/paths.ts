const MARKDOWN_EXT = /\.(md|markdown)$/i;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Resolves "." and ".." segments; extra ".." beyond the root are ignored.
export function normalizePath(path: string): string {
  const out: string[] = [];
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      out.pop();
    } else {
      out.push(segment);
    }
  }
  return out.join("/");
}

export function baseName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function isExternalOrAnchor(href: string): boolean {
  return /^(#|\/\/|[a-z][a-z0-9+.-]*:)/i.test(href);
}

export type PathResolver = (fromPath: string, href: string) => string | undefined;

// Maps a relative markdown link to a file in the folder. Falls back to dropping a leading
// "data/" segment and finally to a unique file-name match, so links survive layout differences.
export function createResolver(paths: string[]): PathResolver {
  const exact = new Map<string, string>();
  const byName = new Map<string, string[]>();

  for (const path of paths) {
    exact.set(path.toLowerCase(), path);
    exact.set(safeDecode(path).toLowerCase(), path);
    const name = safeDecode(baseName(path)).toLowerCase();
    byName.set(name, [...(byName.get(name) ?? []), path]);
  }

  return (fromPath, href) => {
    const clean = safeDecode(href.split("#")[0].split("?")[0]).trim();
    if (!clean || !MARKDOWN_EXT.test(clean) || isExternalOrAnchor(clean)) {
      return undefined;
    }
    const dir = fromPath.includes("/") ? fromPath.slice(0, fromPath.lastIndexOf("/")) : "";
    const joined = normalizePath(clean.startsWith("/") ? clean : `${dir}/${clean}`);

    const candidates = [joined, joined.replace(/^data\//i, ""), normalizePath(clean)];
    for (const candidate of candidates) {
      const hit = exact.get(candidate.toLowerCase());
      if (hit) {
        return hit;
      }
    }

    const sameName = byName.get(baseName(joined).toLowerCase());
    if (!sameName?.length) {
      return undefined;
    }
    const parent = joined.includes("/") ? joined.slice(0, joined.lastIndexOf("/")) : "";
    const parentName = baseName(parent).toLowerCase();
    return sameName.find((path) => baseName(path.slice(0, path.lastIndexOf("/"))).toLowerCase() === parentName) ?? sameName[0];
  };
}
