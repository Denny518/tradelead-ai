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
  title: "TradeLead AI — AI 成交辅助系统 | 从找客户到签单",
  description: "不只是找客户，而是成交更多订单。AI 辅助外贸获客全流程：多语言开发信、专业报价单、询盘回复、成交概率分析。15 种语言覆盖全球市场。",
  keywords: "外贸获客,AI开发信,外贸CRM,报价单生成,外贸AI工具,B2B获客,外贸成交",
  openGraph: {
    title: "TradeLead AI — AI 成交辅助系统",
    description: "从找客户到签单，AI 辅助外贸获客全流程",
    type: "website",
  },
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
