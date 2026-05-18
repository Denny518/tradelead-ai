"use client";

import { useState, useEffect } from "react";
import { getMarketIntel, analyzeMarket } from "@/lib/api";

const MARKETS = ["United States", "Germany", "United Kingdom", "Australia", "Japan", "UAE", "Saudi Arabia", "Brazil", "Mexico", "India", "Southeast Asia", "South Korea"];
const INDUSTRIES = ["LED Display", "Electronics", "Textile", "Machinery", "Consumer Goods", "Medical Devices", "Auto Parts"];

export default function MarketIntelPage() {
  const [intel, setIntel] = useState<any[]>([]);
  const [market, setMarket] = useState("United States");
  const [industry, setIndustry] = useState("LED Display");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMarketIntel();
      setIntel(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeMarket({ market, industry });
      setIntel((prev) => [res.data, ...prev]);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  const trendColors: Record<string, string> = { growing: "text-green-600 bg-green-50", stable: "text-blue-600 bg-blue-50", declining: "text-red-600 bg-red-50" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">市场情报</h2>
          <p className="text-sm text-gray-500">AI 分析市场需求趋势和竞争对手动态</p>
        </div>
      </div>

      {/* Analysis form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目标市场</label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <button onClick={handleAnalyze} disabled={analyzing} className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50">
            {analyzing ? "AI 分析中..." : "分析市场"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : intel.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-lg">暂无市场分析</p>
          <p className="text-sm mt-1">选择一个市场和行业，点击"分析市场"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {intel.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{item.market} · {item.industry}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${trendColors[item.trend] || "text-gray-500 bg-gray-50"}`}>
                  {item.trend === "growing" ? "增长中" : item.trend === "stable" ? "稳定" : "下降中"}
                  {item.growthRate && ` ${item.growthRate > 0 ? "+" : ""}${item.growthRate?.toFixed(1)}%`}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">市场饱和度：</span>
                  <span className="font-medium">{item.competitorData?.marketSaturation === "low" ? "低（机会大）" : item.competitorData?.marketSaturation === "medium" ? "中等" : "高（竞争激烈）"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">主要竞争对手：</span>
                  <span className="font-medium">{(item.competitorData?.majorCompetitors || []).join(", ")}</span>
                </div>

                {item.opportunities?.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">市场机会：</span>
                    <div className="flex flex-wrap gap-1">
                      {item.opportunities.map((o: string, oi: number) => (
                        <span key={oi} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">{o}</span>
                      ))}
                    </div>
                  </div>
                )}

                {item.risks?.length > 0 && (
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">潜在风险：</span>
                    <div className="flex flex-wrap gap-1">
                      {item.risks.map((r: string, ri: number) => (
                        <span key={ri} className="px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded-full">{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50 rounded-lg text-gray-700 text-xs">{item.recommendation}</div>

                <div className="text-xs text-gray-400">
                  分析时间：{item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
