"use client";

import { useState, useEffect } from "react";
import { getFollowups, FollowupItem } from "@/lib/api";

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  overdue: { label: "已超期", color: "text-red-600 bg-red-50" },
  day3: { label: "Day 3 跟进", color: "text-orange-600 bg-orange-50" },
  day7: { label: "Day 7 跟进", color: "text-blue-600 bg-blue-50" },
  day14: { label: "Day 14 跟进", color: "text-purple-600 bg-purple-50" },
  none: { label: "无需跟进", color: "text-gray-400 bg-gray-50" },
};

export default function FollowupsPage() {
  const [items, setItems] = useState<FollowupItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, overdue: 0, dueToday: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getFollowups();
      setItems(res.data || []);
      setSummary(res.summary || { total: 0, overdue: 0, dueToday: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">自动跟进提醒</h2>
          <p className="text-sm text-gray-500">AI 自动计算每个客户的跟进时间</p>
        </div>
        <button onClick={fetchData} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">刷新</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
          <div className="text-sm text-gray-500">超期未跟进</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">{summary.dueToday}</div>
          <div className="text-sm text-gray-500">今日待跟进</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
          <div className="text-sm text-gray-500">总跟进任务</div>
        </div>
      </div>

      {/* Follow-up list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-lg">暂无跟进提醒</p>
          <p className="text-sm mt-1">发送邮件后会自动计算跟进时间</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 font-medium text-gray-500">客户</th>
                <th className="px-6 py-3 font-medium text-gray-500">上次联系</th>
                <th className="px-6 py-3 font-medium text-gray-500">距今天数</th>
                <th className="px-6 py-3 font-medium text-gray-500">优先级</th>
                <th className="px-6 py-3 font-medium text-gray-500">建议操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((f, i) => (
                <tr key={i} className={`hover:bg-gray-50 ${f.followupDue === "overdue" ? "bg-red-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{f.customerName}</div>
                    {f.email && <div className="text-xs text-gray-400">{f.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(f.lastEmailDate).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${f.daysSinceLastContact >= 14 ? "text-red-600" : f.daysSinceLastContact >= 7 ? "text-orange-600" : "text-blue-600"}`}>
                      {f.daysSinceLastContact} 天
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PRIORITY_LABELS[f.followupDue]?.color || ""}`}>
                      {PRIORITY_LABELS[f.followupDue]?.label || f.followupDue}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs max-w-xs">{f.suggestedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
