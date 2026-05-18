"use client";

import { useState } from "react";
import { generateReply } from "@/lib/api";

const LANGUAGES = [
  { value: "en", label: "English" }, { value: "es", label: "Español" },
  { value: "fr", label: "Français" }, { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" }, { value: "ru", label: "Русский" },
  { value: "pt", label: "Português" }, { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" }, { value: "zh", label: "中文" },
];

const STATUS_OPTIONS = [
  { value: "new inquiry", label: "新询盘" },
  { value: "negotiating", label: "谈判中" },
  { value: "ready to order", label: "即将下单" },
];

export default function RepliesPage() {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerStatus, setCustomerStatus] = useState("new inquiry");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeVersion, setActiveVersion] = useState("version1");

  const handleGenerate = async () => {
    if (!customerEmail.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await generateReply({ customerEmail, customerStatus, language });
      setResult(res.data);
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const versionLabels: Record<string, string> = {
    version1: "专业版",
    version2: "简洁版",
    version3: "说服版",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">AI 询盘回复助手</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">客户邮件内容</h3>
            <textarea
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              rows={10}
              placeholder="粘贴客户发来的邮件内容...&#10;&#10;例：&#10;Dear Sir,&#10;I'm interested in your LED displays. What's the MOQ and delivery time? Also, do you have CE certification?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
            <div className="flex gap-3 mt-3">
              <select value={customerStatus} onChange={(e) => setCustomerStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={loading || !customerEmail.trim()} className="mt-4 w-full py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
              {loading ? "AI 分析并生成回复..." : "生成回复"}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">使用提示</p>
            <ul className="space-y-1 text-blue-700">
              <li>粘贴客户完整邮件内容，AI 会分析问题并逐一回复</li>
              <li>选择正确的客户状态，AI 会调整语气和策略</li>
              <li>如果配置了产品知识库，AI 会用你产品信息精准回复</li>
            </ul>
          </div>
        </div>

        {/* Output */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-500 text-sm">AI 分析邮件并生成回复...</p>
              </div>
            </div>
          ) : result ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Version tabs */}
              <div className="px-4 py-3 border-b border-gray-100 flex gap-1 bg-gray-50">
                {Object.entries(versionLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setActiveVersion(key)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeVersion === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div className="p-5">
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">主题</label>
                  <input type="text" value={result[activeVersion]?.subject || ""} readOnly className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">回复内容（可编辑）</label>
                  <textarea
                    value={result[activeVersion]?.content || ""}
                    onChange={(e) => {
                      const next = { ...result };
                      next[activeVersion].content = e.target.value;
                      setResult(next);
                    }}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">语气：{result[activeVersion]?.tone}</span>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(result[activeVersion]?.content || "")} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">复制回复</button>
                <button onClick={() => handleGenerate()} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark">重新生成</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <p>左边粘贴客户邮件</p>
              <p className="text-sm mt-1">AI 帮你在 10 秒内生成专业回复</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
