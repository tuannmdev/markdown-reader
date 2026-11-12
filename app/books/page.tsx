import type { Metadata } from "next";
import { AuthGate } from "@/components/auth/AuthGate";
import { BookLibrary } from "@/components/books/BookLibrary";

export const metadata: Metadata = {
  title: "Sách",
  description: "Dựng cả một thư mục Markdown thành sách, lưu trên tài khoản của bạn và chia sẻ bằng một đường link.",
};

export default function BooksPage() {
  return (
    <AuthGate>
      <BookLibrary />
    </AuthGate>
  );
}
