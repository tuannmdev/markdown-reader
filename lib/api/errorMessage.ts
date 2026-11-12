import { ApiError } from "@/lib/api/ApiError";

const MESSAGES: Record<string, string> = {
  invalid_parameter: "Tham số không hợp lệ.",
  invalid_payload: "Dữ liệu gửi lên không hợp lệ.",
  duplicate_path: "Có hai file trùng đường dẫn trong thư mục.",
  unknown_page_path: "Mục lục trỏ tới một trang không có trong thư mục.",
  duplicate_page_node: "Một trang bị gắn vào nhiều mục trong mục lục.",
  hash_mismatch: "Nội dung một trang bị lệch khi gửi. Hãy thử lại.",
  unauthenticated: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.",
  forbidden: "Bạn không có quyền thực hiện thao tác này.",
  not_member: "Tài khoản chưa được cấp quyền dùng Markdown Reader, hãy liên hệ quản trị viên.",
  not_found: "Không tìm thấy.",
  session_not_found: "Phiên nhập sách không còn tồn tại. Hãy thử lại từ đầu.",
  missing_pages: "Máy chủ chưa nhận đủ các trang. Hãy thử lại.",
  session_expired: "Phiên nhập sách đã hết hạn. Hãy thử lại từ đầu.",
  too_many_sessions: "Đang có quá nhiều lần nhập sách chưa hoàn tất. Hãy đợi một lúc rồi thử lại.",
  network_error: "Không kết nối được máy chủ. Hãy kiểm tra mạng.",
};

const LIMIT_LABELS: Record<string, string> = {
  maxFileBytes: "dung lượng tối đa mỗi file (byte)",
  maxPagesPerBook: "số trang tối đa mỗi sách",
  maxBytes: "dung lượng tối đa (byte)",
  maxTocNodes: "số mục lục tối đa",
};

function describeLimits(details: Record<string, unknown> | undefined): string {
  if (!details) {
    return "";
  }
  const parts = Object.entries(details)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => `${LIMIT_LABELS[key] ?? key}: ${value}`);
  return parts.length > 0 ? ` (${parts.join("; ")})` : "";
}

// Vietnamese, user-facing text for any error thrown by the API layer. Never includes page content.
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Có trục trặc không mong muốn.";
  }
  if (error.code === "payload_too_large") {
    return `Sách vượt giới hạn cho phép${describeLimits(error.details)}.`;
  }
  return MESSAGES[error.code] ?? error.message;
}
