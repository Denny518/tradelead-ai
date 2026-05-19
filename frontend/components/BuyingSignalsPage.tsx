"use client";

import { useState } from "react";

const MARKETS = ["United States","Germany","United Kingdom","Australia","Japan","UAE","Saudi Arabia","Brazil","Mexico","India","Canada","France"];

const CHANNELS = [
  { value: "reddit", label: "Reddit", desc: "JSON API · 免费 · 实时", status: "active", icon: "🔴" },
  { value: "bluesky", label: "Bluesky", desc: "AT Protocol · 免费 · 实时", status: "active", icon: "🦋" },
  { value: "linkedin_post", label: "LinkedIn Posts", desc: "Google 搜索公开帖", status: "active", icon: "💼" },
  { value: "x_post", label: "X (Twitter)", desc: "Google 搜索公开帖", status: "active", icon: "𝕏" },
  { value: "threads", label: "Threads", desc: "Google 搜索 · 内容较少", status: "active", icon: "🧵" },
];

const BUYING_SIGNAL_CHANNELS = [
  { value: "buying_signals", label: "采购信号", desc: "融资/招聘/扩张/展会", icon: "📊" },
];

const PLATFORM_NAMES: Record<string, string> = {
  reddit: "Reddit", bluesky: "Bluesky", linkedin_post: "LinkedIn", x_post: "X", threads: "Threads",
};
const INTENT_COLORS: Record<string, string> = {
  strong: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  weak: "bg-gray-100 text-gray-600 border-gray-200",
};
const INTENT_LABELS: Record<string, string> = {
  strong: "强购买意向", medium: "中等意向", weak: "弱意向",
};

export default function BuyingSignalsPage() {
  const [mode, setMode] = useState<"social" | "buying">("social");
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("United States");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["reddit", "bluesky", "linkedin_post"]);
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [generatingReply, setGeneratingReply] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  const handleSearch = async () => {
    if (!product.trim()) return;
    setLoading(true);
    setSignals([]);
    setReplies({});
    try {
      if (mode === "social") {
        const res = await fetch("/api/social-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: `${product.trim()} ${market}`, channels: selectedChannels, limit: 15 }),
        });
        const data = await res.json();
        if (data.success) setSignals(data.data);
      } else {
        const res = await fetch("/api/buying-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: product.trim(), market }),
        });
        const data = await res.json();
        if (data.success) setSignals(data.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleGenerateReply = async (idx: number, signal: any) => {
    setGeneratingReply(idx);
    try {
      const res = await fetch("/api/generate-social-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_content: signal.title + "\n\n" + signal.content,
          post_platform: PLATFORM_NAMES[signal.platform] || "social media",
          product_info: product,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplies((prev) => ({ ...prev, [idx]: data.data.reply }));
      }
    } catch (err) { console.error(err); }
    finally { setGeneratingReply(null); }
  };

  const inputC = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Buying Signals 采购信号</h2>
        <p className="text-sm text-gray-500 mt-1">社交平台监控 + 采购意向信号发现 + AI 生成回复</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setMode("social"); setSignals([]); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "social" ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          社交监控
        </button>
        <button onClick={() => { setMode("buying"); setSignals([]); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "buying" ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          采购信号
        </button>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        {mode === "social" && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">监控渠道 — 选择要监听的社交平台</div>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.value}
                  onClick={() => toggleChannel(ch.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm transition-all ${
                    selectedChannels.includes(ch.value)
                      ? "border-primary bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span>{ch.icon}</span>
                  <span className="font-medium">{ch.label}</span>
                  <span className="text-[10px] text-gray-400 hidden sm:inline">{ch.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">产品/关键词 *</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="例：LED display supplier" className={inputC} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">目标市场</label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputC}>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={handleSearch} disabled={loading || !product.trim()} className="px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? "搜索中..." : mode === "social" ? "搜索帖子" : "发现信号"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      ) : signals.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
          <p className="text-lg">输入关键词，发现社交平台上的采购信号</p>
          <p className="text-sm mt-1">{mode === "social" ? "Reddit、Bluesky 直接实时搜索，其他平台通过 Google 搜索公开内容" : "AI 分析招聘、融资、扩张等企业采购信号"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">发现 <b className="text-gray-900">{signals.length}</b> 条信号</span>
          </div>
          {signals.map((s: any, i: number) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {mode === "social" && s.platform && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-600 uppercase">{PLATFORM_NAMES[s.platform] || s.platform}</span>
                    )}
                    {s.buying_intent && (
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${INTENT_COLORS[s.buying_intent]}`}>{INTENT_LABELS[s.buying_intent]}</span>
                    )}
                    {s.signal_type && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-50 text-blue-700">{s.signal_type}</span>
                    )}
                    {s.signal_strength && (
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${STRENGTH_COLORS[s.signal_strength]}`}>{s.signal_strength === "strong" ? "强烈" : s.signal_strength === "medium" ? "中等" : "一般"}</span>
                    )}
                    {s.subreddit && <span className="text-[10px] text-orange-500">{s.subreddit}</span>}
                    {s.author && <span className="text-[10px] text-gray-500">@{s.author}</span>}
                    {s.relevance_score > 0 && <span className="text-[10px] text-gray-400">匹配 {s.relevance_score}</span>}
                  </div>
                  {mode === "social" ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 mb-1">{s.title}</p>
                      {s.content && <p className="text-xs text-gray-500 line-clamp-3">{s.content}</p>}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-900">{s.company_name || s.description}</p>
                      {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                    </>
                  )}
                  {s.source_url && (
                    <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-1 inline-block">来源 →</a>
                  )}
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-1 inline-block ml-3">{mode === "social" ? "查看原帖 →" : "来源 →"}</a>
                  )}
                  {s.recommendation && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">AI 建议：</span>
                      <span className="text-xs text-gray-700 font-medium">{s.recommendation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social reply section */}
              {mode === "social" && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {replies[i] ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap">{replies[i]}</div>
                      <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(replies[i])} className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"/></svg>
                          复制回复
                        </button>
                        <button onClick={() => handleGenerateReply(i, s)} className="px-3 py-1.5 text-[11px] font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">重新生成</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleGenerateReply(i, s)} disabled={generatingReply === i} className="px-3 py-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors flex items-center gap-1">
                      {generatingReply === i ? (
                        <>AI 生成中...</>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
                          AI 生成回复
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const STRENGTH_COLORS: Record<string, string> = {
  strong: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  weak: "bg-gray-100 text-gray-600 border-gray-200",
};
