"use client";

import { useState } from "react";

const MARKETS = [
  "United States", "Germany", "United Kingdom", "Australia", "Canada", "Japan",
  "France", "Brazil", "UAE", "Saudi Arabia", "South Korea", "Mexico", "India",
  "Southeast Asia", "Italy", "Spain", "Netherlands", "Turkey",
];

const ROLES = [
  { value: "", label: "不限职位" },
  { value: "CEO", label: "CEO / 创始人" },
  { value: "procurement", label: "采购经理" },
  { value: "sales", label: "销售总监 / VP Sales" },
  { value: "marketing", label: "市场总监" },
  { value: "operations", label: "运营经理" },
  { value: "import", label: "进口经理" },
  { value: "supplychain", label: "供应链经理" },
];

const COMPANY_TYPES = [
  { value: "", label: "不限类型" },
  { value: "distributor", label: "分销商 (Distributor)" },
  { value: "wholesaler", label: "批发商 (Wholesaler)" },
  { value: "importer", label: "进口商 (Importer)" },
  { value: "retailer", label: "零售商 (Retailer)" },
  { value: "manufacturer", label: "制造商 (Manufacturer)" },
  { value: "agent", label: "代理商 (Agent)" },
];

// SVG icons for each engine (not emoji)
const EngineIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "google":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
    case "google_maps":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "google_local":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h6M8 16h4"/></svg>;
    case "google_shopping":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>;
    case "google_news":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2V8"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
    case "bing":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "all":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 019.5 6.5M12 2v10l6.5 4.5M12 22a10 10 0 009.5-6.5M12 22V12l-9.5-6.5M2.5 6.5A10 10 0 0112 2M22 12h-10M2 12h10"/></svg>;
    case "linkedin":
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
    default:
      return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>;
  }
};

const ENGINES = [
  { value: "google", label: "Google", icon: <EngineIcon type="google" />, desc: "通用网页搜索" },
  { value: "google_maps", label: "Maps", icon: <EngineIcon type="google_maps" />, desc: "搜实体商家" },
  { value: "google_local", label: "Local", icon: <EngineIcon type="google_local" />, desc: "商家+评分+电话" },
  { value: "linkedin", label: "LinkedIn", icon: <EngineIcon type="linkedin" />, desc: "site:linkedin.com 搜决策人" },
  { value: "google_shopping", label: "Shopping", icon: <EngineIcon type="google_shopping" />, desc: "搜同类产品" },
  { value: "google_news", label: "News", icon: <EngineIcon type="google_news" />, desc: "行业新闻" },
  { value: "bing", label: "Bing", icon: <EngineIcon type="bing" />, desc: "交叉验证" },
  { value: "all", label: "全部引擎", icon: <EngineIcon type="all" />, desc: "并行搜索，最全面" },
];

interface SearchFormProps {
  onSearch: (params: {
    product: string; market: string; industry: string; limit: number;
    role: string; companyType: string; customQuery: string; excludeKeywords: string;
    engine: string; mapsLocation: string; mapsRadius: string; shoppingPriceRange: string;
    newsTimeframe: string; bingMarket: string;
  }) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("United States");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState(10);
  const [role, setRole] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [excludeKeywords, setExcludeKeywords] = useState("");
  const [engine, setEngine] = useState("google");
  const [mapsLocation, setMapsLocation] = useState("");
  const [mapsRadius, setMapsRadius] = useState("");
  const [shoppingPriceRange, setShoppingPriceRange] = useState("");
  const [newsTimeframe, setNewsTimeframe] = useState("");
  const [bingMarket, setBingMarket] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;
    onSearch({
      product: product.trim(), market, industry: industry.trim(), limit,
      role, companyType, customQuery: customQuery.trim(), excludeKeywords: excludeKeywords.trim(),
      engine, mapsLocation, mapsRadius, shoppingPriceRange, newsTimeframe, bingMarket,
    });
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">客户搜索</h2>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-primary hover:underline"
        >
          {showAdvanced ? "收起高级选项" : "展开高级选项"}
        </button>
      </div>

      {/* Engine Selector */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">搜索引擎</label>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 gap-2">
          {ENGINES.map((eng) => (
            <button
              key={eng.value}
              type="button"
              onClick={() => setEngine(eng.value)}
              className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                engine === eng.value
                  ? "border-primary bg-blue-50 shadow-sm [&_svg]:stroke-primary [&_svg]:fill-primary/20"
                  : "border-gray-200 hover:border-gray-300 bg-white [&_svg]:stroke-gray-400 [&_svg]:fill-none"
              }`}
            >
              <div className="flex items-center justify-center w-5 h-5 mx-auto">{eng.icon}</div>
              <div className="text-[10px] font-medium text-gray-700 mt-0.5">{eng.label}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {ENGINES.find((e) => e.value === engine)?.desc || ""}
        </p>
      </div>

      {/* Basic fields — always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">产品名称 *</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：LED显示屏、家具、机械配件"
            className={inputClass}
            required
          />
          <p className="text-xs text-gray-400 mt-1">输入你出口的产品英文名，AI 会搜索最匹配的买家</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">目标市场</label>
          <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputClass}>
            {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">行业（可选，缩小范围）</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="例如：Electronics, Furniture, Machinery"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">搜索数量</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={inputClass}>
            <option value={10}>10 条</option>
            <option value={20}>20 条</option>
            <option value={50}>50 条</option>
          </select>
        </div>
      </div>

      {/* Advanced fields — toggled */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">目标职位</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">定位特定职位的联系人</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">公司类型</label>
              <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} className={inputClass}>
                {COMPANY_TYPES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">筛选特定类型的买家</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">排除关键词</label>
              <input
                type="text"
                value={excludeKeywords}
                onChange={(e) => setExcludeKeywords(e.target.value)}
                placeholder="例如：used, rental, repair"
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">排除不相关的搜索结果</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">自定义搜索语句（覆盖默认搜索词）</label>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={2}
              placeholder={`例如：site:linkedin.com "procurement manager" LED display United States`}
              className={inputClass + " resize-none font-mono text-xs"}
            />
            <p className="text-xs text-gray-400 mt-1">高级用户可直接输入 Google 搜索语句，留空则自动生成搜索词</p>
          </div>

          {/* Engine-specific filters */}
          <div className="p-4 bg-gray-50 rounded-xl mt-4">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">引擎专属参数</div>

            {(engine === "google_maps" || engine === "google_local" || engine === "all") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">地理位置（城市/地址）</label>
                  <input value={mapsLocation} onChange={(e) => setMapsLocation(e.target.value)} placeholder="例：Los Angeles, CA" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">搜索半径</label>
                  <select value={mapsRadius} onChange={(e) => setMapsRadius(e.target.value)} className={inputClass}>
                    <option value="">默认</option><option value="10km">10 km</option><option value="25km">25 km</option><option value="50km">50 km</option><option value="100km">100 km</option>
                  </select>
                </div>
              </div>
            )}

            {(engine === "google_shopping" || engine === "all") && (
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">价格范围</label>
                <input value={shoppingPriceRange} onChange={(e) => setShoppingPriceRange(e.target.value)} placeholder="例：50-200" className={inputClass + " max-w-xs"} />
              </div>
            )}

            {(engine === "google_news" || engine === "all") && (
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">时间范围</label>
                <select value={newsTimeframe} onChange={(e) => setNewsTimeframe(e.target.value)} className={inputClass + " max-w-xs"}>
                  <option value="">不限</option><option value="d">1天</option><option value="w">1周</option><option value="m">1月</option><option value="y">1年</option>
                </select>
              </div>
            )}

            {(engine === "bing" || engine === "all") && (
              <div className="mb-3">
                <label className="block text-xs text-gray-600 mb-1">Bing 市场</label>
                <select value={bingMarket} onChange={(e) => setBingMarket(e.target.value)} className={inputClass + " max-w-xs"}>
                  <option value="">跟随目标市场</option><option value="en-US">US</option><option value="en-GB">UK</option><option value="de-DE">DE</option><option value="fr-FR">FR</option><option value="ja-JP">JP</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !product.trim()}
        className="mt-5 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            搜索中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/></svg>
            搜索客户
          </>
        )}
      </button>
    </form>
  );
}
