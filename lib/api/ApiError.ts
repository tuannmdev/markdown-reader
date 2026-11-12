export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  public constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public static fromBody(status: number, body: unknown): ApiError {
    const error = (body as { error?: { code?: unknown; message?: unknown; details?: unknown } } | null)?.error;
    const code = typeof error?.code === "string" ? error.code : status === 0 ? "network_error" : "unknown_error";
    const message = typeof error?.message === "string" ? error.message : `Yêu cầu thất bại (${status}).`;
    const details =
      error?.details && typeof error.details === "object" ? (error.details as Record<string, unknown>) : undefined;
    return new ApiError(status, code, message, details);
  }
}
