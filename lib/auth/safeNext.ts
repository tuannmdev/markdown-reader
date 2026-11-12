// Only same-site absolute paths are accepted as a post-login destination (no open redirects).
export function safeNext(value: string | null | undefined, fallback = "/books"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
