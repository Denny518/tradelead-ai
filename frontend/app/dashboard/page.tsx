"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import EmailModal from "@/components/EmailModal";
import CRMPage from "@/components/CRMPage";
import ProductKnowledgeForm from "@/components/ProductKnowledgeForm";
import QuotationPage from "@/components/QuotationPage";
import RepliesPage from "@/components/RepliesPage";
import FollowupsPage from "@/components/FollowupsPage";
import DealScorePage from "@/components/DealScorePage";
import MarketIntelPage from "@/components/MarketIntelPage";
import TeamPage from "@/components/TeamPage";
import PipelinePage from "@/components/PipelinePage";
import {
  searchCustomers,
  findEmail,
  generateEmail,
  createCustomer,
  saveEmailToCustomer,
  getProductKnowledge,
  getDashboardStats,
  SearchResultItem,
  EmailVersion,
  ProductKnowledge,
} from "@/lib/api";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Product knowledge
  const [productKnowledge, setProductKnowledge] = useState<ProductKnowledge | null>(null);

  useEffect(() => {
    getProductKnowledge().then((res) => {
      if (res.data) setProductKnowledge(res.data);
    });
  }, [activeTab]); // Refresh when switching tabs

  // Search state
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  // Email lookup state
  const [findingEmail, setFindingEmail] = useState<string | null>(null);
  const [emailResults, setEmailResults] = useState<Record<string, { name: string; email: string; position: string }[]>>({});

  // Email generation state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmails, setGeneratedEmails] = useState<Record<string, EmailVersion> | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<SearchResultItem | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [emailsGenerated, setEmailsGenerated] = useState<Set<number>>(new Set());

  // ── Handlers ────────────────────────────────────────────────

  const handleSearch = useCallback(
    async (params: { product: string; market: string; industry: string; limit: number; role: string; companyType: string; customQuery: string; excludeKeywords: string }) => {
      setSearchLoading(true);
      setSearchResults([]);
      setEmailResults({});
      setSavedIds(new Set());
      setEmailsGenerated(new Set());
      try {
        const res = await searchCustomers(params);
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Search failed:", err);
        alert("搜索失败，请确认后端服务已启动");
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  const handleFindEmail = useCallback(
    async (domain: string) => {
      if (emailResults[domain]) return;
      setFindingEmail(domain);
      try {
        const res = await findEmail(domain);
        setEmailResults((prev) => ({ ...prev, [domain]: res.data || [] }));
      } catch (err) {
        console.error("Find email failed:", err);
      } finally {
        setFindingEmail(null);
      }
    },
    [emailResults]
  );

  const handleGenerateEmail = useCallback(
    async (item: SearchResultItem) => {
      const idx = searchResults.indexOf(item);
      setEmailsGenerated((prev) => new Set(prev).add(idx));
      setSelectedCustomer(item);
      setEmailModalOpen(true);
      setGeneratingEmail(true);
      setGeneratedEmails(null);
      try {
        const res = await generateEmail({
          product_info: {
            name: productKnowledge?.productName || "our product",
            description: productKnowledge?.basicInfo?.applicationScenarios?.[0] || "",
            advantages: [
              productKnowledge?.sellingPoints?.priceAdvantage || "",
              productKnowledge?.sellingPoints?.qualityAdvantage || "",
              productKnowledge?.sellingPoints?.deliveryAdvantage || "",
            ].filter(Boolean),
          },
          customer_info: {
            company_name: item.company_name,
            website: item.website,
            description: item.description,
            contact_name: "",
          },
          email_type: "initial",
          language: "en",
        });
        setGeneratedEmails(res.data || {});
      } catch (err) {
        console.error("Generate email failed:", err);
        alert("邮件生成失败");
      } finally {
        setGeneratingEmail(false);
      }
    },
    [productKnowledge]
  );

  const handleRegenerate = useCallback(
    async (emailType: string, language: string) => {
      if (!selectedCustomer) return;
      setGeneratingEmail(true);
      setGeneratedEmails(null);
      try {
        const res = await generateEmail({
          product_info: {
            name: productKnowledge?.productName || "our product",
            description: productKnowledge?.basicInfo?.applicationScenarios?.[0] || "",
            advantages: [
              productKnowledge?.sellingPoints?.priceAdvantage || "",
              productKnowledge?.sellingPoints?.qualityAdvantage || "",
              productKnowledge?.sellingPoints?.deliveryAdvantage || "",
            ].filter(Boolean),
          },
          customer_info: {
            company_name: selectedCustomer.company_name,
            website: selectedCustomer.website,
            description: selectedCustomer.description,
            contact_name: "",
          },
          email_type: emailType,
          language,
        });
        setGeneratedEmails(res.data || {});
      } catch (err) {
        console.error("Regenerate failed:", err);
      } finally {
        setGeneratingEmail(false);
      }
    },
    [selectedCustomer, productKnowledge]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => alert("已复制到剪贴板"));
  }, []);

  const handleSaveEmail = useCallback(
    async (version: number, subject: string, content: string) => {
      if (!selectedCustomer) return;
      try {
        const cust = await createCustomer({
          company_name: selectedCustomer.company_name,
          website: selectedCustomer.website,
          description: selectedCustomer.description,
          match_score: selectedCustomer.match_score,
          status: "sent",
        });
        await saveEmailToCustomer(cust.id, { subject, content, version, email_type: "initial" });
        const idx = searchResults.indexOf(selectedCustomer);
        setSavedIds((prev) => new Set(prev).add(idx));
        setEmailModalOpen(false);
        alert(`已保存客户"${selectedCustomer.company_name}"到CRM`);
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
    [selectedCustomer, searchResults]
  );

  const handleSaveToCRM = useCallback(
    async (item: SearchResultItem) => {
      try {
        await createCustomer({
          company_name: item.company_name,
          website: item.website,
          description: item.description,
          match_score: item.match_score,
          status: "new",
        });
        const idx = searchResults.indexOf(item);
        setSavedIds((prev) => new Set(prev).add(idx));
        alert(`已保存"${item.company_name}"到CRM`);
      } catch (err) {
        console.error("Save to CRM failed:", err);
      }
    },
    [searchResults]
  );

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">概览</h2>
              <p className="text-gray-500 mb-8">欢迎使用 TradeLead AI，AI 成交辅助系统</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "已存客户", value: "-", color: "text-blue-600" },
                  { label: "AI 邮件生成", value: "-", color: "text-green-600" },
                  { label: "产品知识库", value: productKnowledge ? "已配置" : "未配置", color: productKnowledge ? "text-green-600" : "text-orange-500" },
                  { label: "今日额度", value: "250次搜索", color: "text-purple-600" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              {/* Quick start */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">快速开始</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-800 mb-2">基础流程</p>
                    <ol className="space-y-1.5">
                      <li>1. 配置"产品知识库"（AI 写邮件的质量基础）</li>
                      <li>2. "客户搜索"找潜在客户</li>
                      <li>3. "找邮箱"获取联系方式</li>
                      <li>4. AI 生成 3 版个性化开发信</li>
                      <li>5. 人工审核后发送</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 mb-2">成交辅助（核心差异）</p>
                    <ol className="space-y-1.5">
                      <li>⭐ "报价单生成" - AI 生成专业报价</li>
                      <li>⭐ "询盘回复" - 粘贴客户邮件，AI 帮你回</li>
                      <li>⭐ "我的客户" - 管理跟进状态</li>
                      <li>多语言支持 - 15 种语言覆盖全球市场</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          {activeTab === "search" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">客户搜索</h2>
              <SearchForm onSearch={handleSearch} loading={searchLoading} />
              {searchLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <svg className="animate-spin w-10 h-10 mx-auto mb-4 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-gray-500">正在搜索潜在客户...</p>
                  </div>
                </div>
              )}
              <SearchResults
                results={searchResults}
                onFindEmail={handleFindEmail}
                onGenerateEmail={handleGenerateEmail}
                onSaveToCRM={handleSaveToCRM}
                findingEmail={findingEmail}
                emailResults={emailResults}
                savedIds={savedIds}
                emailsGenerated={emailsGenerated}
              />
            </div>
          )}

          {/* CRM */}
          {activeTab === "crm" && <CRMPage />}

          {/* Product Knowledge */}
          {activeTab === "knowledge" && <ProductKnowledgeForm />}

          {/* Quotations */}
          {activeTab === "quotations" && <QuotationPage />}

          {/* Replies */}
          {activeTab === "replies" && <RepliesPage />}

          {/* P2 Features */}
          {activeTab === "followups" && <FollowupsPage />}
          {activeTab === "dealscore" && <DealScorePage />}
          {activeTab === "marketintel" && <MarketIntelPage />}
          {activeTab === "pipeline" && <PipelinePage />}
          {activeTab === "team" && <TeamPage />}
        </div>
      </main>

      {/* Email Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        customerName={selectedCustomer?.company_name || ""}
        contactName=""
        emails={generatedEmails}
        generating={generatingEmail}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onSaveEmail={handleSaveEmail}
        productKnowledge={productKnowledge}
      />
    </div>
  );
}
