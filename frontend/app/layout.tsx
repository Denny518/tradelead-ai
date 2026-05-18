import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeLead AI - AI赋能外贸获客",
  description: "AI赋能外贸获客，自动搜索客户 + AI个性化邮件 + 智能CRM管理，开发信回复率提升3倍",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full antialiased bg-white text-gray-900">{children}</body>
    </html>
  );
}
