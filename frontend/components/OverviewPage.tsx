"use client";

import { useState, useEffect } from "react";
import { getDashboardStats } from "@/lib/api";

const PERIODS = [
  { value: "today", label: "今日" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
];

export default function OverviewPage() {
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboardStats().then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, [period]);

  if (loading || !stats) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const statCards = [
    { label: "总客户数", value: stats.totalCustomers, sub: `+${stats.newToday} 今日新增`, color: "text-blue-600", bg: "bg-blue-50" },
    { label: `${period === "today" ? "今日" : period === "week" ? "本周" : "本月"}新增客户`, value: stats.newCustomers, sub: "新线索", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "已发邮件", value: stats.periodEmailsSent, sub: `${stats.todayEmailsSent} 今日发送`, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "客户回复", value: stats.repliedTotal, sub: `转化率 ${stats.conversionRate}%`, color: "text-green-600", bg: "bg-green-50" },
    { label: "已成交", value: stats.wonTotal, sub: `${stats.wonPeriod} ${period === "today" ? "今日" : period === "week" ? "本周" : "本月"}成交`, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "待跟进", value: stats.followupsDue, sub: "超过3天未联系", color: "text-orange-600", bg: "bg-orange-50" },
    { label: "已报价", value: stats.statusBreakdown?.quoted || 0, sub: "报价单已发送", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "已流失", value: stats.statusBreakdown?.lost || 0, sub: "需复盘分析", color: "text-red-500", bg: "bg-red-50" },
  ];

  // Mini bar chart max value
  const timelineMax = Math.max(...stats.dailyTimeline.map((d: any) => d.emails + d.customers), 1);

  return (
    <div>
      {/* Header + Period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">概览</h2>
          <p className="text-sm text-gray-500 mt-1">AI 成交辅助系统 · 数据仪表盘</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                period === p.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <div className={`w-2 h-2 rounded-full ${s.color.replace("text", "bg")}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-[10px] text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 14-day activity chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">近 14 天活动趋势</h3>
        <div className="flex items-end gap-1 sm:gap-1.5 h-32">
          {stats.dailyTimeline.map((d: any, i: number) => {
            const h = Math.max(((d.emails + d.customers) / timelineMax) * 100, 4);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "100px" }}>
                  {d.emails > 0 && (
                    <div className="w-full bg-blue-400 rounded-t group-hover:bg-blue-500 transition-colors" style={{ height: `${Math.max((d.emails / timelineMax) * 100, 4)}%` }} title={`${d.emails} 封邮件`} />
                  )}
                  {d.customers > 0 && (
                    <div className="w-full bg-indigo-300 rounded-t group-hover:bg-indigo-400 transition-colors" style={{ height: `${Math.max((d.customers / timelineMax) * 100, 4)}%` }} title={`${d.customers} 个客户`} />
                  )}
                </div>
                <span className="text-[9px] text-gray-400 whitespace-nowrap">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-400 rounded-sm"/> 邮件</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-300 rounded-sm"/> 客户</span>
        </div>
      </div>

      {/* Funnel + Quick Actions row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Conversion funnel */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">销售漏斗</h3>
          <div className="space-y-3">
            {[
              { label: "新线索", count: stats.statusBreakdown?.new || 0, color: "bg-gray-400", pct: stats.totalCustomers > 0 ? ((stats.statusBreakdown?.new || 0) / stats.totalCustomers * 100).toFixed(0) : 0 },
              { label: "已发送", count: stats.statusBreakdown?.sent || 0, color: "bg-blue-500", pct: stats.totalCustomers > 0 ? ((stats.statusBreakdown?.sent || 0) / stats.totalCustomers * 100).toFixed(0) : 0 },
              { label: "已回复", count: stats.statusBreakdown?.replied || 0, color: "bg-green-500", pct: stats.totalCustomers > 0 ? ((stats.statusBreakdown?.replied || 0) / stats.totalCustomers * 100).toFixed(0) : 0 },
              { label: "已报价", count: stats.statusBreakdown?.quoted || 0, color: "bg-purple-500", pct: stats.totalCustomers > 0 ? ((stats.statusBreakdown?.quoted || 0) / stats.totalCustomers * 100).toFixed(0) : 0 },
              { label: "已成交", count: stats.statusBreakdown?.won || 0, color: "bg-amber-500", pct: stats.totalCustomers > 0 ? ((stats.statusBreakdown?.won || 0) / stats.totalCustomers * 100).toFixed(0) : 0 },
            ].map((f, fi) => (
              <div key={fi} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-14 text-right">{f.label}</span>
                <div className="flex-1 h-6 bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-medium transition-all`} style={{ width: `${Math.max(Number(f.pct), 5)}%` }}>
                    {f.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">快速操作</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "搜索客户", desc: "多引擎搜索", color: "from-blue-50 to-blue-100 border-blue-200 text-blue-700", tab: "search" },
              { label: "生成报价单", desc: "10秒出单", color: "from-green-50 to-green-100 border-green-200 text-green-700", tab: "quotations" },
              { label: "回复询盘", desc: "AI 秒级回复", color: "from-purple-50 to-purple-100 border-purple-200 text-purple-700", tab: "replies" },
              { label: "跟进提醒", desc: `${stats.followupsDue} 个待跟进`, color: "from-orange-50 to-orange-100 border-orange-200 text-orange-700", tab: "followups" },
            ].map((a, ai) => (
              <button
                key={ai}
                onClick={() => {
                  const event = new CustomEvent("changeTab", { detail: a.tab });
                  window.dispatchEvent(event);
                }}
                className={`p-4 rounded-xl bg-gradient-to-br ${a.color} border text-left hover:shadow-sm transition-all`}
              >
                <div className="text-sm font-semibold">{a.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
