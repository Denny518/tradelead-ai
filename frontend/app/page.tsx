"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ── SVG Illustration Components ────────────────────────────────

function GlobeIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="95" stroke="url(#globeGrad)" strokeWidth="2" fill="url(#globeFill)"/>
      <ellipse cx="100" cy="100" rx="50" ry="95" stroke="url(#globeGrad)" strokeWidth="1.5" fill="none"/>
      <ellipse cx="100" cy="100" rx="95" ry="35" stroke="url(#globeGrad)" strokeWidth="1.5" fill="none"/>
      <line x1="100" y1="5" x2="100" y2="195" stroke="url(#globeGrad)" strokeWidth="1"/>
      <circle cx="60" cy="70" r="4" fill="#3B82F6" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/></circle>
      <circle cx="140" cy="50" r="3" fill="#6366F1" opacity="0.7"><animate attributeName="opacity" values="0.7;0.2;0.7" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="80" cy="130" r="5" fill="#3B82F6" opacity="0.6"><animate attributeName="opacity" values="0.6;0.2;0.6" dur="3.5s" repeatCount="indefinite"/></circle>
      <circle cx="130" cy="140" r="3.5" fill="#8B5CF6" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.8s" repeatCount="indefinite"/></circle>
      <circle cx="50" cy="100" r="3" fill="#3B82F6" opacity="0.5"><animate attributeName="opacity" values="0.5;0.2;0.5" dur="3.2s" repeatCount="indefinite"/></circle>
      <circle cx="150" cy="90" r="4" fill="#6366F1" opacity="0.6"><animate attributeName="opacity" values="0.6;0.3;0.6" dur="2.5s" repeatCount="indefinite"/></circle>
      <defs>
        <linearGradient id="globeGrad" x1="0" y1="0" x2="200" y2="200"><stop stopColor="#3B82F6"/><stop offset="1" stopColor="#6366F1"/></linearGradient>
        <radialGradient id="globeFill" cx="40%" cy="35%"><stop stopColor="#EFF6FF"/><stop offset="1" stopColor="#DBEAFE"/></radialGradient>
      </defs>
    </svg>
  );
}

function ChartIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 160" fill="none">
      <rect x="0" y="0" width="240" height="160" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1"/>
      <line x1="30" y1="130" x2="220" y2="130" stroke="#CBD5E1" strokeWidth="1.5"/>
      <line x1="30" y1="130" x2="30" y2="20" stroke="#CBD5E1" strokeWidth="1.5"/>
      {/* Bars */}
      <rect x="45" y="80" width="22" height="50" rx="3" fill="#93C5FD"/><text x="56" y="140" textAnchor="middle" className="text-[8px]" fill="#94A3B8">1月</text>
      <rect x="78" y="65" width="22" height="65" rx="3" fill="#60A5FA"/><text x="89" y="140" textAnchor="middle" className="text-[8px]" fill="#94A3B8">2月</text>
      <rect x="111" y="45" width="22" height="85" rx="3" fill="#3B82F6"/><text x="122" y="140" textAnchor="middle" className="text-[8px]" fill="#94A3B8">3月</text>
      <rect x="144" y="30" width="22" height="100" rx="3" fill="#2563EB"/><text x="155" y="140" textAnchor="middle" className="text-[8px]" fill="#94A3B8">4月</text>
      <rect x="177" y="18" width="22" height="112" rx="3" fill="#1D4ED8"/><text x="188" y="140" textAnchor="middle" className="text-[8px]" fill="#94A3B8">5月</text>
      {/* Trend line */}
      <polyline points="56,75 89,55 122,35 155,25 188,10" stroke="#1D4ED8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="188" cy="10" r="4" fill="#1D4ED8"/><circle cx="188" cy="10" r="8" fill="#1D4ED8" opacity="0.15"/>
      <text x="120" y="16" textAnchor="middle" className="text-[10px]" fill="#1D4ED8" fontWeight="600">回复率 +3x</text>
    </svg>
  );
}

function EnvelopeIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 140" fill="none">
      {/* Envelopes fanning out */}
      <g transform="translate(10, 20) rotate(-12)">
        <rect x="0" y="0" width="160" height="100" rx="8" fill="white" stroke="#BFDBFE" strokeWidth="1.5"/>
        <path d="M0 0 L80 55 L160 0" stroke="#BFDBFE" strokeWidth="1.5" fill="#EFF6FF"/>
        <text x="10" y="30" className="text-[9px]" fill="#3B82F6" fontWeight="500">Dear John,</text>
        <text x="10" y="45" className="text-[7px]" fill="#64748B">I came across your company...</text>
        <text x="10" y="55" className="text-[7px]" fill="#64748B">Our LED displays offer...</text>
        <text x="10" y="65" className="text-[7px]" fill="#64748B">Would you be open to...</text>
        <text x="10" y="80" className="text-[8px]" fill="#3B82F6" fontWeight="500">Best regards,</text>
      </g>
      <g transform="translate(20, 25) rotate(-5)">
        <rect x="0" y="0" width="160" height="100" rx="8" fill="white" stroke="#93C5FD" strokeWidth="1.5"/>
        <path d="M0 0 L80 55 L160 0" stroke="#93C5FD" strokeWidth="1.5" fill="#DBEAFE"/>
        <text x="10" y="30" className="text-[9px]" fill="#1D4ED8" fontWeight="500">Hola María,</text>
        <text x="10" y="45" className="text-[7px]" fill="#64748B">Me complace presentarle...</text>
        <text x="10" y="55" className="text-[7px]" fill="#64748B">Nuestras pantallas LED...</text>
        <text x="10" y="65" className="text-[7px]" fill="#64748B">¿Le gustaría recibir...</text>
        <text x="10" y="80" className="text-[8px]" fill="#1D4ED8" fontWeight="500">Saludos cordiales,</text>
      </g>
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="160" height="100" rx="8" fill="white" stroke="#60A5FA" strokeWidth="2"/>
        <path d="M0 0 L80 55 L160 0" stroke="#60A5FA" strokeWidth="2" fill="#BFDBFE"/>
        <text x="10" y="30" className="text-[9px]" fill="#1E40AF" fontWeight="600">مرحباً أحمد,</text>
        <text x="10" y="45" className="text-[7px]" fill="#475569">أعجبني نشاط شركتكم...</text>
        <text x="10" y="55" className="text-[7px]" fill="#475569">شاشات LED عالية الجودة...</text>
        <text x="10" y="65" className="text-[7px]" fill="#475569">هل أنتم مستعدون...</text>
        <text x="10" y="80" className="text-[8px]" fill="#1E40AF" fontWeight="600">مع أطيب التحيات,</text>
      </g>
    </svg>
  );
}

function QuoteIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 240" fill="none">
      <rect x="10" y="10" width="180" height="220" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
      {/* Header */}
      <rect x="10" y="10" width="180" height="40" rx="12" fill="#F8FAFC"/>
      <rect x="20" y="22" width="60" height="5" rx="2" fill="#3B82F6"/>
      <rect x="20" y="32" width="40" height="3" rx="1.5" fill="#94A3B8"/>
      <rect x="130" y="22" width="45" height="16" rx="8" fill="#DBEAFE"/>
      <text x="152" y="33" textAnchor="middle" className="text-[8px]" fill="#1D4ED8" fontWeight="600">QUOTATION</text>
      {/* Table */}
      <rect x="20" y="60" width="160" height="18" rx="3" fill="#F1F5F9"/>
      <text x="28" y="72" className="text-[7px]" fill="#64748B" fontWeight="500">Item</text>
      <text x="95" y="72" className="text-[7px]" fill="#64748B" fontWeight="500">Specs</text>
      <text x="140" y="72" className="text-[7px]" fill="#64748B" fontWeight="500">Price</text>
      {[[80,"P2.5 LED Module","160x160mm","$2,550"],[100,"P4 LED Module","256x256mm","$3,840"],[120,"Controller","NovaStar","$580"]].map(([y,name,spec,price],i) => (
        <g key={i}>
          <rect x="20" y={y} width="160" height="16" rx="2" fill={i%2===0?"#FAFAFA":"white"}/>
          <text x="28" y={Number(y)+12} className="text-[7px]" fill="#334155">{name}</text>
          <text x="95" y={Number(y)+12} className="text-[6px]" fill="#64748B">{spec}</text>
          <text x="140" y={Number(y)+12} className="text-[7px]" fill="#334155" fontWeight="500">{price}</text>
        </g>
      ))}
      <rect x="20" y="145" width="160" height="1" fill="#E2E8F0"/>
      <text x="130" y="165" className="text-[8px]" fill="#64748B">Total:</text>
      <text x="160" y="165" className="text-[10px]" fill="#1D4ED8" fontWeight="700" textAnchor="end">$6,970</text>
      <rect x="120" y="172" width="60" height="20" rx="6" fill="#1D4ED8"/>
      <text x="150" y="185" textAnchor="middle" className="text-[8px]" fill="white" fontWeight="600">Send Quote</text>
      {/* Checkmark */}
      <circle cx="35" cy="200" r="10" fill="#DCFCE7"/>
      <path d="M30 200 L33 203 L40 196" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="50" y="203" className="text-[8px]" fill="#16A34A" fontWeight="500">10秒生成专业报价单</text>
    </svg>
  );
}

function PipelineIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 120" fill="none">
      <rect x="5" y="15" width="42" height="90" rx="8" fill="#F1F5F9"/>
      <rect x="10" y="25" width="32" height="28" rx="5" fill="white" stroke="#D1D5DB" strokeWidth="0.5"/>
      <text x="26" y="42" textAnchor="middle" className="text-[7px]" fill="#6B7280">新线索</text>
      <text x="26" y="55" textAnchor="middle" className="text-[10px]" fill="#374151" fontWeight="700">5</text>
      <text x="55" y="60" className="text-[12px]" fill="#9CA3AF">→</text>
      <rect x="63" y="15" width="42" height="90" rx="8" fill="#DBEAFE"/>
      <rect x="68" y="25" width="32" height="28" rx="5" fill="white" stroke="#93C5FD" strokeWidth="0.5"/>
      <text x="84" y="42" textAnchor="middle" className="text-[7px]" fill="#3B82F6">已发送</text>
      <text x="84" y="55" textAnchor="middle" className="text-[10px]" fill="#1D4ED8" fontWeight="700">3</text>
      <text x="113" y="60" className="text-[12px]" fill="#9CA3AF">→</text>
      <rect x="121" y="15" width="42" height="90" rx="8" fill="#DCFCE7"/>
      <rect x="126" y="25" width="32" height="28" rx="5" fill="white" stroke="#86EFAC" strokeWidth="0.5"/>
      <text x="142" y="42" textAnchor="middle" className="text-[7px]" fill="#16A34A">已回复</text>
      <text x="142" y="55" textAnchor="middle" className="text-[10px]" fill="#15803D" fontWeight="700">2</text>
      <text x="171" y="60" className="text-[12px]" fill="#9CA3AF">→</text>
      <rect x="179" y="15" width="52" height="90" rx="8" fill="#FEF3C7"/>
      <rect x="184" y="25" width="42" height="28" rx="5" fill="white" stroke="#FCD34D" strokeWidth="0.5"/>
      <text x="205" y="42" textAnchor="middle" className="text-[7px]" fill="#D97706">成交!</text>
      <text x="205" y="55" textAnchor="middle" className="text-[10px]" fill="#B45309" fontWeight="700">1</text>
    </svg>
  );
}

// ── Section Components ─────────────────────────────────────────

function SectionHeader({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">{kicker}</div>
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h2>
      <p className="text-lg text-gray-500 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function StatCard({ number, label, desc }: { number: string; label: string; desc: string }) {
  return (
    <div className="text-center p-6">
      <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">{number}</div>
      <div className="font-semibold text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-500">{desc}</div>
    </div>
  );
}

// ── FAQ Data ───────────────────────────────────────────────────

const FAQS = [
  { q: "你们的 AI 和 ChatGPT 有什么区别？", a: "我们不是通用 AI 聊天工具。我们是一个专门为外贸获客和成交场景深度优化的系统——整合了客户搜索、多语言邮件生成、报价单制作、询盘回复、CRM 管理等完整业务流程。你不需要学习写 Prompt，也不需要来回切换多个工具，一站式完成从找客户到签单的全部工作。" },
  { q: "AI 写的邮件会不会很模板化，被客户看出来？", a: "不会。你需要先填写\"产品知识库\"——包括产品详情、卖点、成功案例、FAQ 等。系统会基于你的真实产品信息深度个性化每一封邮件。每封邮件 AI 都会自评质量，低于 7 分会自动重新生成。更重要的是，系统支持 15 种语言的母语级写作，不是翻译体。" },
  { q: "怎么知道哪些客户最有可能成交？", a: "系统会分析每个客户的沟通历史——邮件往来频率、是否打开报价单、是否点击链接等——给出成交概率评分（0-100%），并按优先级排序。你打开\"成交概率评分\"页面，就知道该优先跟进谁。" },
  { q: "我的产品信息是商业机密，安全吗？", a: "你的产品知识库和客户数据只存在你自己的账户下，不会用于训练模型，不会跨用户共享。我们遵循数据最小化原则，只处理你主动输入的信息。" },
  { q: "支持团队使用吗？多个业务员能一起用吗？", a: "支持。团队版允许多人协作——老板可以看到所有客户和业绩数据，业务员各自管理自己的客户。还可以把客户分配给不同成员跟进。" },
  { q: "有没有免费试用？怎么开始？", a: "目前提供免费演示版本，你可以立即体验所有功能。打开 Dashboard，先配置产品知识库（这是 AI 写邮件的基础），然后搜索客户、生成开发信，体验完整流程。" },
];

// ── Main Page ──────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white pt-16 pb-8 sm:pt-24 sm:pb-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/60 to-indigo-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50/40 to-purple-50/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                AI 成交辅助系统
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                不只是找客户
                <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  而是成交更多订单
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                从搜索潜在客户、多语言开发信、专业报价单、
                <br className="hidden sm:block"/>
                询盘回复到成交概率分析——AI 辅助全流程，
                <br className="hidden sm:block"/>
                <strong className="text-gray-700">连接 Gmail 一键发送，审核后直达客户收件箱。</strong>
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/dashboard" className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 text-lg w-full sm:w-auto text-center">
                  免费试用
                </Link>
                <a href="#features" className="px-8 py-4 text-gray-600 font-medium border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all w-full sm:w-auto text-center">
                  了解功能
                </a>
              </div>

              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-400">
                <span className="flex items-center gap-1.5">无需下载</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                <span className="flex items-center gap-1.5">无需绑定信用卡</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                <span className="flex items-center gap-1.5">1 分钟上手</span>
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl blur-2xl opacity-20 transform rotate-3"/>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-md">
                  {/* Mock UI */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-400"/><div className="w-2.5 h-2.5 rounded-full bg-green-400"/></div>
                    <div className="text-xs text-gray-400 font-medium">TradeLead AI — 成交辅助系统</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">今日概览</span>
                      <span className="text-[10px] text-gray-400">更新于 2 分钟前</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center"><div className="text-xl font-bold text-blue-600">12</div><div className="text-[10px] text-blue-500">新线索</div></div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center"><div className="text-xl font-bold text-green-600">5</div><div className="text-[10px] text-green-500">待跟进</div></div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 text-center"><div className="text-xl font-bold text-amber-600">78%</div><div className="text-[10px] text-amber-500">成交率预测</div></div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-[10px] text-gray-500 mb-2">AI 建议：3 位客户超过 7 天未跟进</div>
                      <div className="space-y-1.5">
                        {[{name:"ABC Displays",prob:"85%",color:"text-green-600"},{name:"Digital Pro Ltd",prob:"62%",color:"text-yellow-600"},{name:"Metro Boards",prob:"45%",color:"text-orange-500"}].map((c,i) => (
                          <div key={i} className="flex items-center justify-between text-xs"><span className="text-gray-700">{c.name}</span><span className={`font-semibold ${c.color}`}>成交率 {c.prob}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-4xl mx-auto mt-12 sm:mt-16 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-50">
            <StatCard number="15+" label="语言覆盖" desc="英语到阿拉伯语，母语级写作" />
            <StatCard number="5x" label="搜索覆盖" desc="多引擎并行，找到更多客户" />
            <StatCard number="10s" label="生成报价单" desc="从 15 分钟到 10 秒" />
            <StatCard number="3x" label="回复率提升" desc="深度个性化 vs 模板群发" />
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM / SOLUTION ═══════════ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="为什么选择我们"
            title="你的业务员做不到的事，AI 可以"
            subtitle={`外贸获客不只是"发邮件"。从多语言沟通到专业报价，从跟进提醒到成交判断——这些决定了你能不能拿到订单。`}
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { title: "只会英语，丢了全球 80% 的市场", desc: "拉美说西班牙语，中东说阿拉伯语，日本客户期望收到日语邮件。你的业务员做不到——但 AI 可以用 15 种语言为每个客户写高度个性化的开发信，不是翻译模板，是母语级写作。", icon: "🌍", stat: "15 种语言" },
              { title: "手动做报价，慢、丑、容易出错", desc: "业务员用 Excel 做报价单，格式不统一，参数容易写错，客户看到不专业的报价直接不回复。AI 10 秒生成专业报价单，支持 FOB/CIF/EXW 等全贸易术语，多语言版本一键切换。", icon: "📋", stat: "10 秒生成" },
              { title: "不知道谁是真客户，该跟谁", desc: `客户多了，业务员靠感觉判断"这个客户有戏"——结果把时间浪费在低概率客户上。AI 分析邮件往来、报价打开率、沟通频率，给出成交概率评分，告诉你该优先联系谁。`, icon: "🎯", stat: "成交率预测" },
              { title: "客户回复了，新手不会回", desc: "客户问价格、质疑质量、要求寄样——新手业务员回复不专业，直接丢单。粘贴客户邮件到系统，AI 生成 3 个版本的专业回复，参考你的产品知识库精准应答。", icon: "💬", stat: "秒级回复" },
            ].map((item, i) => (
              <div key={i} className="group relative bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg hover:border-blue-100 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">{item.stat}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader kicker="核心功能" title="从找客户到签单，AI 全程辅助" subtitle={`不只是"写邮件工具"，而是覆盖外贸获客全流程的成交辅助系统`} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: "🔍", title: "多引擎智能获客", desc: "多数据源并行搜索，覆盖普通网页、地图商家、行业新闻、购物平台。找到的不仅是公司名，还包括地址、电话、评分——比业务员手动搜索全面 5 倍。", highlight: "NEW" },
              { icon: "✉️", title: "AI 开发信 + Gmail 直发", desc: "基于产品知识库生成 3 版个性化开发信，AI 6 维度自评。连接 Gmail 后一键直达客户收件箱，无需复制粘贴。始终人工审核，每日限发 20 封防垃圾。15 种语言母语级写作。", highlight: "核心" },
              { icon: "📊", title: "AI 报价单生成", desc: "输入产品清单和条款，秒出专业报价单。支持标准/详细/简洁/形式发票 4 种模板，9 种 Incoterms，FOB/CIF/EXW 全覆盖，多语言一键切换。", highlight: "热门" },
              { icon: "💡", title: "AI 询盘回复助手", desc: "客户发来询盘邮件？粘贴到系统，AI 分析客户意图，调用你的产品知识库和 FAQ，生成 3 个版本的专业回复——新手也能回得像 10 年老业务员。", highlight: "" },
              { icon: "🔔", title: "自动跟进提醒", desc: "哪些客户该跟进了？系统自动计算上次联系时间，标记 Day3/Day7/Day14 跟进节点。超期未跟的红标警告——不会漏掉任何成交机会。", highlight: "" },
              { icon: "📈", title: "成交概率评分", desc: `AI 分析每位客户的沟通频率、邮件互动、报价打开情况，给出 0-100% 成交概率。按优先级排序——先跟进高概率客户，告别"凭感觉"判断。`, highlight: "P2" },
              { icon: "🎯", title: "Pipeline 看板", desc: "所有客户按阶段可视化展示：新线索→已发送→已回复→已报价→已成交。拖拽卡片更新状态，一眼看清哪个阶段堵住了，哪个客户该推进了。", highlight: "" },
              { icon: "📚", title: "产品知识库", desc: "你的产品信息、卖点、案例、FAQ 结构化存储。填一次，每次 AI 写邮件/做报价/回询盘都自动调用。信息越详细，AI 输出越精准——这是你的核心护城河。", highlight: "核心" },
            ].map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:shadow-lg hover:border-blue-100 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{f.icon}</div>
                  {f.highlight && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{f.highlight}</span>}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SCENARIOS ═══════════ */}
      <section id="scenarios" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader kicker="应用场景" title="不管你做什么产品，AI 都懂你" subtitle="三个典型场景，看看 TradeLead AI 如何帮不同角色拿到更多订单" />

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                avatar: "👨‍💼", role: "外贸企业老板", pain: "业务员能力参差不齐，客户跟进全靠自觉，不知道谁在认真工作，谁在浪费时间。",
                solution: "Dashboard 一看就知道：团队开发了多少客户、发了多少邮件、成交率多少。Pipeline 看板直观展示每个业务员的客户进度。AI 写的邮件质量评分，新人也能量化考核。",
                result: "团队效率可量化，新人一周上手，成交率提升 3 倍。",
              },
              {
                avatar: "👩‍💻", role: "外贸业务员", pain: "每天要搜客户、写开发信、做报价、回邮件——时间都花在重复劳动上，真正和客户深度沟通的时间反而最少。而且大多只会英语，非英语市场完全放弃了。",
                solution: "一键搜索多个数据源找到客户 → AI 用 15 种语言写个性化开发信 → 10 秒生成专业报价单 → 粘贴客户邮件 AI 秒回。重复工作交给 AI，你专注和客户沟通。",
                result: "覆盖客户量提升 5 倍，非英语市场从零开始，订单来源多元化。",
              },
              {
                avatar: "🏠", role: "外贸 SOHO", pain: "一个人干所有事：找客户、写邮件、报价、跟单、报关。时间不够用，客户一多就乱。而且一个人不可能什么语言都会。",
                solution: "一个人 + TradeLead AI = 一个外贸团队。客户管理自动化、跟进提醒不怕忘、AI 代你写多语言邮件和报价。一人搞定全流程。",
                result: "管理 100+ 客户不混乱，多语种开发信像母语，小团队也能做大生意。",
              },
            ].map((s, i) => (
              <div key={i} className="group bg-gradient-to-b from-white to-gray-50/50 rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{s.avatar}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{s.role}</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="text-xs font-semibold text-red-500 mb-1">痛点</div>
                    <p className="text-sm text-gray-600">{s.pain}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-blue-600 mb-1">AI 怎么帮</div>
                    <p className="text-sm text-gray-600">{s.solution}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-green-600 mb-1">结果</div>
                    <p className="text-sm text-gray-900 font-medium">{s.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader kicker="三步开始" title="从零到成交，只需要三步" subtitle="不需要复杂配置，注册即用" />

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01", title: "填写产品知识库", time: "5 分钟",
                desc: "告诉 AI 你的产品是什么、卖点在哪、有哪些成功案例。填得越详细，AI 越懂你的产品。支持多产品线，一次填写永久复用。",
                visual: (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-left space-y-2">
                    <div className="flex gap-2"><div className="w-16 h-3 bg-blue-100 rounded"/><div className="w-24 h-3 bg-blue-100 rounded"/></div>
                    <div className="flex gap-2"><div className="w-20 h-2 bg-gray-100 rounded"/><div className="w-32 h-2 bg-gray-100 rounded"/></div>
                    <div className="flex gap-2"><div className="w-14 h-2 bg-gray-100 rounded"/><div className="w-28 h-2 bg-gray-100 rounded"/></div>
                    <div className="w-full h-16 bg-blue-50 rounded-lg flex items-center justify-center text-xs text-blue-600 font-medium">产品信息 · 卖点 · 案例 · FAQ</div>
                  </div>
                ),
              },
              {
                step: "02", title: "搜索客户 + AI 写邮件", time: "1 分钟/客户",
                desc: "选择产品和目标市场，多引擎并行搜索潜在客户。一键查找邮箱，AI 自动生成 3 版本个性化开发信。连接 Gmail 后一审即发，无需复制粘贴，始终保持人工审核控制。",
                visual: (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"/><span className="text-[10px] text-gray-600 font-medium">搜索完成：找到 12 家潜在客户</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"/><span className="text-[10px] text-gray-600">找到 8 个联系邮箱</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"/><span className="text-[10px] text-gray-600">生成 3 版开发信（评分 8.2/10）</span></div>
                    <div className="w-full h-8 bg-red-600 rounded-lg flex items-center justify-center text-[10px] text-white font-medium">连接 Gmail → 审核 → 一键发送</div>
                  </div>
                ),
              },
              {
                step: "03", title: "跟进 + 成交辅助", time: "持续",
                desc: "系统自动提醒跟进节点，AI 帮你回复客户询盘、生成报价单、分析成交概率。从初次联系到签单，每一步都有 AI 辅助。",
                visual: (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="flex justify-between text-[10px]"><span className="text-gray-500">成交概率</span><span className="text-green-600 font-bold">78%</span></div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="w-[78%] h-full bg-green-500 rounded-full"/></div>
                    <div className="text-[10px] text-gray-600 mt-2">AI 建议：本周内提供限时折扣</div>
                    <div className="flex gap-1.5"><span className="px-2 py-1 bg-green-50 text-green-700 text-[9px] rounded-full">已打开报价 3 次</span><span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] rounded-full">邮件回复 5 次</span></div>
                  </div>
                ),
              },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">{step.step}</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{step.time}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{step.desc}</p>
                <div className="max-w-[280px] mx-auto">{step.visual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SOCIAL PROOF ═══════════ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-6">用户反馈</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 tracking-tight">外贸人的真实评价</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "以前一个业务员一天最多发 20 封开发信，用 AI 辅助后一天能触达 100+ 客户。最关键的是多语言——我们开始接中东和拉美订单了，以前根本不敢想。", name: "张总", role: "LED 显示屏出口商", stat: "客户触达量 5x" },
              { quote: "我是 SOHO，一个人干所有活。以前客户超过 50 个就乱套，现在 AI 帮我管着 200+ 客户，跟进提醒从来不会漏。报价单 10 秒出，客户说看起来很专业。", name: "李经理", role: "机械配件 SOHO", stat: "单人管理 200+ 客户" },
              { quote: "最有用的是询盘回复助手。以前新手业务员回邮件我得逐封检查，现在 AI 先出 3 版回复，业务员选一个微调就行。回复质量上去了，我也有时间做更重要的事。", name: "王总", role: "家具出口企业", stat: "回复效率 3x" },
            ].map((t, i) => (
              <div key={i} className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100 p-6 text-left">
                <div className="flex gap-1 mb-3 text-amber-400 text-sm">{"★".repeat(5)}</div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{t.quote}</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                  <div className="mt-2 inline-block px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">{t.stat}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader kicker="常见问题" title="还有疑问？" subtitle="" />
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-100 overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  <span className="pr-4">{faq.q}</span>
                  <svg className="w-5 h-5 flex-shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl shadow-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl translate-x-20 -translate-y-20"/>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-2xl -translate-x-10 translate-y-10"/>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">准备好成交更多订单了吗？</h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">免费试用，体验 AI 如何帮你从找客户到签单全程提速。</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg text-lg w-full sm:w-auto">
                  免费试用
                </Link>
                <span className="text-gray-500 text-sm">无需下载 · 无需绑定信用卡 · 1 分钟上手</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
