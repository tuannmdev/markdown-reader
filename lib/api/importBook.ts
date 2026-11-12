import { splitBatches } from "@/lib/api/batches";
import { byteLength, sha256Hex } from "@/lib/api/hash";
import type { MarkdownReaderApi } from "@/lib/api/MarkdownReaderApi";
import type { ImportResult, PageInput, TocNodeInput } from "@/lib/api/types";

// Single-request import is only used for small books (the server accepts up to 4 MiB).
export const SMALL_BOOK_BYTES = 3 * 1024 * 1024;

export interface ImportProgress {
  phase: "preparing" | "uploading" | "finishing";
  done: number;
  total: number;
}

export interface ImportRequest {
  bookId?: string;
  title: string;
  description: string;
  pages: PageInput[];
  nodes: TocNodeInput[];
  onProgress?: (progress: ImportProgress) => void;
  signal?: AbortSignal;
}

function totalBytes(pages: PageInput[]): number {
  return pages.reduce((sum, page) => sum + byteLength(page.content), 0);
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw new DOMException("Đã hủy.", "AbortError");
  }
}

export async function importBook(api: MarkdownReaderApi, request: ImportRequest): Promise<ImportResult> {
  const { bookId, title, description, pages, nodes, onProgress, signal } = request;
  const identity = bookId ? { bookId } : { title, description };

  if (totalBytes(pages) <= SMALL_BOOK_BYTES) {
    onProgress?.({ phase: "uploading", done: 0, total: pages.length });
    const result = await api.importBook({ ...identity, pages, nodes }, signal);
    onProgress?.({ phase: "finishing", done: pages.length, total: pages.length });
    return result;
  }

  onProgress?.({ phase: "preparing", done: 0, total: pages.length });
  const manifest = await Promise.all(
    pages.map(async (page) => ({ path: page.path, title: page.title, hash: await sha256Hex(page.content) })),
  );
  throwIfAborted(signal);

  const begin = await api.importBegin({ ...identity, pages: manifest }, signal);
  const needed = new Set(begin.neededPaths);
  const toUpload = pages.filter((page) => needed.has(page.path));

  try {
    const batches = splitBatches(toUpload, {
      maxPages: begin.limits.maxPagesPerBatch || 100,
      maxBytes: 2 * 1024 * 1024,
      soloBytes: 1024 * 1024,
    });
    let uploaded = 0;
    onProgress?.({ phase: "uploading", done: 0, total: toUpload.length });
    for (const batch of batches) {
      throwIfAborted(signal);
      await api.importPages(
        begin.sessionId,
        batch.map((page) => ({ path: page.path, content: page.content })),
        signal,
      );
      uploaded += batch.length;
      onProgress?.({ phase: "uploading", done: uploaded, total: toUpload.length });
    }

    throwIfAborted(signal);
    onProgress?.({ phase: "finishing", done: toUpload.length, total: toUpload.length });
    return await api.importFinalize(begin.sessionId, nodes, signal);
  } catch (error) {
    // Best effort: the session expires on its own after 24 hours if this call fails too.
    await api.importAbort(begin.sessionId).catch(() => undefined);
    throw error;
  }
}
