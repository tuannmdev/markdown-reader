import type { Metadata } from "next";
import { OpenReader } from "@/components/open/OpenReader";

export const metadata: Metadata = {
  title: "Mở file Markdown",
  description: "Mở file .md từ máy của bạn để đọc. File không bao giờ được tải lên.",
};

export default function OpenPage() {
  return <OpenReader />;
}
