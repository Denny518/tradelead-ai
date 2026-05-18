"use client";

import { useState, useEffect } from "react";
import { ProductKnowledge, getProductKnowledge, saveProductKnowledge } from "@/lib/api";

const EMPTY_FORM: ProductKnowledge = {
  productName: "",
  basicInfo: { applicationScenarios: [""], targetCustomers: [""], competitors: [""] },
  sellingPoints: { priceAdvantage: "", qualityAdvantage: "", deliveryAdvantage: "", serviceAdvantage: "" },
  techSpecs: {},
  caseStudies: [{ customer: "", industry: "", painPoint: "", solution: "", result: "" }],
  faq: [{ question: "", answer: "" }],
  emailStyle: "professional",
};

export default function ProductKnowledgeForm() {
  const [form, setForm] = useState<ProductKnowledge>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProductKnowledge().then((res) => {
      if (res.data) setForm(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const update = (path: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProductKnowledge(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (path: string, template: any) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = [...(obj[keys[keys.length - 1]] || []), template];
      return next;
    });
  };

  const removeItem = (path: string, index: number) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = obj[keys[keys.length - 1]].filter((_: any, i: number) => i !== index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionClass = "bg-white rounded-xl border border-gray-200 p-6 mb-6";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">产品知识库</h2>
          <p className="text-sm text-gray-500">填写越详细，AI 生成的邮件和报价单越专业</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-primary text-white hover:bg-primary-dark"
          }`}
        >
          {saved ? "已保存" : saving ? "保存中..." : "保存知识库"}
        </button>
      </div>

      {/* 基本信息 */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>产品名称 *</label>
            <input type="text" value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="例如：LED 显示屏" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>邮件风格</label>
            <select value={form.emailStyle || "professional"} onChange={(e) => update("emailStyle", e.target.value)} className={inputClass}>
              <option value="professional">正式专业</option>
              <option value="casual">简洁直接</option>
              <option value="story">故事型</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className={labelClass}>应用场景（一行一个）</label>
            {(form.basicInfo?.applicationScenarios || [""]).map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={s} onChange={(e) => update(`basicInfo.applicationScenarios.${i}`, e.target.value)} placeholder="例：户外广告" className={inputClass} />
                <button onClick={() => removeItem("basicInfo.applicationScenarios", i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => addItem("basicInfo.applicationScenarios", "")} className="text-xs text-primary hover:underline mt-1">+ 添加场景</button>
          </div>
          <div>
            <label className={labelClass}>目标客户类型</label>
            {(form.basicInfo?.targetCustomers || [""]).map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={s} onChange={(e) => update(`basicInfo.targetCustomers.${i}`, e.target.value)} placeholder="例：广告代理商" className={inputClass} />
                <button onClick={() => removeItem("basicInfo.targetCustomers", i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => addItem("basicInfo.targetCustomers", "")} className="text-xs text-primary hover:underline mt-1">+ 添加类型</button>
          </div>
          <div>
            <label className={labelClass}>主要竞争对手</label>
            {(form.basicInfo?.competitors || [""]).map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={s} onChange={(e) => update(`basicInfo.competitors.${i}`, e.target.value)} placeholder="例：Samsung LED" className={inputClass} />
                <button onClick={() => removeItem("basicInfo.competitors", i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
              </div>
            ))}
            <button onClick={() => addItem("basicInfo.competitors", "")} className="text-xs text-primary hover:underline mt-1">+ 添加竞品</button>
          </div>
        </div>
      </div>

      {/* 核心卖点 */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900 mb-4">核心卖点（请用一句话描述）</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>价格优势</label>
            <input type="text" value={form.sellingPoints?.priceAdvantage || ""} onChange={(e) => update("sellingPoints.priceAdvantage", e.target.value)} placeholder="例：比同行便宜15%，同等质量" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>质量优势</label>
            <input type="text" value={form.sellingPoints?.qualityAdvantage || ""} onChange={(e) => update("sellingPoints.qualityAdvantage", e.target.value)} placeholder="例：2年质保，故障率<1%" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>交期优势</label>
            <input type="text" value={form.sellingPoints?.deliveryAdvantage || ""} onChange={(e) => update("sellingPoints.deliveryAdvantage", e.target.value)} placeholder="例：现货48小时内发货" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>服务优势</label>
            <input type="text" value={form.sellingPoints?.serviceAdvantage || ""} onChange={(e) => update("sellingPoints.serviceAdvantage", e.target.value)} placeholder="例：24小时技术支持" className={inputClass} />
          </div>
        </div>
      </div>

      {/* 技术参数 */}
      <div className={sectionClass}>
        <h3 className="text-base font-semibold text-gray-900 mb-4">技术参数</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["material", "size", "capacity", "certification", "warranty", "moq", "other"].map((key) => (
            <div key={key}>
              <label className={labelClass}>{key === "material" ? "材质" : key === "size" ? "尺寸" : key === "capacity" ? "产能" : key === "certification" ? "认证" : key === "warranty" ? "质保" : key === "moq" ? "MOQ" : "其他"}</label>
              <input
                type="text"
                value={(form.techSpecs || {})[key] || ""}
                onChange={(e) => update(`techSpecs.${key}`, e.target.value)}
                placeholder={key === "certification" ? "例：CE, FCC, RoHS" : ""}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 成功案例 */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">成功案例</h3>
          <button onClick={() => addItem("caseStudies", { customer: "", industry: "", painPoint: "", solution: "", result: "" })} className="text-sm text-primary hover:underline">+ 添加案例</button>
        </div>
        {(form.caseStudies || []).map((cs, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">案例 {i + 1}</span>
              <button onClick={() => removeItem("caseStudies", i)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">客户名称（可匿名）</label>
                <input type="text" value={cs.customer} onChange={(e) => update(`caseStudies.${i}.customer`, e.target.value)} placeholder="例：ABC Advertising" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">行业</label>
                <input type="text" value={cs.industry} onChange={(e) => update(`caseStudies.${i}.industry`, e.target.value)} placeholder="例：广告业" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">客户痛点</label>
                <input type="text" value={cs.painPoint} onChange={(e) => update(`caseStudies.${i}.painPoint`, e.target.value)} placeholder="例：之前的屏白天不够亮" className={inputClass} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">你的方案</label>
                <input type="text" value={cs.solution} onChange={(e) => update(`caseStudies.${i}.solution`, e.target.value)} placeholder="例：推荐8000nits高亮屏" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">客户结果（用数据）</label>
                <input type="text" value={cs.result} onChange={(e) => update(`caseStudies.${i}.result`, e.target.value)} placeholder="例：客户满意度提升40%，续约3年" className={inputClass} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">常见客户问题 (FAQ)</h3>
          <button onClick={() => addItem("faq", { question: "", answer: "" })} className="text-sm text-primary hover:underline">+ 添加 FAQ</button>
        </div>
        {(form.faq || []).map((f, i) => (
          <div key={i} className="flex gap-3 mb-3 items-start">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">客户问</label>
              <input type="text" value={f.question} onChange={(e) => update(`faq.${i}.question`, e.target.value)} placeholder="例：最低起订量是多少？" className={inputClass} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">你回答</label>
              <input type="text" value={f.answer} onChange={(e) => update(`faq.${i}.answer`, e.target.value)} placeholder="例：标准品MOQ 10件，定制50件" className={inputClass} />
            </div>
            <button onClick={() => removeItem("faq", i)} className="text-red-400 hover:text-red-600 text-xs mt-5">✕</button>
          </div>
        ))}
      </div>

      {/* Bottom save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
          saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"
        }`}>
          {saved ? "已保存" : saving ? "保存中..." : "保存产品知识库"}
        </button>
      </div>
    </div>
  );
}
