import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Oswald } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SkipLink } from "@/components/site/SkipLink";
import { getDocMetas } from "@/lib/content";
import "./globals.css";

const inter = Inter({ variable: "--font", subsets: ["latin", "vietnamese"], display: "swap" });
const oswald = Oswald({ variable: "--font-display", subsets: ["latin", "vietnamese"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "vietnamese"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Markdown Reader", template: "%s · Markdown Reader" },
  description: "Đọc tài liệu Markdown không xao nhãng: nền tối ấm, chữ rõ ràng, mục lục và tiến độ đọc.",
};

export const viewport: Viewport = {
  themeColor: "#1A1914",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const firstDocHref = getDocMetas()[0]?.href ?? "/";

  return (
    <html lang="vi" className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <SkipLink />
          <Header firstDocHref={firstDocHref} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
