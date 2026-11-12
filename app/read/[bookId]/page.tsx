import type { Metadata } from "next";
import { Suspense } from "react";
import { BookReader } from "@/components/books/BookReader";

export const metadata: Metadata = { title: "Đọc sách" };

// Public reading route: works without signing in when the book has been shared.
export default async function PublicBookPage({ params }: PageProps<"/read/[bookId]">) {
  const { bookId } = await params;

  return (
    <Suspense fallback={null}>
      <BookReader bookId={bookId} mode="public" />
    </Suspense>
  );
}
