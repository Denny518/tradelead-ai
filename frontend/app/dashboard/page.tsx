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
import OverviewPage from "@/components/OverviewPage";
import {
  searchCustomers, findEmail, generateEmail, createCustomer,
  saveEmailToCustomer, getProductKnowledge, getDashboardStats,
  SearchResultItem, EmailVersion, ProductKnowledge,
  getGmailStatus, getGmailAuthUrl, sendGmailEmail,
} from "@/lib/api";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Product knowledge
  const [productKnowledge, setProductKnowledge] = useState<ProductKnowledge | null>(null);
  const [pkChecked, setPkChecked] = useState(false);

  useEffect(() => {
    getProductKnowledge().then((res) => {
      if (res.data) {
        setProductKnowledge(res.data);
        if (!pkChecked) setPkChecked(true);
      } else {
        setProductKnowledge(null);
        if (!pkChecked) {
          // First visit — redirect to knowledge page
          setActiveTab("knowledge");
          setPkChecked(true);
        }
      }
    });
  }, [activeTab]); // Refresh when switching tabs

  const hasKnowledge = !!(productKnowledge && productKnowledge.productName);

  // Listen for changeTab events from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("changeTab", handler);
    return () => window.removeEventListener("changeTab", handler);
  }, []);

  // Gmail state
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [sendingGmail, setSendingGmail] = useState(false);

  useEffect(() => {
    getGmailStatus().then((res) => {
      if (res.success) {
        setGmailConnected(res.data.connected);
        setGmailEmail(res.data.email);
      }
    });
  }, []);

  const handleConnectGmail = async () => {
    try {
      const res = await getGmailAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        alert(res.message || "Gmail API 未配置。请在 Google Cloud Console 创建 OAuth 2.0 客户端 ID。");
      }
    } catch (err) {
      alert("获取 Gmail 授权链接失败");
    }
  };

  const handleSendGmail = async (to: string, subject: string, content: string) => {
    if (!to) {
      alert("请先查找客户邮箱");
      return;
    }
    setSendingGmail(true);
    try {
      const res = await sendGmailEmail({ to, subject, content });
      if (res.success) {
        alert(`邮件已通过 Gmail 发送！`);
      } else {
        alert(`发送失败: ${res.message}`);
      }
    } catch (err) {
      alert("发送失败，请重试");
    } finally {
      setSendingGmail(false);
    }
  };

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
    async (params: { product: string; market: string; industry: string; limit: number; role: string; companyType: string; customQuery: string; excludeKeywords: string; engine: string; mapsLocation: string; mapsRadius: string; shoppingPriceRange: string; newsTimeframe: string; bingMarket: string }) => {
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
    async (domain: string, companyName?: string, address?: string) => {
      const key = domain || companyName || "";
      if (!key || emailResults[key]) return;
      setFindingEmail(key);
      try {
        const res = await findEmail(domain, companyName, address);
        if (res.success) {
          setEmailResults((prev) => ({ ...prev, [key]: res.data || [] }));
        } else if (res.needsManualDomain) {
          alert(res.message || "未找到公司域名");
        }
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        {/* Mobile header with hamburger + quota */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-600 hover:text-gray-900">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center"><span className="text-white font-bold text-[10px]">TL</span></div>
            <span className="font-semibold text-sm">TradeLead AI</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            <span>配额</span>
            <span className="font-semibold text-gray-600">200<span className="text-gray-400">封/月</span></span>
          </div>
        </div>

        {/* Desktop quota bar */}
        <div className="hidden lg:flex sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-2 items-center justify-end gap-4">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
              月度邮件配额：<span className="font-semibold text-gray-700">0 / 200 封</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"/>
              月度搜索配额：<span className="font-semibold text-gray-700">0 / 500 次</span>
            </span>
            {gmailConnected && (
              <>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5 text-green-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
                  Gmail 已连接：{gmailEmail}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
          {/* Product Knowledge missing banner */}
          {!hasKnowledge && activeTab !== "knowledge" && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">产品知识库尚未配置</p>
                <p className="text-xs text-amber-600 mt-0.5">AI 需要先了解你的公司和产品信息，才能写出精准的邮件和报价。请先完善产品知识库。</p>
              </div>
              <button onClick={() => setActiveTab("knowledge")} className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap">
                立即配置
              </button>
            </div>
          )}

          {/* Overview */}
          {activeTab === "overview" && <OverviewPage />}

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
        onSendGmail={handleSendGmail}
        productKnowledge={productKnowledge}
        gmailConnected={gmailConnected}
        gmailEmail={gmailEmail}
        onConnectGmail={handleConnectGmail}
        sendingGmail={sendingGmail}
        customerEmail={emailResults[selectedCustomer?.website?.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || ""]?.[0]?.email || ""}
      />
    </div>
  );
}
