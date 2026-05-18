"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import SearchForm from "@/components/SearchForm";
import SearchResults from "@/components/SearchResults";
import EmailModal from "@/components/EmailModal";
import CRMPage from "@/components/CRMPage";
import {
  searchCustomers,
  findEmail,
  generateEmail,
  createCustomer,
  saveEmailToCustomer,
  SearchResultItem,
  EmailVersion,
} from "@/lib/api";

export default function DashboardPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("search");

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

  // Product info for email generation
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    advantages: [] as string[],
  });

  // ── Handlers ────────────────────────────────────────────────

  const handleSearch = useCallback(
    async (params: { product: string; market: string; industry: string; limit: number }) => {
      setSearchLoading(true);
      setSearchResults([]);
      setEmailResults({});
      setSavedIds(new Set());
      setProductInfo({
        name: params.product,
        description: params.product,
        advantages: ["高品质", "竞争力价格", "快速发货"],
      });
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
      if (emailResults[domain]) return; // Already found
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
      setSelectedCustomer(item);
      setEmailModalOpen(true);
      setGeneratingEmail(true);
      setGeneratedEmails(null);
      try {
        const res = await generateEmail({
          product_info: productInfo,
          customer_info: {
            company_name: item.company_name,
            website: item.website,
            description: item.description,
            contact_name: "",
          },
          email_type: "initial",
        });
        setGeneratedEmails(res.data || {});
      } catch (err) {
        console.error("Generate email failed:", err);
        alert("邮件生成失败，请确认后端服务已启动");
      } finally {
        setGeneratingEmail(false);
      }
    },
    [productInfo]
  );

  const handleRegenerate = useCallback(
    async (emailType: string) => {
      if (!selectedCustomer) return;
      setGeneratingEmail(true);
      setGeneratedEmails(null);
      try {
        const res = await generateEmail({
          product_info: productInfo,
          customer_info: {
            company_name: selectedCustomer.company_name,
            website: selectedCustomer.website,
            description: selectedCustomer.description,
            contact_name: "",
          },
          email_type: emailType,
        });
        setGeneratedEmails(res.data || {});
      } catch (err) {
        console.error("Regenerate failed:", err);
      } finally {
        setGeneratingEmail(false);
      }
    },
    [selectedCustomer, productInfo]
  );

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      alert("已复制到剪贴板");
    });
  }, []);

  const handleSaveEmail = useCallback(
    async (version: number, subject: string, content: string) => {
      if (!selectedCustomer) return;
      try {
        // Save customer to CRM
        const cust = await createCustomer({
          company_name: selectedCustomer.company_name,
          website: selectedCustomer.website,
          description: selectedCustomer.description,
          match_score: selectedCustomer.match_score,
          status: "sent",
        });
        // Save the email
        await saveEmailToCustomer(cust.id, {
          subject,
          content,
          version,
          email_type: "initial",
        });
        // Mark as saved
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
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">概览</h2>
              <p className="text-gray-500 mb-8">欢迎使用 TradeLead AI，你的外贸获客智能助手</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">今日剩余搜索</div>
                  <div className="text-3xl font-bold text-gray-900">250</div>
                  <div className="text-xs text-gray-400 mt-1">SerpAPI 免费配额</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">AI 邮件额度</div>
                  <div className="text-3xl font-bold text-gray-900">10</div>
                  <div className="text-xs text-gray-400 mt-1">本月剩余</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="text-sm text-gray-500 mb-1">邮箱查询额度</div>
                  <div className="text-3xl font-bold text-gray-900">25</div>
                  <div className="text-xs text-gray-400 mt-1">Hunter.io 免费配额</div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-gray-900 mb-2">快速开始</h3>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. 点击左侧"客户搜索"，输入你的产品和目标市场</li>
                  <li>2. 在搜索结果中，点击"找邮箱"获取客户联系方式</li>
                  <li>3. 点击"生成邮件"，AI 为你生成个性化开发信</li>
                  <li>4. 复制邮件内容，到 Gmail 手动发送</li>
                  <li>5. 在"我的客户"中管理跟进状态</li>
                </ol>
              </div>
            </div>
          )}

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
              />
            </div>
          )}

          {activeTab === "crm" && <CRMPage />}

          {activeTab === "templates" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">邮件模板</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                <p className="text-lg">邮件模板管理功能即将上线</p>
                <p className="text-sm mt-1">你可以保存常用的邮件模板，快速复用</p>
              </div>
            </div>
          )}
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
      />
    </div>
  );
}
