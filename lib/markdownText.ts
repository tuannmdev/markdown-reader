const WORDS_PER_MINUTE = 200;

export function stripFences(markdown: string): string {
  return markdown.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "");
}

export function readingMinutes(markdown: string): number {
  const words = stripFences(markdown).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function firstHeading(markdown: string): string | undefined {
  const match = /^#[ \t]+(.+?)[ \t]*#*[ \t]*$/m.exec(stripFences(markdown));
  return match?.[1];
}

// Removes the first "# heading" (when it comes before any code fence) so a page can show its own title.
export function stripFirstHeading(markdown: string): string {
  const match = /^#[ \t]+.+$\n?/m.exec(markdown);
  if (!match || /^(```|~~~)/m.test(markdown.slice(0, match.index))) {
    return markdown;
  }
  return markdown.slice(0, match.index) + markdown.slice(match.index + match[0].length);
}

export function stripLeadingHeading(markdown: string): string {
  return markdown.replace(/^\s*#[ \t]+[^\n]*\n?/, "");
}
