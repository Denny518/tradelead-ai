"use client";

import { useState, useEffect } from "react";
import { getMarketIntel, analyzeMarket } from "@/lib/api";

const MARKETS = [
  "United States", "Germany", "United Kingdom", "Australia", "Canada", "Japan",
  "France", "Brazil", "UAE", "Saudi Arabia", "South Korea", "Mexico", "India",
  "Southeast Asia", "Italy", "Spain", "Netherlands", "Turkey", "Poland",
  "Thailand", "Vietnam", "Russia", "Indonesia", "South Africa", "Nigeria",
];

const INDUSTRIES = [
  "LED Display", "Electronics", "Textile & Apparel", "Industrial Machinery",
  "Consumer Goods", "Medical Devices", "Auto Parts", "Solar Energy",
  "Building Materials", "Furniture", "Packaging", "Food & Beverage",
  "Chemical Products", "Sports Equipment", "Beauty & Personal Care",
];

const CATEGORIES = [
  { value: "", label: "自动检测" },
  { value: "Electronics", label: "电子产品" },
  { value: "Textile", label: "纺织服装" },
  { value: "Machinery", label: "工业机械" },
  { value: "Consumer Goods", label: "消费品" },
  { value: "Medical Devices", label: "医疗器械" },
  { value: "Auto Parts", label: "汽车配件" },
  { value: "Business & Industrial", label: "工商业" },
];

const DATE_RANGES = [
  { value: "today 3-m", label: "最近 3 个月" },
  { value: "today 12-m", label: "最近 12 个月" },
  { value: "today 5-y", label: "最近 5 年" },
  { value: "2019-01-01 2026-12-31", label: "2019 至今" },
];

export default function MarketIntelPage() {
  const [intel, setIntel] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Expanded form fields
  const [market, setMarket] = useState("United States");
  const [industry, setIndustry] = useState("LED Display");
  const [keywords, setKeywords] = useState("");
  const [compareMarket, setCompareMarket] = useState("");
  const [dateRange, setDateRange] = useState("today 12-m");
  const [category, setCategory] = useState("");
  const [customContext, setCustomContext] = useState("");

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
      const res = await analyzeMarket({
        market,
        industry,
        keywords: keywords || undefined,
        compareMarket: compareMarket || undefined,
        dateRange,
        category: category || undefined,
        context: customContext || undefined,
      });
      if (res.success) {
        setIntel((prev) => [res.data, ...prev]);
      }
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  const trendColors: Record<string, string> = {
    growing: "text-green-600 bg-green-50", stable: "text-blue-600 bg-blue-50",
    declining: "text-red-600 bg-red-50",
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">市场情报</h2>
          <p className="text-sm text-gray-500">接入 Google Trends 真实数据 + AI 深度分析</p>
        </div>
      </div>

      {/* Analysis Form — expanded */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">市场分析参数</h3>

        {/* Row 1: Market + Industry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">目标市场 *</label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputClass}>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">行业/产品 *</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Compare Market + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">对比市场（可选）</label>
            <select value={compareMarket} onChange={(e) => setCompareMarket(e.target.value)} className={inputClass}>
              <option value="">不对比</option>
              {MARKETS.filter((m) => m !== market).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">对比两个市场的需求差异</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">行业分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Row 3: Keywords + Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">额外关键词（逗号分隔）</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例如：wholesale, B2B, import, distributor"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">除了行业名之外，还追踪哪些关键词的搜索趋势</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">时间范围</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className={inputClass}>
              {DATE_RANGES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {/* Row 4: Custom Context */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">补充背景信息（可选，帮助 AI 给出更精准建议）</label>
          <textarea
            value={customContext}
            onChange={(e) => setCustomContext(e.target.value)}
            rows={3}
            placeholder={`例如：&#10;- 我们已经进入欧洲市场 3 年，现在想拓展到这个市场&#10;- 我们的产品价格带在 $50-200&#10;- 目前正在接触 3 个当地经销商&#10;- 我们的优势是交期快（7天）和 MOQ 低（10件起订）`}
            className={inputClass + " resize-none"}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !market || !industry}
          className="w-full py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              AI 正在分析 Google Trends 数据...
            </>
          ) : "分析市场（调用 Google Trends + AI 分析）"}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      ) : intel.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/></svg>
          <p className="text-lg">输入参数，获取真实市场数据</p>
          <p className="text-sm mt-1">系统将调用 Google Trends 获取搜索热度 + AI 深度分析</p>
        </div>
      ) : (
        <div className="space-y-4">
          {intel.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{item.market} · {item.industry}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    {item.keywords && <span>关键词: {item.keywords}</span>}
                    {item.compareMarket && <span>| 对比: {item.compareMarket}</span>}
                    {item.dateRange && <span>| {item.dateRange}</span>}
                  </div>
                </div>
                {item.analysis?.marketTrend && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${trendColors[item.analysis.marketTrend] || "text-gray-500 bg-gray-50"}`}>
                    {item.analysis.marketTrend === "growing" ? "增长趋势" : item.analysis.marketTrend === "stable" ? "稳定" : "下降趋势"}
                    {item.analysis.estimatedGrowthRate && ` ${item.analysis.estimatedGrowthRate > 0 ? "+" : ""}${item.analysis.estimatedGrowthRate}%`}
                  </span>
                )}
              </div>

              {/* AI Analysis */}
              {item.analysis ? (
                <div className="space-y-4">
                  {/* Key Insights */}
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-xs font-medium text-blue-600 mb-1">AI 分析洞察</div>
                    <p className="text-sm text-blue-800">{item.analysis.keyInsights}</p>
                    {item.analysis.seasonality && (
                      <p className="text-xs text-blue-600 mt-2">季节性: {item.analysis.seasonality}</p>
                    )}
                  </div>

                  {/* Google Trends actual data */}
                  {item.trendData?.interestByRegion?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">搜索热度区域分布（Google Trends 真实数据）</div>
                      <div className="flex flex-wrap gap-2">
                        {item.trendData.interestByRegion.slice(0, 8).map((r: any, ri: number) => (
                          <span key={ri} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                            <span className="font-medium">{r.region}</span> <span className="text-gray-400">{r.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Related queries */}
                  {item.trendData?.relatedQueries && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">相关热搜词</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.trendData.relatedQueries.rising?.slice(0, 8).map((q: string, qi: number) => (
                          <span key={qi} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">↑ {q}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grid: Opportunities + Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opportunities */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">市场机会</div>
                      <div className="space-y-2">
                        {item.analysis.opportunities?.map((o: any, oi: number) => (
                          <div key={oi} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-green-700">{o.opportunity}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${o.confidence === "high" ? "bg-green-200 text-green-800" : o.confidence === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                                信心: {o.confidence}
                              </span>
                            </div>
                            <p className="text-xs text-green-600">{o.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">潜在风险</div>
                      <div className="space-y-2">
                        {item.analysis.risks?.map((r: any, ri: number) => (
                          <div key={ri} className="p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-red-700">{r.risk}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${r.severity === "high" ? "bg-red-200 text-red-800" : r.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                                严重: {r.severity}
                              </span>
                            </div>
                            <p className="text-xs text-red-600">{r.mitigation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Demand Drivers + Channels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {item.analysis.demandDrivers?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">需求驱动因素</div>
                        <div className="space-y-1">
                          {item.analysis.demandDrivers.map((d: string, di: number) => (
                            <div key={di} className="text-sm text-gray-700">• {d}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.analysis.recommendedChannels?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">推荐获客渠道</div>
                        <div className="space-y-1">
                          {item.analysis.recommendedChannels.map((ch: string, ci: number) => (
                            <div key={ci} className="text-sm text-gray-700">• {ch}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.analysis.pricingStrategy && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">定价策略建议</div>
                        <p className="text-sm text-gray-700">{item.analysis.pricingStrategy}</p>
                      </div>
                    )}
                  </div>

                  {/* Competitor Landscape */}
                  {item.analysis.competitorLandscape && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-xs font-medium text-gray-500 mb-2">竞争格局</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">市场饱和度：</span>
                          <span className="font-medium">{
                            item.analysis.competitorLandscape.saturation === "low" ? "低（进入机会大）" :
                            item.analysis.competitorLandscape.saturation === "medium" ? "中等" : "高（竞争激烈）"
                          }</span>
                        </div>
                        <div>
                          <span className="text-gray-500">主要玩家：</span>
                          <span className="font-medium text-xs">{(item.analysis.competitorLandscape.majorPlayers || []).join(", ")}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">进入壁垒：</span>
                          <span className="font-medium text-xs">{(item.analysis.competitorLandscape.entryBarriers || []).join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Plan */}
                  {item.analysis.actionPlan && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="text-xs font-semibold text-blue-600 mb-2">行动建议（按优先级排序）</div>
                      <p className="text-sm text-blue-800 whitespace-pre-line">{item.analysis.actionPlan}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 text-right">
                    分析时间：{item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN") : ""}
                    {item.trendData ? " · 含 Google Trends 真实数据" : " · 基于 AI 分析"}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无分析结果</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
