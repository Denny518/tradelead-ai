"use client";

import { useState, useEffect } from "react";
import { getProductKnowledge, saveProductKnowledge, ProductKnowledge } from "@/lib/api";

const EMPTY_PRODUCT: ProductKnowledge = {
  productName: "", productCategory: "", brandName: "", companyYearFounded: "", companyLocation: "", companyScale: "", annualRevenue: "",
  productSummary: "", detailedDescription: "", uniqueSellingProposition: "",
  productImages: [], productVideos: [], catalogUrl: "", websiteUrl: "", linkedinUrl: "",
  basicInfo: { applicationScenarios: [""], targetCustomers: [""], competitors: [""] },
  sellingPoints: { priceAdvantage: "", qualityAdvantage: "", deliveryAdvantage: "", serviceAdvantage: "" },
  techSpecs: {}, certifications: [], patents: [],
  hsCode: "", moq: "", samplePolicy: "", packagingInfo: "", shippingMethods: [], leadTime: "", paymentTerms: [], acceptedCurrencies: [], incoterms: [],
  priceRange: "", bulkDiscountPolicy: "", oemOdmPolicy: "",
  qualityControlProcess: "", afterSalesService: "", warrantyPolicy: "", returnPolicy: "",
  caseStudies: [{ customer: "", industry: "", country: "", painPoint: "", solution: "", result: "", testimonial: "" }],
  totalCustomersServed: "", countriesExportedTo: [], annualExportVolume: "", keyClients: [], exhibitionHistory: [],
  faq: [{ question: "", answer: "" }],
  emailStyle: "professional", targetIndustries: [], competitorAdvantages: "",
  customSections: [],
};

const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
const sectionClass = "bg-white rounded-xl border border-gray-200 p-6 mb-4";

export default function ProductKnowledgeForm() {
  const [products, setProducts] = useState<ProductKnowledge[]>([{ ...EMPTY_PRODUCT }]);
  const [activeProduct, setActiveProduct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProductKnowledge().then((res) => {
      if (res.data) {
        // Support both single product (old format) and multi-product (new)
        if (Array.isArray(res.data)) {
          setProducts(res.data.length > 0 ? res.data : [{ ...EMPTY_PRODUCT }]);
        } else {
          setProducts([res.data]);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const form = products[activeProduct] || { ...EMPTY_PRODUCT };

  const update = (path: string, value: any) => {
    setProducts((prev) => {
      const next = [...prev];
      const keys = path.split(".");
      let obj = next[activeProduct] as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setSaved(false);
  };

  const addItem = (path: string, template: any) => {
    setProducts((prev) => {
      const next = [...prev];
      const keys = path.split(".");
      let obj = next[activeProduct] as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = [...(obj[keys[keys.length - 1]] || []), template];
      return next;
    });
  };

  const removeItem = (path: string, index: number) => {
    setProducts((prev) => {
      const next = [...prev];
      const keys = path.split(".");
      let obj = next[activeProduct] as any;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = obj[keys[keys.length - 1]].filter((_: any, i: number) => i !== index);
      return next;
    });
  };

  const addProduct = () => { setProducts([...products, { ...EMPTY_PRODUCT }]); setActiveProduct(products.length); };
  const removeProduct = (idx: number) => {
    if (products.length <= 1) return;
    setProducts(products.filter((_, i) => i !== idx));
    if (activeProduct >= idx) setActiveProduct(Math.max(0, activeProduct - 1));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as multi-product array
      // Store uses single record, we'll store the whole array
      for (const p of products) {
        await saveProductKnowledge(p);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error("Save failed:", err); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>;
  }

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
    </div>
  );

  const TagInput = ({ path, label, placeholder }: { path: string; label: string; placeholder: string }) => {
    const arr: string[] = (() => { const keys = path.split("."); let o: any = form; for (const k of keys) o = o?.[k]; return Array.isArray(o) ? o : []; })();
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <div className="space-y-1.5">
          {arr.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input value={s} onChange={(e) => update(`${path}.${i}`, e.target.value)} placeholder={placeholder} className={inputClass} />
              <button type="button" onClick={() => removeItem(path, i)} className="text-red-400 hover:text-red-600 text-xs w-6">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addItem(path, "")} className="text-xs text-primary hover:underline mt-1">+ 添加</button>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">产品知识库</h2>
          <p className="text-sm text-gray-500">信息越详细，AI 生成的邮件和报价越专业精准</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={addProduct} className="px-3 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-blue-50">+ 添加产品</button>
          <button onClick={handleSave} disabled={saving} className={`px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-all ${saved ? "bg-green-500" : "bg-primary hover:bg-primary-dark"}`}>
            {saved ? "已保存" : saving ? "保存中..." : "保存知识库"}
          </button>
        </div>
      </div>

      {/* Product tabs */}
      {products.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {products.map((p, i) => (
            <button key={i} onClick={() => setActiveProduct(i)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${activeProduct === i ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {p.productName || `产品 ${i + 1}`} {products.length > 1 && <span onClick={(e) => { e.stopPropagation(); removeProduct(i); }} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</span>}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">

        {/* 1. Company & Product Identity */}
        <div className={sectionClass}>
          <SectionTitle title="公司 & 产品身份" desc="基础信息，邮件中会自动引用" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className={labelClass}>产品名称 *</label><input value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="例：LED 显示屏" className={inputClass} /></div>
            <div><label className={labelClass}>产品类别</label><input value={form.productCategory || ""} onChange={(e) => update("productCategory", e.target.value)} placeholder="例：电子显示屏" className={inputClass} /></div>
            <div><label className={labelClass}>品牌名</label><input value={form.brandName || ""} onChange={(e) => update("brandName", e.target.value)} placeholder="公司品牌" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className={labelClass}>成立年份</label><input value={form.companyYearFounded || ""} onChange={(e) => update("companyYearFounded", e.target.value)} placeholder="例：2010" className={inputClass} /></div>
            <div><label className={labelClass}>所在地</label><input value={form.companyLocation || ""} onChange={(e) => update("companyLocation", e.target.value)} placeholder="例：深圳，中国" className={inputClass} /></div>
            <div><label className={labelClass}>公司规模</label><input value={form.companyScale || ""} onChange={(e) => update("companyScale", e.target.value)} placeholder="例：50-100人" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>年营业额</label><input value={form.annualRevenue || ""} onChange={(e) => update("annualRevenue", e.target.value)} placeholder="例：$5M-10M" className={inputClass} /></div>
            <div><label className={labelClass}>核心差异点 (USP)</label><input value={form.uniqueSellingProposition || ""} onChange={(e) => update("uniqueSellingProposition", e.target.value)} placeholder="和竞争对手最大的不同是什么？" className={inputClass} /></div>
          </div>
        </div>

        {/* 2. Product Descriptions */}
        <div className={sectionClass}>
          <SectionTitle title="产品描述" desc="AI 写邮件和报价单的核心素材" />
          <div className="space-y-4">
            <div><label className={labelClass}>一句话概述</label><input value={form.productSummary || ""} onChange={(e) => update("productSummary", e.target.value)} placeholder="一句话说清楚你的产品是什么" className={inputClass} /></div>
            <div><label className={labelClass}>详细描述（越详细，AI 写得越好）</label>
              <textarea value={form.detailedDescription || ""} onChange={(e) => update("detailedDescription", e.target.value)} rows={4} placeholder={"描述你的产品：\n- 用什么材料做的？\n- 怎么生产出来的？\n- 解决了客户什么痛点？\n- 和市场上其他产品有什么不同？\n- 客户为什么选择你？"} className={inputClass + " resize-none"} />
            </div>
          </div>
        </div>

        {/* 3. Media */}
        <div className={sectionClass}>
          <SectionTitle title="图片 & 视频 & 链接" desc="产品图片 URL、视频链接、目录等" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>产品图片 URL（一张一行）</label>
              <TagInput path="productImages" label="" placeholder="https://example.com/image.jpg" />
              <p className="text-xs text-gray-400 mt-1">AI 会在邮件中描述你的产品外观</p>
            </div>
            <div>
              <label className={labelClass}>产品视频 URL（一行一个）</label>
              <TagInput path="productVideos" label="" placeholder="https://youtube.com/watch?v=xxx" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div><label className={labelClass}>产品目录 URL</label><input value={form.catalogUrl || ""} onChange={(e) => update("catalogUrl", e.target.value)} placeholder="https://..." className={inputClass} /></div>
            <div><label className={labelClass}>公司官网</label><input value={form.websiteUrl || ""} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://..." className={inputClass} /></div>
            <div><label className={labelClass}>LinkedIn</label><input value={form.linkedinUrl || ""} onChange={(e) => update("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/company/..." className={inputClass} /></div>
          </div>
        </div>

        {/* 4. Selling Points + Tech Specs */}
        <div className={sectionClass}>
          <SectionTitle title="核心卖点 & 技术参数" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className={labelClass}>价格优势</label><input value={form.sellingPoints?.priceAdvantage || ""} onChange={(e) => update("sellingPoints.priceAdvantage", e.target.value)} placeholder="例：比同行便宜15%" className={inputClass} /></div>
            <div><label className={labelClass}>质量优势</label><input value={form.sellingPoints?.qualityAdvantage || ""} onChange={(e) => update("sellingPoints.qualityAdvantage", e.target.value)} placeholder="例：故障率 <1%" className={inputClass} /></div>
            <div><label className={labelClass}>交期优势</label><input value={form.sellingPoints?.deliveryAdvantage || ""} onChange={(e) => update("sellingPoints.deliveryAdvantage", e.target.value)} placeholder="例：现货48小时发" className={inputClass} /></div>
            <div><label className={labelClass}>服务优势</label><input value={form.sellingPoints?.serviceAdvantage || ""} onChange={(e) => update("sellingPoints.serviceAdvantage", e.target.value)} placeholder="例：24小时技术支持" className={inputClass} /></div>
          </div>
          <div className="border-t pt-4">
            <label className={labelClass}>技术参数（键值对）</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {["material", "size", "weight", "color", "capacity", "power", "voltage", "certification", "warranty", "lifespan", "waterproof", "custom1", "custom2", "custom3"].map((k) => (
                <div key={k}><label className="text-xs text-gray-500 mb-0.5 block">{k}</label>
                  <input value={(form.techSpecs || {})[k] || ""} onChange={(e) => update(`techSpecs.${k}`, e.target.value)} className={inputClass + " text-xs"} placeholder={k === "material" ? "铝+PC" : ""} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Trade & Logistics */}
        <div className={sectionClass}>
          <SectionTitle title="贸易 & 物流信息" desc="报价和客户沟通时会用到" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className={labelClass}>HS 编码</label><input value={form.hsCode || ""} onChange={(e) => update("hsCode", e.target.value)} placeholder="例：8528.59" className={inputClass} /></div>
            <div><label className={labelClass}>MOQ</label><input value={form.moq || ""} onChange={(e) => update("moq", e.target.value)} placeholder="例：10件" className={inputClass} /></div>
            <div><label className={labelClass}>样品政策</label><input value={form.samplePolicy || ""} onChange={(e) => update("samplePolicy", e.target.value)} placeholder="例：免费样品，运费到付" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className={labelClass}>交期 (Lead Time)</label><input value={form.leadTime || ""} onChange={(e) => update("leadTime", e.target.value)} placeholder="例：15-20天" className={inputClass} /></div>
            <div><label className={labelClass}>包装信息</label><input value={form.packagingInfo || ""} onChange={(e) => update("packagingInfo", e.target.value)} placeholder="例：纸箱+木箱" className={inputClass} /></div>
            <div><label className={labelClass}>价格范围</label><input value={form.priceRange || ""} onChange={(e) => update("priceRange", e.target.value)} placeholder="例：$25-200/件" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TagInput path="paymentTerms" label="付款方式" placeholder="例：T/T, L/C, PayPal" />
            <TagInput path="shippingMethods" label="运输方式" placeholder="例：海运, 空运, DHL" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <TagInput path="acceptedCurrencies" label="接受币种" placeholder="USD, EUR" />
            <TagInput path="incoterms" label="贸易术语" placeholder="FOB, CIF, EXW" />
            <TagInput path="certifications" label="认证" placeholder="CE, FCC, RoHS" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div><label className={labelClass}>批量折扣政策</label><textarea value={form.bulkDiscountPolicy || ""} onChange={(e) => update("bulkDiscountPolicy", e.target.value)} rows={2} placeholder="例：100件以上 5% 折扣" className={inputClass + " resize-none"} /></div>
            <div><label className={labelClass}>OEM/ODM 政策</label><textarea value={form.oemOdmPolicy || ""} onChange={(e) => update("oemOdmPolicy", e.target.value)} rows={2} placeholder="例：支持 OEM，MOQ 500件起" className={inputClass + " resize-none"} /></div>
          </div>
        </div>

        {/* 6. Quality & After-Sales */}
        <div className={sectionClass}>
          <SectionTitle title="质量 & 售后" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>质量控制流程</label><textarea value={form.qualityControlProcess || ""} onChange={(e) => update("qualityControlProcess", e.target.value)} rows={2} placeholder="例：来料检验→生产巡检→成品全检→出货抽检" className={inputClass + " resize-none"} /></div>
            <div><label className={labelClass}>售后服务</label><textarea value={form.afterSalesService || ""} onChange={(e) => update("afterSalesService", e.target.value)} rows={2} placeholder="例：24小时响应，远程诊断，免费配件" className={inputClass + " resize-none"} /></div>
            <div><label className={labelClass}>质保政策</label><textarea value={form.warrantyPolicy || ""} onChange={(e) => update("warrantyPolicy", e.target.value)} rows={2} placeholder="例：2年质保，终身维护" className={inputClass + " resize-none"} /></div>
            <div><label className={labelClass}>退货政策</label><textarea value={form.returnPolicy || ""} onChange={(e) => update("returnPolicy", e.target.value)} rows={2} placeholder="例：到货7天内质量问题免费退换" className={inputClass + " resize-none"} /></div>
          </div>
        </div>

        {/* 7. Case Studies */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="成功案例" desc="案例越具体，AI 写的故事越有说服力" />
            <button onClick={() => addItem("caseStudies", { customer: "", industry: "", country: "", painPoint: "", solution: "", result: "", testimonial: "" })} className="text-sm text-primary hover:underline">+ 添加案例</button>
          </div>
          {(form.caseStudies || []).map((cs, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">案例 {i + 1}</span>
                <button onClick={() => removeItem("caseStudies", i)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="text-xs text-gray-500 mb-1 block">客户名</label><input value={cs.customer} onChange={(e) => update(`caseStudies.${i}.customer`, e.target.value)} placeholder="例：ABC Corp" className={inputClass} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">行业</label><input value={cs.industry} onChange={(e) => update(`caseStudies.${i}.industry`, e.target.value)} placeholder="例：广告业" className={inputClass} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">国家</label><input value={cs.country || ""} onChange={(e) => update(`caseStudies.${i}.country`, e.target.value)} placeholder="例：美国" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div><label className="text-xs text-gray-500 mb-1 block">客户痛点</label><input value={cs.painPoint} onChange={(e) => update(`caseStudies.${i}.painPoint`, e.target.value)} placeholder="他们遇到了什么问题？" className={inputClass} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">你的方案</label><input value={cs.solution} onChange={(e) => update(`caseStudies.${i}.solution`, e.target.value)} placeholder="你怎么解决的？" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <div><label className="text-xs text-gray-500 mb-1 block">结果（用数据）</label><input value={cs.result} onChange={(e) => update(`caseStudies.${i}.result`, e.target.value)} placeholder="例：客户满意度+40%，续约3年" className={inputClass} /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">客户评价（可选）</label><input value={cs.testimonial || ""} onChange={(e) => update(`caseStudies.${i}.testimonial`, e.target.value)} placeholder="客户原话或转述" className={inputClass} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* 8. Market & Competition */}
        <div className={sectionClass}>
          <SectionTitle title="市场 & 竞争" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <TagInput path="basicInfo.applicationScenarios" label="应用场景" placeholder="例：户外广告" />
            <TagInput path="basicInfo.targetCustomers" label="目标客户" placeholder="例：广告代理商" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <TagInput path="basicInfo.competitors" label="竞争对手" placeholder="例：Samsung LED" />
            <TagInput path="targetIndustries" label="目标行业" placeholder="例：广告, 零售" />
            <TagInput path="countriesExportedTo" label="已出口国家" placeholder="例：美国, 德国" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>相比竞品的优势</label><textarea value={form.competitorAdvantages || ""} onChange={(e) => update("competitorAdvantages", e.target.value)} rows={2} placeholder="为什么客户选你而不是竞争对手？" className={inputClass + " resize-none"} /></div>
            <div>
              <TagInput path="keyClients" label="重要客户" placeholder="例：Walmart (通过中间商)" />
              <TagInput path="exhibitionHistory" label="参展历史" placeholder="例：CES 2024" />
            </div>
          </div>
        </div>

        {/* 9. FAQ */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="常见客户问题" desc="给 AI 提供标准答案参考" />
            <button onClick={() => addItem("faq", { question: "", answer: "" })} className="text-sm text-primary hover:underline">+ 添加 FAQ</button>
          </div>
          {(form.faq || []).map((f, i) => (
            <div key={i} className="flex gap-3 mb-3 items-start">
              <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">问题</label><input value={f.question} onChange={(e) => update(`faq.${i}.question`, e.target.value)} placeholder="客户常问什么？" className={inputClass} /></div>
              <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">回答</label><input value={f.answer} onChange={(e) => update(`faq.${i}.answer`, e.target.value)} placeholder="你怎么回答？" className={inputClass} /></div>
              <button onClick={() => removeItem("faq", i)} className="text-red-400 hover:text-red-600 text-xs mt-5 w-6">✕</button>
            </div>
          ))}
        </div>

        {/* 10. Custom Sections */}
        <div className={sectionClass}>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="自定义补充内容" desc="任何 AI 应该知道但没有对应字段的信息" />
            <button onClick={() => addItem("customSections", { title: "", content: "" })} className="text-sm text-primary hover:underline">+ 添加</button>
          </div>
          {(form.customSections || []).map((s, i) => (
            <div key={i} className="mb-3 border border-gray-100 rounded-lg p-3">
              <div className="flex justify-between mb-2"><span className="text-xs text-gray-400">自定义 {i + 1}</span><button onClick={() => removeItem("customSections", i)} className="text-red-400 hover:text-red-600 text-xs">✕</button></div>
              <input value={s.title} onChange={(e) => update(`customSections.${i}.title`, e.target.value)} placeholder="标题" className={inputClass + " mb-2"} />
              <textarea value={s.content} onChange={(e) => update(`customSections.${i}.content`, e.target.value)} rows={3} placeholder="自由输入任何补充信息..." className={inputClass + " resize-none"} />
            </div>
          ))}
        </div>

        {/* 11. Preferences */}
        <div className={sectionClass}>
          <SectionTitle title="偏好设置" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>邮件风格</label>
              <select value={form.emailStyle || "professional"} onChange={(e) => update("emailStyle", e.target.value)} className={inputClass}>
                <option value="professional">正式专业</option><option value="casual">简洁直接</option><option value="story">故事型</option>
              </select>
            </div>
            <div><label className={labelClass}>服务客户总数</label><input value={form.totalCustomersServed || ""} onChange={(e) => update("totalCustomersServed", e.target.value)} placeholder="例：500+" className={inputClass} /></div>
            <div><label className={labelClass}>年出口量</label><input value={form.annualExportVolume || ""} onChange={(e) => update("annualExportVolume", e.target.value)} placeholder="例：100个集装箱/年" className={inputClass} /></div>
          </div>
        </div>

      </div>

      {/* Bottom save */}
      <div className="flex justify-end mt-6">
        <button onClick={handleSave} disabled={saving} className={`px-6 py-3 text-sm font-medium rounded-lg text-white ${saved ? "bg-green-500" : "bg-primary hover:bg-primary-dark"}`}>
          {saved ? "已保存" : saving ? "保存中..." : "保存产品知识库"}
        </button>
      </div>
    </div>
  );
}
