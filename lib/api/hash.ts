// SHA-256 of the exact UTF-8 bytes that will be sent, as lowercase hex.
export async function sha256Hex(content: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function byteLength(content: string): number {
  return new TextEncoder().encode(content).length;
}
