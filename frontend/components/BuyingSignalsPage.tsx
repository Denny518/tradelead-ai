"use client";

import { useState } from "react";

// Expanded global market list (matching MarketIntelPage)
const MARKETS = [
  "Global (No Filter)", "United States", "Germany", "United Kingdom", "Australia", "Canada", "Japan",
  "France", "Brazil", "UAE", "Saudi Arabia", "South Korea", "Mexico", "India",
  "Southeast Asia", "Italy", "Spain", "Netherlands", "Turkey", "Poland",
  "Thailand", "Vietnam", "Russia", "Indonesia", "South Africa", "Nigeria",
  "Argentina", "Chile", "Colombia", "Peru", "Egypt", "Kenya", "Philippines",
  "Malaysia", "Singapore", "Hong Kong", "Pakistan", "Bangladesh",
  "Iran", "Israel", "Sweden", "Norway", "Denmark", "Finland", "Switzerland",
  "Austria", "Belgium", "Portugal", "Greece", "Czech Republic", "Romania",
  "Ukraine", "Kazakhstan", "Morocco", "Ghana", "Ethiopia", "Tanzania",
];

const PLATFORM_NAMES: Record<string, string> = {
  reddit: "Reddit", bluesky: "Bluesky", linkedin_post: "LinkedIn", linkedin_jobs: "LinkedIn Jobs",
  x_post: "X", threads: "Threads", google_news: "Google News", google: "Google",
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: "border-orange-400 bg-orange-50 text-orange-700",
  bluesky: "border-blue-400 bg-blue-50 text-blue-700",
  linkedin_post: "border-indigo-400 bg-indigo-50 text-indigo-700",
  linkedin_jobs: "border-indigo-400 bg-indigo-50 text-indigo-700",
  x_post: "border-gray-600 bg-gray-50 text-gray-700",
  threads: "border-purple-400 bg-purple-50 text-purple-700",
  google_news: "border-green-400 bg-green-50 text-green-700",
  google: "border-cyan-400 bg-cyan-50 text-cyan-700",
};

// ── Official SVG Icons (not emoji) ──────────────────────────
function PlatformIcon({ platform, size = "w-4 h-4" }: { platform: string; size?: string }) {
  const cls = `${size} flex-shrink-0`;
  switch (platform) {
    case "reddit":
      return <svg className={cls} viewBox="0 0 24 24" fill="#FF4500"><circle cx="12" cy="12" r="11" fill="#FF4500"/><path d="M16.5 12a1.5 1.5 0 013 0 1.5 1.5 0 01-3 0zm-12 0a1.5 1.5 0 013 0 1.5 1.5 0 01-3 0zm3.5 3c.5 1.5 2 2.5 4 2.5s3.5-1 4-2.5m-1.5-5.5l3-2-1 4" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "bluesky":
      return <svg className={cls} viewBox="0 0 24 24" fill="#1185FE"><path d="M6.34 4.93c2.62 1.97 5.44 5.96 6.47 8.1 1.03-2.14 3.85-6.13 6.47-8.1C21.17 3.43 24 2.7 24 6c0 .7-.4 5.82-.63 6.66-.82 2.94-3.8 3.69-6.45 3.24 4.63.78 5.8 3.4 3.26 6.01-4.82 4.95-6.93-1.24-7.47-2.82-.21-.63-.28-.47-.28.55 0 1.47-.8 5.36-3.42 5.36s-3.42-3.89-3.42-5.36c0-1.02-.07-1.18-.28-.55-.54 1.58-2.65 7.77-7.47 2.82C.08 16.6 1.24 14 5.88 13.2c-2.65.45-5.63-.3-6.45-3.24C-.8 8.52 0 3.4 0 6c0-3.3 2.83-2.57 4.78-1.07z"/></svg>;
    case "linkedin_post":
    case "linkedin_jobs":
      return <svg className={cls} viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    case "x_post":
      return <svg className={cls} viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "threads":
      return <svg className={cls} viewBox="0 0 24 24" fill="#000"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12c.029-3.588 1.287-6.44 3.539-8.491C7.056 1.621 9.816.413 12.592.388c2.844-.026 5.538.999 7.569 2.882l-1.48 1.618C16.906 3.317 14.85 2.5 12.62 2.52c-2.226.02-4.15.97-5.72 2.82-1.526 1.8-2.299 4.252-2.299 7.29 0 3.04.663 5.425 1.97 7.091 1.35 1.72 3.25 2.591 5.65 2.591h.005c.548 0 1.107-.029 1.66-.086 1.21-.126 2.264-.43 3.134-.902l.472-.262.087-.487c.166-.93.208-2.024.115-3.164-.139.05-.296.098-.472.141-.567.14-1.308.22-2.027.193h-.014c-2 0-3.56-.594-4.578-1.744-.98-1.104-1.414-2.687-1.293-4.705.116-1.94.918-3.37 2.307-4.113 1.24-.665 2.78-.844 4.205-.492 1.559.386 2.75 1.38 3.294 2.753.28.706.37 1.483.28 2.304-.15 1.362-.718 3.628-2.377 5.035-1.223 1.035-2.769 1.466-4.332 1.466h-.003c-1.845 0-3.326-.464-4.404-1.378-1.12-.95-1.895-2.382-2.242-4.147l1.936-.443c.273 1.191.79 2.115 1.537 2.748.713.604 1.66.92 2.88.966 1.596.074 2.896-.48 3.865-1.651 1.238-1.495 1.395-3.608 1.488-4.626.055-.613.018-1.177-.096-1.638-.317-1.288-1.15-2.103-2.305-2.438-.675-.196-1.55-.255-2.314.102-.847.395-1.454 1.192-1.646 2.159-.103.517-.1 1.098.088 1.453.207.393.528.591 1.04.64.423.04.982-.05 1.398-.172l.73-.348.168.787c.06.278-.073.555-.273.695-.37.259-.978.395-1.66.356-.78-.045-1.407-.398-1.85-1.045-.457-.669-.594-1.59-.396-2.629.386-2.025 1.754-3.34 3.571-4.08 1.26-.512 2.719-.61 4.027-.286 2.21.546 3.76 2.047 4.288 4.153l.072.291.029.318c.11 1.19.095 2.768-.226 4.323 1.035-.758 1.76-2.063 1.94-3.722.1-.92.02-1.82-.24-2.598-.698-2.093-2.21-3.684-4.134-4.348-1.837-.632-3.86-.447-5.496.546-1.724 1.045-2.71 2.85-2.93 5.365-.23 2.63.394 4.702 1.785 6.137 1.396 1.44 3.373 2.171 5.878 2.171h.005c1.86-.007 3.558-.628 4.897-1.798l1.481 1.56c-1.692 1.478-3.95 2.316-6.437 2.345h-.006z"/></svg>;
    case "google_news":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2V8"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
    default:
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
  }
}

const INTENT_COLORS: Record<string, string> = {
  strong: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  weak: "bg-gray-100 text-gray-600 border-gray-200",
};
const INTENT_LABELS: Record<string, string> = {
  strong: "强购买意向", medium: "中等意向", weak: "弱意向",
};

export default function BuyingSignalsPage() {
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("Global (No Filter)");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["reddit", "bluesky", "linkedin_post", "buying_signals"]);
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

    // Build keyword: product + market (if not global)
    const marketFilter = market === "Global (No Filter)" ? "" : market;
    const keyword = [product.trim(), marketFilter].filter(Boolean).join(" ");

    const allResults: any[] = [];

    // Social channels
    const socialChannels = selectedChannels.filter((c) => c !== "buying_signals");
    if (socialChannels.length > 0) {
      try {
        const res = await fetch("/api/social-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword, channels: socialChannels, limit: 15 }),
        });
        const data = await res.json();
        if (data.success) allResults.push(...data.data);
      } catch {}
    }

    // Buying signals (corporate)
    if (selectedChannels.includes("buying_signals")) {
      try {
        const res = await fetch("/api/buying-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: product.trim(), market: marketFilter, industry: "" }),
        });
        const data = await res.json();
        if (data.success) allResults.push(...data.data);
      } catch {}
    }

    // Sort: strong signals first
    const intentOrder: Record<string, number> = { strong: 0, medium: 1, weak: 2 };
    allResults.sort((a, b) => {
      const aIntent = intentOrder[a.buying_intent] ?? 2;
      const bIntent = intentOrder[b.buying_intent] ?? 2;
      if (aIntent !== bIntent) return aIntent - bIntent;
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    });

    setSignals(allResults);
    setLoading(false);
  };

  const handleGenerateReply = async (idx: number, signal: any) => {
    setGeneratingReply(idx);
    try {
      const res = await fetch("/api/generate-social-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_content: signal.title + "\n\n" + signal.content,
          post_platform: PLATFORM_NAMES[signal.platform] || (signal.signal_type ? "corporate signal" : "social media"),
          product_info: product,
        }),
      });
      const data = await res.json();
      if (data.success) setReplies((prev) => ({ ...prev, [idx]: data.data.reply }));
    } catch { }
    finally { setGeneratingReply(null); }
  };

  const inputC = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white";

  // Count signals by type
  const socialCount = signals.filter((s) => s.platform && s.platform !== "google_news" && s.platform !== "google").length;
  const corporateCount = signals.filter((s) => s.signal_type).length;
  const isSocial = (s: any) => s.platform && s.platform !== "google_news" && s.platform !== "google";
  const isCorporate = (s: any) => !!s.signal_type;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">采购信号与社交监控</h2>
        <p className="text-sm text-gray-500 mt-1">发现社交平台上的购买意向帖 + 企业采购信号（融资/招聘/扩张），AI 生成回复</p>
      </div>

      {/* Channel selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">数据源</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Social platforms */}
          <span className="text-[10px] text-gray-400 self-center mr-1">社交平台：</span>
          {[
            { value: "reddit", label: "Reddit" },
            { value: "bluesky", label: "Bluesky" },
            { value: "linkedin_post", label: "LinkedIn" },
            { value: "x_post", label: "X" },
            { value: "threads", label: "Threads" },
          ].map((ch) => (
            <button
              key={ch.value}
              onClick={() => toggleChannel(ch.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                selectedChannels.includes(ch.value)
                  ? "border-primary bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <PlatformIcon platform={ch.value} size="w-3.5 h-3.5" />
              {ch.label}
            </button>
          ))}
          <span className="text-[10px] text-gray-400 self-center mx-1">|</span>
          <span className="text-[10px] text-gray-400 self-center mr-1">企业信号：</span>
          <button
            onClick={() => toggleChannel("buying_signals")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
              selectedChannels.includes("buying_signals")
                ? "border-primary bg-blue-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
            企业采购信号
          </button>
        </div>

        {/* Search fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">产品/关键词 *</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="例：LED display" className={inputC} />
            <p className="text-[10px] text-gray-400 mt-0.5">输入你的产品英文名，社交平台搜索用此关键词</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">目标市场（可选）</label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputC}>
              {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-[10px] text-gray-400 mt-0.5">附加到关键词后，缩小搜索范围</p>
          </div>
          <button onClick={handleSearch} disabled={loading || !product.trim()} className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? "搜索中..." : "发现信号"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      ) : signals.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              发现 <b className="text-gray-900">{signals.length}</b> 条信号
              {socialCount > 0 && <span className="text-gray-400">（{socialCount} 社交 + {corporateCount} 企业）</span>}
            </span>
          </div>
          {signals.map((s, i) => {
            const social = isSocial(s);
            const corporate = isCorporate(s);

            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Source badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {social && s.platform && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${SOURCE_COLORS[s.platform] || "border-gray-200"}`}>
                          <PlatformIcon platform={s.platform} size="w-3 h-3" />
                          {PLATFORM_NAMES[s.platform] || s.platform}
                        </span>
                      )}
                      {corporate && s.signal_type && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
                          {s.signal_type === "funding" ? "融资" : s.signal_type === "hiring" ? "招聘" : s.signal_type === "expansion" ? "扩张" : s.signal_type === "trade_show" ? "展会" : s.signal_type}
                        </span>
                      )}
                      {s.buying_intent && (
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${INTENT_COLORS[s.buying_intent]}`}>{INTENT_LABELS[s.buying_intent]}</span>
                      )}
                      {s.signal_strength && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-50 text-red-600 border border-red-200">{s.signal_strength === "strong" ? "强烈" : s.signal_strength === "medium" ? "中等" : "一般"}</span>
                      )}
                      {s.subreddit && <span className="text-[10px] text-orange-500 font-medium">{s.subreddit}</span>}
                      {s.author && <span className="text-[10px] text-gray-400">u/{s.author}</span>}
                    </div>

                    {/* Content */}
                    {social ? (
                      <>
                        <p className="text-sm font-medium text-gray-900 mb-1">{s.title}</p>
                        {s.content && <p className="text-xs text-gray-500 line-clamp-3 mb-1">{s.content}</p>}
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900">{s.company_name || s.description}</p>
                        {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                      </>
                    )}

                    {/* Links */}
                    <div className="flex gap-3 flex-wrap">
                      {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">查看原帖 →</a>}
                      {s.source_url && <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">来源 →</a>}
                    </div>

                    {s.recommendation && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-[10px] text-gray-400">AI 建议：</span>
                        <span className="text-xs text-gray-700 font-medium">{s.recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Reply for social posts only */}
                {social && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {replies[i] ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap">{replies[i]}</div>
                        <div className="flex gap-2">
                          <button onClick={() => navigator.clipboard.writeText(replies[i])} className="px-3 py-1.5 text-[11px] font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"/></svg>复制回复
                          </button>
                          <button onClick={() => handleGenerateReply(i, s)} className="px-3 py-1.5 text-[11px] font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">重新生成</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleGenerateReply(i, s)} disabled={generatingReply === i} className="px-3 py-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 transition-colors flex items-center gap-1">
                        {generatingReply === i ? (
                          <>AI 生成中...</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg> AI 生成回复</>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
