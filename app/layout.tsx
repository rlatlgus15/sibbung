import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 가계부 챗봇",
  description: "대화로 지출을 기록하는 가계부",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${geist.variable} h-full antialiased`}>
      <body className={`${notoSansKr.className} flex min-h-full flex-col`}>{children}</body>
    </html>
  );
}
