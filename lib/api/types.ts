export interface BookSummary {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  isPublic: boolean;
  isOwner: boolean;
}

export interface BookNode {
  id: number;
  title: string;
  hasPage: boolean;
  children: BookNode[];
}

export interface BookPage {
  title: string;
  path: string;
  content: string;
}

export interface BookPathEntry {
  path: string;
  nodeId: number;
}

export interface ImportSummary {
  added: number;
  updated: number;
  removed: number;
  unchanged: number;
}

export interface ManifestEntry {
  path: string;
  title: string;
  hash: string;
}

export interface TocNodeInput {
  title: string;
  pagePath?: string;
  children?: TocNodeInput[];
}

export interface PageInput {
  path: string;
  title: string;
  content: string;
}

export interface ImportLimits {
  maxPagesPerBatch: number;
  [key: string]: unknown;
}

export interface ImportBeginResponse {
  sessionId: string;
  neededPaths: string[];
  limits: ImportLimits;
}

export interface ImportResult {
  book: BookSummary;
  summary?: ImportSummary;
}

export interface UpdateBookInput {
  bookId: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
}
