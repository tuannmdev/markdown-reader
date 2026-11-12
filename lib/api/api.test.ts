import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "@/lib/api/ApiClient";
import { ApiError } from "@/lib/api/ApiError";
import { splitBatches } from "@/lib/api/batches";
import { errorMessage } from "@/lib/api/errorMessage";
import { sha256Hex } from "@/lib/api/hash";
import { importBook, SMALL_BOOK_BYTES } from "@/lib/api/importBook";
import { MarkdownReaderApi } from "@/lib/api/MarkdownReaderApi";
import type { PageInput } from "@/lib/api/types";

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

type Handler = (call: Call) => { status?: number; body: unknown };

function setup(handler: Handler, token: string | null = "user-token") {
  const calls: Call[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const call: Call = {
      url: String(url),
      method: init?.method ?? "GET",
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(call);
    const { status = 200, body } = handler(call);
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  const client = new ApiClient({
    baseUrl: "https://example.supabase.co",
    anonKey: "anon",
    getToken: async () => token ?? undefined,
    fetchImpl,
  });
  return { api: new MarkdownReaderApi(client), calls };
}

const bigPage = (path: string, size: number): PageInput => ({ path, title: path, content: "x".repeat(size) });
const book = { id: "b1", title: "T", description: "", createdAt: "", updatedAt: "", pageCount: 1, isPublic: false, isOwner: true };

describe("sha256Hex", () => {
  it("matches the known digest of 'abc' and is lowercase hex", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("hashes UTF-8 bytes including newlines", async () => {
    expect(await sha256Hex("a\n")).not.toBe(await sha256Hex("a"));
    expect(await sha256Hex("đ")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("splitBatches", () => {
  const options = { maxPages: 3, maxBytes: 100, soloBytes: 60 };

  it("caps the number of pages per batch", () => {
    const pages = Array.from({ length: 7 }, (_, i) => bigPage(`p${i}`, 1));
    expect(splitBatches(pages, options).map((batch) => batch.length)).toEqual([3, 3, 1]);
  });

  it("caps the bytes per batch", () => {
    const pages = [bigPage("a", 50), bigPage("b", 50), bigPage("c", 50)];
    expect(splitBatches(pages, options).map((batch) => batch.length)).toEqual([2, 1]);
  });

  it("sends a page above the solo threshold on its own", () => {
    const pages = [bigPage("a", 10), bigPage("big", 70), bigPage("b", 10)];
    expect(splitBatches(pages, options).map((batch) => batch.map((page) => page.path))).toEqual([["a"], ["big"], ["b"]]);
  });

  it("counts UTF-8 bytes, not characters", () => {
    const pages = [{ content: "đ".repeat(30) }, { content: "đ".repeat(30) }];
    expect(splitBatches(pages, { maxPages: 10, maxBytes: 100, soloBytes: 90 }).length).toBe(2);
  });

  it("returns no batches for no pages", () => {
    expect(splitBatches([], options)).toEqual([]);
  });
});

describe("error mapping", () => {
  it("maps the error envelope to ApiError with status and code", async () => {
    const { api } = setup(() => ({ status: 404, body: { error: { code: "not_found", message: "nope" } } }));
    const error = await api.getBook("x").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: "not_found" });
  });

  it("keeps details and renders concrete limits for payload_too_large", async () => {
    const { api } = setup(() => ({
      status: 413,
      body: { error: { code: "payload_too_large", message: "big", details: { maxFileBytes: 5242880 } } },
    }));
    const error = await api.getBook("x").catch((e) => e);
    expect(error.details).toEqual({ maxFileBytes: 5242880 });
    expect(errorMessage(error)).toContain("5242880");
  });

  it("copes with a non-JSON error body", async () => {
    const fetchImpl = (async () => new Response("<html>", { status: 502 })) as unknown as typeof fetch;
    const client = new ApiClient({ baseUrl: "https://x", anonKey: "a", getToken: async () => undefined, fetchImpl });
    await expect(client.get("f")).rejects.toMatchObject({ status: 502, code: "unknown_error" });
  });

  it("reports a network failure as network_error", async () => {
    const fetchImpl = (async () => {
      throw new TypeError("failed");
    }) as unknown as typeof fetch;
    const client = new ApiClient({ baseUrl: "https://x", anonKey: "a", getToken: async () => undefined, fetchImpl });
    await expect(client.get("f")).rejects.toMatchObject({ status: 0, code: "network_error" });
  });

  it("has a Vietnamese message for forbidden and unauthenticated", () => {
    expect(errorMessage(new ApiError(403, "forbidden", "x"))).toMatch(/quyền/);
    expect(errorMessage(new ApiError(401, "unauthenticated", "x"))).toMatch(/đăng nhập/);
  });
});

describe("auth headers", () => {
  it("always sends apikey and sends Bearer only when there is a session", async () => {
    const signedIn = setup(() => ({ body: { book } }));
    await signedIn.api.getBook("b1");
    expect(signedIn.calls[0].headers).toMatchObject({ apikey: "anon", Authorization: "Bearer user-token" });
    expect(signedIn.calls[0].url).toBe("https://example.supabase.co/functions/v1/markdown-reader-get-book?bookId=b1");

    const guest = setup(() => ({ body: { book } }), null);
    await guest.api.getBook("b1");
    expect(guest.calls[0].headers.apikey).toBe("anon");
    expect(guest.calls[0].headers.Authorization).toBeUndefined();
  });

  it("refuses writes without a session", async () => {
    const guest = setup(() => ({ body: {} }), null);
    await expect(guest.api.deleteBook("b1")).rejects.toMatchObject({ status: 401, code: "unauthenticated" });
    expect(guest.calls).toHaveLength(0);
  });

  it("only ever sends the accept action to platform-membership", async () => {
    const { api, calls } = setup(() => ({ body: {} }));
    await api.acceptInvitation();
    expect(calls[0].url).toBe("https://example.supabase.co/functions/v1/platform-membership");
    expect(calls[0].body).toEqual({ action: "accept", app: "markdown_reader" });
  });
});

describe("importBook", () => {
  const nodes = [{ title: "A", pagePath: "a.md", children: [] }];

  it("uses the single request for a small book", async () => {
    const { api, calls } = setup(() => ({ body: { book, summary: { added: 1, updated: 0, removed: 0, unchanged: 0 } } }));
    const pages = [{ path: "a.md", title: "A", content: "# A" }];
    const result = await importBook(api, { title: "T", description: "d", pages, nodes });
    expect(calls.map((call) => call.url.split("/").pop())).toEqual(["markdown-reader-import-book"]);
    expect(calls[0].body).toMatchObject({ title: "T", description: "d", pages, nodes });
    expect(result.book.id).toBe("b1");
  });

  it("sends bookId (not title) when updating", async () => {
    const { api, calls } = setup(() => ({ body: { book } }));
    await importBook(api, { bookId: "b1", title: "ignored", description: "", pages: [], nodes: [] });
    expect(calls[0].body).toMatchObject({ bookId: "b1" });
    expect(calls[0].body).not.toHaveProperty("title");
  });

  function largeBook(): PageInput[] {
    const each = Math.floor(SMALL_BOOK_BYTES / 4) + 10;
    return Array.from({ length: 5 }, (_, i) => bigPage(`p${i}.md`, each));
  }

  it("runs begin, batched pages, then finalize and uploads only neededPaths", async () => {
    const pages = largeBook();
    const { api, calls } = setup((call) => {
      const name = call.url.split("/").pop();
      if (name === "markdown-reader-import-begin") {
        return { body: { sessionId: "s1", neededPaths: ["p1.md", "p3.md"], limits: { maxPagesPerBatch: 100 } } };
      }
      if (name === "markdown-reader-import-pages") {
        return { body: { staged: 1 } };
      }
      return { body: { book, summary: { added: 2, updated: 0, removed: 0, unchanged: 3 } } };
    });
    const progress: number[] = [];
    const result = await importBook(api, {
      title: "T",
      description: "",
      pages,
      nodes,
      onProgress: (p) => p.phase === "uploading" && progress.push(p.done),
    });

    expect(calls.map((call) => call.url.split("/").pop())).toEqual([
      "markdown-reader-import-begin",
      "markdown-reader-import-pages",
      "markdown-reader-import-finalize",
    ]);
    const begin = calls[0].body as { pages: { path: string; hash: string }[] };
    expect(begin.pages).toHaveLength(5);
    expect(begin.pages[0].hash).toBe(await sha256Hex(pages[0].content));
    const sent = (calls[1].body as { pages: { path: string }[] }).pages.map((page) => page.path);
    expect(sent).toEqual(["p1.md", "p3.md"]);
    expect(progress.at(-1)).toBe(2);
    expect(result.summary).toEqual({ added: 2, updated: 0, removed: 0, unchanged: 3 });
  });

  it("aborts the session when a batch fails (413) and surfaces the error", async () => {
    const { api, calls } = setup((call) => {
      const name = call.url.split("/").pop();
      if (name === "markdown-reader-import-begin") {
        return { body: { sessionId: "s1", neededPaths: largeBook().map((page) => page.path), limits: { maxPagesPerBatch: 100 } } };
      }
      if (name === "markdown-reader-import-pages") {
        return { status: 413, body: { error: { code: "payload_too_large", message: "big", details: { maxBytes: 1 } } } };
      }
      return { body: { aborted: true } };
    });
    await expect(importBook(api, { title: "T", description: "", pages: largeBook(), nodes })).rejects.toMatchObject({
      status: 413,
      code: "payload_too_large",
    });
    expect(calls.at(-1)?.url.endsWith("markdown-reader-import-abort")).toBe(true);
    expect(calls.at(-1)?.body).toEqual({ sessionId: "s1" });
  });

  it("aborts the session on finalize errors such as 409 missing_pages", async () => {
    const { api, calls } = setup((call) => {
      const name = call.url.split("/").pop();
      if (name === "markdown-reader-import-begin") {
        return { body: { sessionId: "s1", neededPaths: [], limits: { maxPagesPerBatch: 100 } } };
      }
      if (name === "markdown-reader-import-finalize") {
        return { status: 409, body: { error: { code: "missing_pages", message: "m" } } };
      }
      return { body: { aborted: true } };
    });
    await expect(importBook(api, { title: "T", description: "", pages: largeBook(), nodes })).rejects.toMatchObject({
      code: "missing_pages",
    });
    expect(calls.at(-1)?.url.endsWith("markdown-reader-import-abort")).toBe(true);
  });

  it("stops between batches and aborts when the user cancels", async () => {
    const controller = new AbortController();
    const { api, calls } = setup((call) => {
      const name = call.url.split("/").pop();
      if (name === "markdown-reader-import-begin") {
        return { body: { sessionId: "s1", neededPaths: largeBook().map((page) => page.path), limits: { maxPagesPerBatch: 1 } } };
      }
      if (name === "markdown-reader-import-pages") {
        controller.abort();
      }
      return { body: { staged: 1, aborted: true } };
    });
    await expect(
      importBook(api, { title: "T", description: "", pages: largeBook(), nodes, signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    const names = calls.map((call) => call.url.split("/").pop());
    expect(names.filter((name) => name === "markdown-reader-import-pages")).toHaveLength(1);
    expect(names.at(-1)).toBe("markdown-reader-import-abort");
  });
});

describe("page and error reads", () => {
  it("get-page uses path when given a path", async () => {
    const { api, calls } = setup(() => ({ body: { page: { title: "t", path: "a b.md", content: "c" } } }));
    await api.getPage("b1", { path: "a b.md" });
    expect(calls[0].url).toContain("path=a+b.md");
    expect(calls[0].url).not.toContain("nodeId");
  });

  it("surfaces 403 forbidden and 404 not_found with the right codes", async () => {
    const forbidden = setup(() => ({ status: 403, body: { error: { code: "forbidden", message: "f" } } }));
    await expect(forbidden.api.listBooks()).rejects.toMatchObject({ status: 403, code: "forbidden" });
    const missing = setup(() => ({ status: 404, body: { error: { code: "not_found", message: "n" } } }));
    await expect(missing.api.getPage("b", { path: "x.md" })).rejects.toMatchObject({ status: 404 });
  });
});
