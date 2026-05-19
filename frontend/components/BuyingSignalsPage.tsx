"use client";

import { useState } from "react";

const MARKETS = ["United States","Germany","United Kingdom","Australia","Japan","UAE","Saudi Arabia","Brazil","Mexico","India","Canada","France"];
const INDUSTRIES = ["LED Display","Electronics","Industrial Machinery","Consumer Goods","Medical Devices","Auto Parts","Solar Energy","Building Materials","Furniture","Textile & Apparel"];

const SIGNAL_ICONS: Record<string, string> = {
  funding: "💰", hiring: "👥", expansion: "🏗️", new_project: "🚀", trade_show: "🎪",
};
const SIGNAL_LABELS: Record<string, string> = {
  funding: "获得融资", hiring: "正在招聘", expansion: "业务扩张", new_project: "新项目", trade_show: "行业展会",
};
const STRENGTH_COLORS: Record<string, string> = {
  strong: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  weak: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function BuyingSignalsPage() {
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("United States");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!product.trim()) return;
    setLoading(true);
    setSignals([]);
    try {
      const res = await fetch("/api/buying-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: product.trim(), market, industry }),
      });
      const data = await res.json();
      if (data.success) setSignals(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const inputC = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Buying Signals 采购信号</h2>
        <p className="text-sm text-gray-500 mt-1">通过公开信息发现正在准备采购的公司 — 招聘、融资、扩张、参展</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">产品 *</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="例：LED display" className={inputC} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">目标市场 *</label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputC}>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">行业</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="可选" list="signals-industries" className={inputC} />
            <datalist id="signals-industries">{INDUSTRIES.map((i) => <option key={i} value={i} />)}</datalist>
          </div>
          <button onClick={handleSearch} disabled={loading || !product.trim()} className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? "搜索中..." : "发现采购信号"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>
          <p className="text-lg">搜索采购信号</p>
          <p className="text-sm mt-1">输入产品和市场，发现正在准备采购的公司</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">发现 <b className="text-gray-900">{signals.length}</b> 个采购信号</span>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> 强烈</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> 中等</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"/> 一般</span>
            </div>
          </div>
          {signals.map((s: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{s.company_name}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${STRENGTH_COLORS[s.signal_strength] || ""}`}>
                      {s.signal_strength === "strong" ? "强烈信号" : s.signal_strength === "medium" ? "中等信号" : "一般信号"}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 rounded-full">
                      {SIGNAL_ICONS[s.signal_type]} {SIGNAL_LABELS[s.signal_type] || s.signal_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{s.description}</p>
                  {s.source_url && (
                    <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">查看来源 →</a>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-medium text-gray-500 mb-1">匹配度</div>
                  <div className="text-lg font-bold text-blue-600">{s.match_score}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">AI 建议：</span>
                  <span className="text-xs text-gray-700 font-medium">{s.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
