import { describe, expect, it } from "vitest";
import { ApiClient } from "@/lib/api/ApiClient";
import { loadMyBooks } from "@/lib/api/loadMyBooks";
import { MarkdownReaderApi } from "@/lib/api/MarkdownReaderApi";

type Reply = { status: number; body: unknown };

function apiWith(replies: Record<string, Reply[]>) {
  const calls: string[] = [];
  const fetchImpl = (async (url: string | URL | Request) => {
    const name = String(url).split("/").pop()!.split("?")[0];
    calls.push(name);
    const reply = replies[name]?.shift() ?? { status: 500, body: { error: { code: "unexpected", message: "x" } } };
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  }) as unknown as typeof fetch;
  const client = new ApiClient({ baseUrl: "https://x", anonKey: "a", getToken: async () => "t", fetchImpl });
  return { api: new MarkdownReaderApi(client), calls };
}

const forbidden = { status: 403, body: { error: { code: "forbidden", message: "f" } } };
const ok = { status: 200, body: { books: [] } };

describe("loadMyBooks", () => {
  it("returns the books when the user is already a member", async () => {
    const { api, calls } = apiWith({ "markdown-reader-list-books": [ok] });
    await expect(loadMyBooks(api)).resolves.toEqual([]);
    expect(calls).toEqual(["markdown-reader-list-books"]);
  });

  it("accepts a pending invitation on 403 and retries", async () => {
    const { api, calls } = apiWith({
      "markdown-reader-list-books": [forbidden, ok],
      "platform-membership": [{ status: 200, body: {} }],
    });
    await expect(loadMyBooks(api)).resolves.toEqual([]);
    expect(calls).toEqual(["markdown-reader-list-books", "platform-membership", "markdown-reader-list-books"]);
  });

  it("reports not_member when there is no pending invitation (404)", async () => {
    const { api } = apiWith({
      "markdown-reader-list-books": [forbidden],
      "platform-membership": [{ status: 404, body: { error: { code: "not_found", message: "No pending invitation" } } }],
    });
    await expect(loadMyBooks(api)).rejects.toMatchObject({ status: 403, code: "not_member" });
  });

  it("does not swallow other errors such as 401", async () => {
    const { api, calls } = apiWith({
      "markdown-reader-list-books": [{ status: 401, body: { error: { code: "unauthenticated", message: "u" } } }],
    });
    await expect(loadMyBooks(api)).rejects.toMatchObject({ status: 401 });
    expect(calls).toEqual(["markdown-reader-list-books"]);
  });
});
