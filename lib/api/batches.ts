import { byteLength } from "@/lib/api/hash";

export interface BatchOptions {
  maxPages: number;
  maxBytes: number;
  soloBytes: number;
}

export const DEFAULT_BATCH: BatchOptions = {
  maxPages: 100,
  maxBytes: 2 * 1024 * 1024,
  soloBytes: 1024 * 1024,
};

// Splits pages into upload batches: at most maxPages and about maxBytes per batch, and a page
// larger than soloBytes always travels alone.
export function splitBatches<T extends { content: string }>(pages: T[], options: BatchOptions = DEFAULT_BATCH): T[][] {
  const batches: T[][] = [];
  let current: T[] = [];
  let currentBytes = 0;

  const flush = (): void => {
    if (current.length > 0) {
      batches.push(current);
      current = [];
      currentBytes = 0;
    }
  };

  for (const page of pages) {
    const size = byteLength(page.content);
    if (size > options.soloBytes) {
      flush();
      batches.push([page]);
      continue;
    }
    if (current.length >= options.maxPages || currentBytes + size > options.maxBytes) {
      flush();
    }
    current.push(page);
    currentBytes += size;
  }
  flush();
  return batches;
}
