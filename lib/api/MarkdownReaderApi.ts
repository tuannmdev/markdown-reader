import type { ApiClient } from "@/lib/api/ApiClient";
import type {
  BookNode,
  BookPage,
  BookPathEntry,
  BookSummary,
  ImportBeginResponse,
  ImportResult,
  ImportSummary,
  ManifestEntry,
  PageInput,
  TocNodeInput,
  UpdateBookInput,
} from "@/lib/api/types";

const PREFIX = "markdown-reader-";

export interface ImportBookBody {
  bookId?: string;
  title?: string;
  description?: string;
  pages: PageInput[];
  nodes: TocNodeInput[];
}

export type PageQuery = { path: string } | { nodeId: number };

export class MarkdownReaderApi {
  private readonly client: ApiClient;

  public constructor(client: ApiClient) {
    this.client = client;
  }

  public async listBooks(): Promise<BookSummary[]> {
    const result = await this.client.get<{ books: BookSummary[] }>(`${PREFIX}list-books`, {}, { mode: "required" });
    return result.books;
  }

  public async getBook(bookId: string): Promise<BookSummary> {
    return (await this.client.get<{ book: BookSummary }>(`${PREFIX}get-book`, { bookId })).book;
  }

  public async getToc(bookId: string): Promise<BookNode[]> {
    return (await this.client.get<{ nodes: BookNode[] }>(`${PREFIX}get-toc`, { bookId })).nodes;
  }

  public async getPaths(bookId: string): Promise<BookPathEntry[]> {
    return (await this.client.get<{ paths: BookPathEntry[] }>(`${PREFIX}get-paths`, { bookId })).paths;
  }

  public async getPage(bookId: string, query: PageQuery): Promise<BookPage> {
    const params = "path" in query ? { bookId, path: query.path } : { bookId, nodeId: query.nodeId };
    return (await this.client.get<{ page: BookPage }>(`${PREFIX}get-page`, params)).page;
  }

  public async updateBook(input: UpdateBookInput): Promise<BookSummary> {
    return (await this.client.post<{ book: BookSummary }>(`${PREFIX}update-book`, input)).book;
  }

  public async deleteBook(bookId: string): Promise<void> {
    await this.client.post<{ deleted: boolean }>(`${PREFIX}delete-book`, { bookId });
  }

  public async importBook(body: ImportBookBody, signal?: AbortSignal): Promise<ImportResult> {
    return this.client.post<ImportResult>(`${PREFIX}import-book`, body, { signal });
  }

  public async importBegin(
    body: { bookId?: string; title?: string; description?: string; pages: ManifestEntry[] },
    signal?: AbortSignal,
  ): Promise<ImportBeginResponse> {
    return this.client.post<ImportBeginResponse>(`${PREFIX}import-begin`, body, { signal });
  }

  public async importPages(
    sessionId: string,
    pages: { path: string; content: string }[],
    signal?: AbortSignal,
  ): Promise<void> {
    await this.client.post<{ staged: number }>(`${PREFIX}import-pages`, { sessionId, pages }, { signal });
  }

  public async importFinalize(
    sessionId: string,
    nodes: TocNodeInput[],
    signal?: AbortSignal,
  ): Promise<{ book: BookSummary; summary: ImportSummary }> {
    return this.client.post<{ book: BookSummary; summary: ImportSummary }>(
      `${PREFIX}import-finalize`,
      { sessionId, nodes },
      { signal },
    );
  }

  public async importAbort(sessionId: string): Promise<void> {
    await this.client.post<{ aborted: boolean }>(`${PREFIX}import-abort`, { sessionId });
  }

  // Accepts a pending invitation for the signed-in user. Only the "accept" action is ever sent.
  public async acceptInvitation(): Promise<void> {
    await this.client.post<unknown>("platform-membership", { action: "accept", app: "markdown_reader" });
  }
}
