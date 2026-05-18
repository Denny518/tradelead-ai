"use client";

import { useState } from "react";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: "智能客户发掘",
    desc: "输入产品名称和目标市场，SerpAPI 自动搜索潜在客户，AI 智能匹配评分，快速锁定最有价值的商机。",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    title: "AI 个性化邮件",
    desc: "DeepSeek AI 为每个客户生成3个版本的个性化开发信（正式版/简洁版/故事版），告别模板群发，回复率提升3倍。",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
    ),
    title: "轻量 CRM",
    desc: "管理询盘全流程：新线索 → 已发送 → 已回复 → 已成交，状态一目了然，不遗漏任何潜在客户。",
  },
];

const plans = [
  {
    name: "免费版",
    price: "¥0",
    period: "/月",
    searches: "25次搜索/月",
    emails: "10封AI邮件/月",
    crm: "基础CRM",
    cta: "免费试用",
    featured: false,
  },
  {
    name: "专业版",
    price: "¥299",
    period: "/月",
    searches: "500次搜索/月",
    emails: "200封AI邮件/月",
    crm: "完整CRM",
    cta: "立即开通",
    featured: true,
  },
  {
    name: "企业版",
    price: "¥699",
    period: "/月",
    searches: "无限搜索",
    emails: "无限AI邮件",
    crm: "高级CRM + API",
    cta: "联系我们",
    featured: false,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TL</span>
            </div>
            <span className="font-semibold text-lg">TradeLead AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              进入Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-primary text-sm font-medium mb-6">
            🚀 AI赋能外贸获客
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
            AI赋能外贸获客，开发信回复率提升3倍
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            自动搜索客户 + AI个性化邮件 + 智能CRM管理<br />
            从找客户到写邮件，一站式搞定
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 text-base font-medium bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-blue-200"
            >
              免费试用
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 text-base font-medium text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              了解更多
            </a>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] bg-gradient-to-b from-blue-100/60 to-transparent rounded-full blur-3xl" />
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">三大核心功能</h2>
            <p className="text-lg text-gray-500">从客户搜索到邮件跟进，覆盖外贸获客全流程</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">简单定价，按需选择</h2>
            <p className="text-lg text-gray-500">从免费开始，随业务增长升级</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-2xl border bg-white transition-all ${
                  plan.featured
                    ? "border-primary shadow-lg shadow-blue-100 scale-105"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm font-medium rounded-full">
                    推荐
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {plan.searches}
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {plan.emails}
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                    {plan.crm}
                  </li>
                </ul>
                <Link
                  href="/dashboard"
                  className={`block text-center py-3 rounded-xl font-medium transition-colors ${
                    plan.featured
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>&copy; 2026 TradeLead AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
