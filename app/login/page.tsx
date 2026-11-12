import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/LoginPage";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập để nhập và quản lý sách của bạn.",
};

export default function Page() {
  return <LoginPage />;
}
