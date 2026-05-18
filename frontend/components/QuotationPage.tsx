"use client";

import { useState } from "react";
import { generateQuotation } from "@/lib/api";

const LANGUAGES = ["en","es","fr","de","ar","ru","pt","ja","ko","zh"].map(v => ({value:v,label:{en:"English",es:"Español",fr:"Français",de:"Deutsch",ar:"العربية",ru:"Русский",pt:"Português",ja:"日本語",ko:"한국어",zh:"中文"}[v]||v}));

const INCOTERMS = ["FOB","CIF","EXW","DDP","CFR","FCA","CPT","CIP","DAP"];
const TEMPLATES = [
  {value:"standard",label:"标准报价单"},
  {value:"detailed",label:"详细报价单（含公司介绍）"},
  {value:"simple",label:"简洁报价单（快速发送）"},
  {value:"proforma",label:"形式发票 (Proforma Invoice)"},
];

export default function QuotationPage() {
  // Customer
  const [customerInfo, setCustomerInfo] = useState({ company_name: "", contact_name: "", email: "", phone: "", address: "" });
  // Products
  const [products, setProducts] = useState([{ name: "", specs: "", customDesc: "", unitPrice: 0, quantity: 1, total: 0, unit: "pcs" }]);
  // Options
  const [options, setOptions] = useState({
    currency: "USD", incoterm: "FOB", portOfLoading: "", portOfDestination: "",
    paymentTerms: "T/T 30% deposit, 70% before shipment", deliveryTerms: "15-20 days after deposit",
    validUntil: "", notes: "", language: "en", quotationTemplate: "standard",
    discountTerms: "", additionalFees: "", warrantyTerms: "", sampleIncluded: false,
    insuranceIncluded: false, customHeader: "", customFooter: "",
  });
  // State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const updateProduct = (i: number, field: string, value: any) => {
    setProducts((prev) => {
      const next = [...prev];
      (next[i] as any)[field] = value;
      if (field === "unitPrice" || field === "quantity") next[i].total = (next[i].unitPrice || 0) * (next[i].quantity || 0);
      return next;
    });
  };
  const grandTotal = products.reduce((s, p) => s + p.total, 0);

  const handleGenerate = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await generateQuotation({
        customerInfo,
        products: products.filter(p => p.name.trim()),
        options,
      });
      setResult(res.data);
    } catch (err) { console.error("Failed:", err); }
    finally { setLoading(false); }
  };

  const inputC = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none";

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">AI 报价单生成器</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          {/* Scenario & Template */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">报价场景</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">模板类型</label>
                <select value={options.quotationTemplate} onChange={(e) => setOptions({...options, quotationTemplate: e.target.value})} className={inputC}>
                  {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">语言</label>
                <select value={options.language} onChange={(e) => setOptions({...options, language: e.target.value})} className={inputC}>
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">贸易术语 (Incoterm)</label>
                <select value={options.incoterm} onChange={(e) => setOptions({...options, incoterm: e.target.value})} className={inputC}>
                  {INCOTERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">币种</label>
                <select value={options.currency} onChange={(e) => setOptions({...options, currency: e.target.value})} className={inputC}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>CNY</option><option>JPY</option><option>AUD</option><option>CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">客户信息</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">公司名称 *</label><input value={customerInfo.company_name} onChange={(e) => setCustomerInfo({...customerInfo, company_name: e.target.value})} placeholder="客户公司名" className={inputC} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">联系人</label><input value={customerInfo.contact_name} onChange={(e) => setCustomerInfo({...customerInfo, contact_name: e.target.value})} placeholder="联系人" className={inputC} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">邮箱</label><input type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} placeholder="email@company.com" className={inputC} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">电话（可选）</label><input value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} placeholder="+1-xxx-xxxx" className={inputC} /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">地址</label><input value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="客户公司地址" className={inputC} /></div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">产品清单</h3>
              <button onClick={() => setProducts([...products, { name: "", specs: "", customDesc: "", unitPrice: 0, quantity: 1, total: 0, unit: "pcs" }])} className="text-xs text-primary hover:underline">+ 添加</button>
            </div>
            {products.map((p, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 mb-2">
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <input value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} placeholder="品名" className={inputC + " col-span-2 text-xs"} />
                  <input value={p.specs} onChange={(e) => updateProduct(i, "specs", e.target.value)} placeholder="规格" className={inputC + " col-span-1 text-xs"} />
                  <select value={p.unit} onChange={(e) => updateProduct(i, "unit", e.target.value)} className={inputC + " col-span-1 text-xs"}><option>pcs</option><option>sets</option><option>kg</option><option>m</option><option>sqm</option></select>
                  <input type="number" value={p.unitPrice || ""} onChange={(e) => updateProduct(i, "unitPrice", parseFloat(e.target.value)||0)} placeholder="单价" className={inputC + " text-xs"} />
                  <input type="number" value={p.quantity || ""} onChange={(e) => updateProduct(i, "quantity", parseInt(e.target.value)||0)} placeholder="数量" className={inputC + " text-xs"} />
                </div>
                <div className="flex items-center gap-2">
                  <input value={p.customDesc} onChange={(e) => updateProduct(i, "customDesc", e.target.value)} placeholder="此产品的补充说明（可选）" className={inputC + " text-xs flex-1"} />
                  <span className="text-sm font-medium whitespace-nowrap">{options.currency} {p.total.toFixed(2)}</span>
                  {products.length > 1 && <button onClick={() => setProducts(products.filter((_, idx) => idx !== i))} className="text-red-400 text-xs">✕</button>}
                </div>
              </div>
            ))}
            <div className="text-right mt-3 font-semibold">总计：{options.currency} {grandTotal.toFixed(2)}</div>
          </div>

          {/* Advanced Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <details className="group">
              <summary className="text-sm font-semibold text-gray-700 cursor-pointer list-none flex items-center justify-between">
                高级选项 & 自定义条款
                <span className="text-xs text-gray-400 group-open:hidden">展开</span>
              </summary>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">启运港</label><input value={options.portOfLoading} onChange={(e) => setOptions({...options, portOfLoading: e.target.value})} placeholder="例：Shanghai" className={inputC} /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">目的港</label><input value={options.portOfDestination} onChange={(e) => setOptions({...options, portOfDestination: e.target.value})} placeholder="例：Los Angeles" className={inputC} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">付款方式</label><input value={options.paymentTerms} onChange={(e) => setOptions({...options, paymentTerms: e.target.value})} className={inputC} /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">交期</label><input value={options.deliveryTerms} onChange={(e) => setOptions({...options, deliveryTerms: e.target.value})} className={inputC} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">有效期</label><input value={options.validUntil} onChange={(e) => setOptions({...options, validUntil: e.target.value})} placeholder="例：2026-06-18" className={inputC} /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">质保条款</label><input value={options.warrantyTerms} onChange={(e) => setOptions({...options, warrantyTerms: e.target.value})} placeholder="例：2 years warranty" className={inputC} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-gray-500 mb-1 block">折扣条款</label><input value={options.discountTerms} onChange={(e) => setOptions({...options, discountTerms: e.target.value})} placeholder="例：100+ units: 5% off" className={inputC} /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">额外费用（运费/手续费等）</label><input value={options.additionalFees} onChange={(e) => setOptions({...options, additionalFees: e.target.value})} placeholder="例：Shipping: $500" className={inputC} /></div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={options.sampleIncluded} onChange={(e) => setOptions({...options, sampleIncluded: e.target.checked})} /> 包含样品</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={options.insuranceIncluded} onChange={(e) => setOptions({...options, insuranceIncluded: e.target.checked})} /> 包含保险</label>
                </div>
                <div><label className="text-xs text-gray-500 mb-1 block">自定义头部文字</label><input value={options.customHeader} onChange={(e) => setOptions({...options, customHeader: e.target.value})} placeholder="报价单顶部的自定义文字" className={inputC} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">自定义尾部文字</label><input value={options.customFooter} onChange={(e) => setOptions({...options, customFooter: e.target.value})} placeholder="报价单底部的自定义文字" className={inputC} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">其他备注</label><textarea value={options.notes} onChange={(e) => setOptions({...options, notes: e.target.value})} rows={3} placeholder="任何需要在报价单中体现的额外信息..." className={inputC + " resize-none"} /></div>
              </div>
            </details>
          </div>

          <button onClick={handleGenerate} disabled={loading || !customerInfo.company_name || !products.some(p => p.name.trim())}
            className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors">
            {loading ? "AI 生成中..." : "生成报价单"}
          </button>
        </div>

        {/* Preview */}
        <div>
          {result ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{result.quotationTitle}</h3>
                  {result.quotationNumber && <p className="text-xs text-gray-400">{result.quotationNumber}</p>}
                </div>
                <span className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">{options.incoterm} {options.currency}</span>
              </div>
              {result.companyIntro && <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">{result.companyIntro}</p>}
              <p className="text-sm text-gray-600 mb-4">{result.headerNote}</p>

              <table className="w-full text-sm mb-4">
                <thead><tr className="border-b-2 border-gray-200 text-left text-xs text-gray-500"><th className="py-2">#</th><th className="py-2">品名</th><th className="py-2">规格</th><th className="py-2 text-right">单价</th><th className="py-2 text-center">数量</th><th className="py-2 text-right">小计</th></tr></thead>
                <tbody>
                  {result.productTable?.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50"><td className="py-2 text-xs text-gray-400">{i+1}</td><td className="py-2 font-medium">{row.name}{row.description && <div className="text-xs text-gray-400">{row.description}</div>}</td><td className="py-2 text-xs text-gray-500">{row.specs}</td><td className="py-2 text-right">{options.currency} {row.unitPrice?.toFixed(2)}</td><td className="py-2 text-center">{row.quantity} {row.unit || "pcs"}</td><td className="py-2 text-right font-medium">{options.currency} {row.total?.toFixed(2)}</td></tr>
                  ))}
                  {result.discountInfo && <tr><td colSpan={5} className="py-2 text-right text-xs text-green-600">{result.discountInfo}</td><td className="py-2 text-right text-green-600 font-medium">-</td></tr>}
                  <tr className="font-bold text-base"><td colSpan={5} className="py-3 text-right">总计</td><td className="py-3 text-right">{options.currency} {result.totalAmount?.toFixed(2) || grandTotal.toFixed(2)}</td></tr>
                </tbody>
              </table>

              {result.termsSection && (
                <div className="bg-gray-50 rounded-lg p-4 mb-3 text-sm space-y-1">
                  {result.termsSection.payment && <div><span className="text-gray-500">付款方式：</span>{result.termsSection.payment}</div>}
                  {result.termsSection.delivery && <div><span className="text-gray-500">交期：</span>{result.termsSection.delivery}</div>}
                  {result.termsSection.incoterm && <div><span className="text-gray-500">贸易术语：</span>{result.termsSection.incoterm}</div>}
                  {result.termsSection.warranty && <div><span className="text-gray-500">质保：</span>{result.termsSection.warranty}</div>}
                  {result.termsSection.validity && <div><span className="text-gray-500">有效期：</span>{result.termsSection.validity}</div>}
                </div>
              )}

              <p className="text-sm text-gray-700 mb-2">{result.closingText}</p>
              <p className="text-xs text-gray-400">{result.footerNote}</p>

              <div className="mt-4 flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">打印 PDF</button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">复制 JSON</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
              <p className="text-lg">填写产品和报价参数</p>
              <p className="text-sm mt-1">AI 将使用产品知识库 + 你的自定义参数生成专业报价单</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
