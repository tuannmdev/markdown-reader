import type { Metadata } from "next";
import { Suspense } from "react";
import { PrivateBookReader } from "@/components/books/PrivateBookReader";

export const metadata: Metadata = { title: "Đọc sách" };

export default function BookReadPage() {
  return (
    <Suspense fallback={null}>
      <PrivateBookReader />
    </Suspense>
  );
}
