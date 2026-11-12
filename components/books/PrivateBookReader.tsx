"use client";

import { useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/auth/AuthGate";
import { BookReader } from "@/components/books/BookReader";

// Reads a book of the signed-in user: /books/read?b=<bookId>&p=<page path>
export function PrivateBookReader() {
  const params = useSearchParams();
  const bookId = params.get("b") ?? "";

  return (
    <AuthGate>
      <BookReader key={bookId} bookId={bookId} mode="private" />
    </AuthGate>
  );
}
