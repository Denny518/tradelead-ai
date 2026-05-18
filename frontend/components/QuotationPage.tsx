"use client";

import { useState } from "react";
import { generateQuotation } from "@/lib/api";

interface ProductLine {
  name: string;
  specs: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

const LANGUAGES = [
  { value: "en", label: "English" }, { value: "es", label: "Español" },
  { value: "fr", label: "Français" }, { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" }, { value: "ru", label: "Русский" },
  { value: "zh", label: "中文" },
];

export default function QuotationPage() {
  const [customerInfo, setCustomerInfo] = useState({ company_name: "", contact_name: "", email: "" });
  const [products, setProducts] = useState<ProductLine[]>([{ name: "", specs: "", unitPrice: 0, quantity: 1, total: 0 }]);
  const [options, setOptions] = useState({ currency: "USD", validUntil: "", paymentTerms: "T/T 30% deposit, 70% before shipment", deliveryTerms: "15-20 days after deposit", notes: "", language: "en" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const updateProduct = (i: number, field: string, value: any) => {
    setProducts((prev) => {
      const next = [...prev];
      (next[i] as any)[field] = value;
      if (field === "unitPrice" || field === "quantity") {
        next[i].total = (next[i].unitPrice || 0) * (next[i].quantity || 0);
      }
      return next;
    });
  };

  const grandTotal = products.reduce((s, p) => s + p.total, 0);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateQuotation({ customerInfo, products, options });
      setResult(res.data);
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">AI 报价单生成器</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">客户信息</h3>
            <div className="space-y-3">
              <input type="text" placeholder="公司名称" value={customerInfo.company_name} onChange={(e) => setCustomerInfo({ ...customerInfo, company_name: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="联系人" value={customerInfo.contact_name} onChange={(e) => setCustomerInfo({ ...customerInfo, contact_name: e.target.value })} className={inputClass} />
                <input type="email" placeholder="邮箱" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">产品清单</h3>
              <button onClick={() => setProducts([...products, { name: "", specs: "", unitPrice: 0, quantity: 1, total: 0 }])} className="text-xs text-primary hover:underline">+ 添加产品</button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-start">
                <input type="text" placeholder="品名" value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} className={inputClass + " col-span-1"} />
                <input type="text" placeholder="规格" value={p.specs} onChange={(e) => updateProduct(i, "specs", e.target.value)} className={inputClass + " col-span-1"} />
                <input type="number" placeholder="单价" value={p.unitPrice || ""} onChange={(e) => updateProduct(i, "unitPrice", parseFloat(e.target.value) || 0)} className={inputClass + " col-span-1"} />
                <input type="number" placeholder="数量" value={p.quantity || ""} onChange={(e) => updateProduct(i, "quantity", parseInt(e.target.value) || 0)} className={inputClass + " col-span-1"} />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-700">{p.total.toFixed(0)}</span>
                  {products.length > 1 && (
                    <button onClick={() => setProducts(products.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs ml-1">✕</button>
                  )}
                </div>
              </div>
            ))}
            <div className="text-right mt-3 text-sm font-semibold text-gray-900">
              总计：{options.currency} {grandTotal.toFixed(2)}
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">条款与选项</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">货币</label>
                <select value={options.currency} onChange={(e) => setOptions({ ...options, currency: e.target.value })} className={inputClass}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>CNY</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">有效期</label>
                <input type="text" placeholder="例：2026-06-18" value={options.validUntil} onChange={(e) => setOptions({ ...options, validUntil: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">付款方式</label>
                <input type="text" value={options.paymentTerms} onChange={(e) => setOptions({ ...options, paymentTerms: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">交期</label>
                <input type="text" value={options.deliveryTerms} onChange={(e) => setOptions({ ...options, deliveryTerms: e.target.value })} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">语言</label>
                <select value={options.language} onChange={(e) => setOptions({ ...options, language: e.target.value })} className={inputClass}>
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500">备注</label>
                <textarea value={options.notes} onChange={(e) => setOptions({ ...options, notes: e.target.value })} rows={2} className={inputClass} />
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || products.length === 0 || !customerInfo.company_name} className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? "AI 生成中..." : "生成报价单"}
          </button>
        </div>

        {/* Preview */}
        <div>
          {result ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{result.quotationTitle}</h3>
              <p className="text-sm text-gray-600 mb-4">{result.headerNote}</p>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-2 pr-2 font-medium text-gray-600">品名</th>
                    <th className="py-2 pr-2 font-medium text-gray-600">规格</th>
                    <th className="py-2 pr-2 font-medium text-gray-600 text-right">单价</th>
                    <th className="py-2 pr-2 font-medium text-gray-600 text-center">数量</th>
                    <th className="py-2 font-medium text-gray-600 text-right">小计</th>
                  </tr>
                </thead>
                <tbody>
                  {result.productTable?.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-2">{row.name}</td>
                      <td className="py-2 pr-2 text-gray-500 text-xs">{row.specs}</td>
                      <td className="py-2 pr-2 text-right">{options.currency} {row.unitPrice?.toFixed(2)}</td>
                      <td className="py-2 pr-2 text-center">{row.quantity}</td>
                      <td className="py-2 text-right font-medium">{options.currency} {row.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td colSpan={4} className="py-3 text-right pr-2">总计</td>
                    <td className="py-3 text-right">{options.currency} {grandTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <p className="text-sm text-gray-700 mb-2">{result.summaryText}</p>
              <p className="text-sm text-gray-700 mb-4">{result.closingText}</p>
              <p className="text-xs text-gray-400">{result.footerNote}</p>

              <div className="mt-4 flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">打印 PDF</button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">复制 JSON</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <p>左边填写客户和产品信息</p>
              <p className="text-sm mt-1">AI 将生成专业报价单</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
