import { ApiError } from "@/lib/api/ApiError";
import type { MarkdownReaderApi } from "@/lib/api/MarkdownReaderApi";
import type { BookSummary } from "@/lib/api/types";

function notMember(): ApiError {
  return new ApiError(403, "not_member", "Tài khoản chưa được cấp quyền.");
}

// Lists the user's books. A 403 means the user may still have a pending invitation: accept it once
// and retry. No pending invitation (404) or a second 403 means the account has not been granted access.
export async function loadMyBooks(api: MarkdownReaderApi): Promise<BookSummary[]> {
  try {
    return await api.listBooks();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) {
      throw error;
    }
  }

  try {
    await api.acceptInvitation();
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      throw notMember();
    }
    throw error;
  }

  try {
    return await api.listBooks();
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw notMember();
    }
    throw error;
  }
}
