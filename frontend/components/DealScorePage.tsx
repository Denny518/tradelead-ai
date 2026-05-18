"use client";

import { useState, useEffect } from "react";
import { listCustomers, getDealScore, refreshDealScore, Customer } from "@/lib/api";

export default function DealScorePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [scores, setScores] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<number | null>(null);

  useEffect(() => {
    listCustomers({ limit: 200 }).then((res) => {
      setCustomers(res.data || []);
      setLoading(false);
    });
  }, []);

  const handleAnalyze = async (customerId: number) => {
    setAnalyzing(customerId);
    try {
      const res = await refreshDealScore(customerId);
      setScores((prev) => ({ ...prev, [customerId]: res.data }));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleAnalyzeAll = async () => {
    for (const c of customers) {
      await handleAnalyze(c.id);
    }
  };

  const getProbabilityColor = (p: number) => {
    if (p >= 70) return "text-green-600";
    if (p >= 40) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">成交概率评分</h2>
          <p className="text-sm text-gray-500">AI 分析沟通历史，预测成交概率</p>
        </div>
        <button onClick={handleAnalyzeAll} disabled={analyzing !== null} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
          分析全部客户
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-lg">暂无客户数据</p>
          <p className="text-sm mt-1">先搜索并保存客户到 CRM</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((c) => {
            const score = scores[c.id];
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900">{c.company_name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        c.status === "won" ? "badge-won" : c.status === "replied" ? "badge-replied" : c.status === "sent" ? "badge-sent" : "badge-new"
                      }`}>
                        {c.status === "new" ? "新线索" : c.status === "sent" ? "已发送" : c.status === "replied" ? "已回复" : c.status === "won" ? "已成交" : c.status}
                      </span>
                    </div>

                    {score ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 max-w-xs">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">成交概率</span>
                              <span className={`font-bold ${getProbabilityColor(score.probability)}`}>{score.probability}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${score.probability >= 70 ? "bg-green-500" : score.probability >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${score.probability}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">分析于 {new Date(score.analyzedAt).toLocaleDateString("zh-CN")}</span>
                        </div>

                        {/* Factors */}
                        <div className="grid grid-cols-2 gap-2">
                          {score.factors?.map((f: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className={`w-1.5 h-1.5 rounded-full ${f.impact === "positive" ? "bg-green-500" : f.impact === "negative" ? "bg-red-500" : "bg-gray-400"}`} />
                              <span className="text-gray-600">{f.factor}</span>
                              <span className={f.impact === "positive" ? "text-green-600" : f.impact === "negative" ? "text-red-500" : "text-gray-400"}>
                                {f.impact === "positive" ? "+" : f.impact === "negative" ? "-" : ""}
                              </span>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{score.recommendation}</p>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">尚未分析</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAnalyze(c.id)}
                    disabled={analyzing === c.id}
                    className="ml-4 px-4 py-2 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 whitespace-nowrap"
                  >
                    {analyzing === c.id ? "AI分析中..." : score ? "重新分析" : "AI 分析"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
