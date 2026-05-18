"use client";

import { useState } from "react";

const MARKETS = [
  "United States",
  "Germany",
  "United Kingdom",
  "Australia",
  "Canada",
  "Japan",
  "France",
  "Brazil",
  "UAE",
  "Saudi Arabia",
  "South Korea",
  "Mexico",
];

interface SearchFormProps {
  onSearch: (params: { product: string; market: string; industry: string; limit: number }) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("United States");
  const [industry, setIndustry] = useState("");
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) return;
    onSearch({ product: product.trim(), market, industry: industry.trim(), limit });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">客户搜索</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">产品名称 *</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="例如：LED显示屏"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">目标市场</label>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
          >
            {MARKETS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">行业（可选）</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="例如：Electronics"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">搜索数量</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
          >
            <option value={10}>10 条</option>
            <option value={20}>20 条</option>
            <option value={50}>50 条</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading || !product.trim()}
        className="mt-5 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            搜索中...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            搜索客户
          </>
        )}
      </button>
    </form>
  );
}
