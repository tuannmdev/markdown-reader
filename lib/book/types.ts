export interface SourceFile {
  path: string;
  content: string;
}

export interface DraftNode {
  title: string;
  pagePath?: string;
  children: DraftNode[];
}

export interface DraftPage {
  path: string;
  title: string;
  content: string;
}

export interface BookDraft {
  title: string;
  description: string;
  nodes: DraftNode[];
  pages: DraftPage[];
  unresolvedLinks: string[];
  usedIndex: string | undefined;
}
