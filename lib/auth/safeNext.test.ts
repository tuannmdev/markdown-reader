import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/auth/safeNext";

describe("safeNext", () => {
  it("keeps same-site paths with their query", () => {
    expect(safeNext("/books/read?b=1&p=a.md")).toBe("/books/read?b=1&p=a.md");
  });

  it("rejects external or protocol-relative targets", () => {
    const backslash = String.raw`/\evil.com`;
    for (const bad of ["https://evil.com", "//evil.com", backslash, "javascript:alert(1)", "", null, undefined]) {
      expect(safeNext(bad)).toBe("/books");
    }
  });
});
