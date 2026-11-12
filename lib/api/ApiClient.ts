import { ApiError } from "@/lib/api/ApiError";

export type AuthMode = "auto" | "guest" | "required";

export interface ApiClientOptions {
  baseUrl: string;
  anonKey: string;
  getToken: () => Promise<string | undefined>;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  mode?: AuthMode;
  signal?: AbortSignal;
}

type Query = Record<string, string | number | undefined>;

export class ApiClient {
  private readonly options: ApiClientOptions;

  public constructor(options: ApiClientOptions) {
    this.options = options;
  }

  // "auto" sends the user's token when there is a session (so the owner of a public book is
  // recognised); "guest" sends only the apikey; "required" fails fast when signed out.
  public async get<T>(functionName: string, query: Query = {}, request: RequestOptions = {}): Promise<T> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    const suffix = params.size > 0 ? `?${params.toString()}` : "";
    return this.send<T>("GET", functionName, suffix, undefined, request);
  }

  public async post<T>(functionName: string, body: unknown, request: RequestOptions = {}): Promise<T> {
    return this.send<T>("POST", functionName, "", body, { mode: "required", ...request });
  }

  private async send<T>(
    method: "GET" | "POST",
    functionName: string,
    suffix: string,
    body: unknown,
    request: RequestOptions,
  ): Promise<T> {
    const mode = request.mode ?? "auto";
    const headers: Record<string, string> = { apikey: this.options.anonKey };

    if (mode !== "guest") {
      const token = await this.options.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (mode === "required") {
        throw new ApiError(401, "unauthenticated", "Chưa đăng nhập.");
      }
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const doFetch = this.options.fetchImpl ?? fetch;
    let response: Response;
    try {
      response = await doFetch(`${this.options.baseUrl}/functions/v1/${functionName}${suffix}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: request.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      throw new ApiError(0, "network_error", "Không kết nối được máy chủ.");
    }

    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
    if (!response.ok) {
      throw ApiError.fromBody(response.status, parsed);
    }
    return parsed as T;
  }
}
