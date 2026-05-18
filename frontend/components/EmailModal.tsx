"use client";

import { useState, useEffect } from "react";
import { EmailVersion, AIScore, ProductKnowledge } from "@/lib/api";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  contactName: string;
  emails: Record<string, EmailVersion> | null;
  generating: boolean;
  onRegenerate: (emailType: string, language: string) => void;
  onCopy: (content: string) => void;
  onSaveEmail: (version: number, subject: string, content: string) => void;
  productKnowledge: ProductKnowledge | null;
}

const VERSION_LABELS: Record<string, string> = {
  version1: "正式版",
  version2: "简洁版",
  version3: "故事版",
};

const EMAIL_TYPES = [
  { value: "initial", label: "初次开发信" },
  { value: "followup1", label: "跟进 Day3" },
  { value: "followup2", label: "跟进 Day7" },
  { value: "followup3", label: "跟进 Day14" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
  { value: "ru", label: "Русский" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "it", label: "Italiano" },
  { value: "nl", label: "Nederlands" },
  { value: "tr", label: "Türkçe" },
  { value: "pl", label: "Polski" },
  { value: "th", label: "ไทย" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "zh", label: "中文" },
];

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 8 ? "bg-green-500" : score >= 6 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="w-5 text-right font-medium text-gray-700">{score}</span>
    </div>
  );
}

export default function EmailModal({
  isOpen,
  onClose,
  customerName,
  contactName,
  emails,
  generating,
  onRegenerate,
  onCopy,
  onSaveEmail,
  productKnowledge,
}: EmailModalProps) {
  const [activeVersion, setActiveVersion] = useState("version1");
  const [emailType, setEmailType] = useState("initial");
  const [language, setLanguage] = useState("en");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (emails && emails[activeVersion]) {
      setEditedContent(emails[activeVersion].content);
    }
  }, [emails, activeVersion]);

  if (!isOpen) return null;

  const currentEmail = emails?.[activeVersion];
  const aiScore = currentEmail?.aiScore as AIScore | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI 生成开发信</h3>
            <p className="text-sm text-gray-500">
              客户：{customerName}{contactName ? ` / ${contactName}` : ""}
              {productKnowledge && <span className="text-green-600 ml-2">使用产品知识库</span>}
              {!productKnowledge && <span className="text-orange-500 ml-2">未配置产品知识库（建议配置后生成）</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-4 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 mr-1">类型:</span>
            {EMAIL_TYPES.map((et) => (
              <button
                key={et.value}
                onClick={() => { setEmailType(et.value); onRegenerate(et.value, language); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  emailType === et.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {et.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 mr-1">语言:</span>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); onRegenerate(emailType, e.target.value); }}
              className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:ring-1 focus:ring-primary/20 outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Version tabs */}
        <div className="px-6 pt-4 flex gap-2 flex-shrink-0">
          {Object.entries(VERSION_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveVersion(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeVersion === key
                  ? "bg-blue-50 text-primary border border-blue-200"
                  : "text-gray-500 hover:text-gray-700 border border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
          {aiScore && (
            <div className="ml-auto flex items-center gap-2">
              <span className={`text-sm font-bold ${aiScore.overallScore >= 7 ? "text-green-600" : aiScore.overallScore >= 5 ? "text-yellow-600" : "text-red-600"}`}>
                综合评分 {aiScore.overallScore}/10
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          {generating ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin w-8 h-8 mx-auto mb-3 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-500 text-sm">AI 正在生成邮件...</p>
              </div>
            </div>
          ) : currentEmail ? (
            <>
              {/* AI Quality Score */}
              {aiScore && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 mb-3">AI 质量自评</div>
                  <div className="space-y-2">
                    <ScoreBar label="个性化" score={aiScore.personalization} />
                    <ScoreBar label="价值清晰度" score={aiScore.valueClarity} />
                    <ScoreBar label="社会证明" score={aiScore.socialProof} />
                    <ScoreBar label="CTA 明确性" score={aiScore.ctaClarity} />
                    <ScoreBar label="垃圾邮件风险" score={10 - aiScore.spamRisk} />
                  </div>
                  {aiScore.feedback && (
                    <p className="mt-2 text-xs text-gray-500 italic">AI 建议：{aiScore.feedback}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">主题行</label>
                <input
                  type="text"
                  value={currentEmail.subject}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮件内容（可编辑后发送）</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">暂无内容</div>
          )}
        </div>

        {/* Actions */}
        {currentEmail && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => onCopy(editedContent)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              复制内容
            </button>
            <button
              onClick={() => onSaveEmail(parseInt(activeVersion.replace("version", "")), currentEmail.subject, editedContent)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" />
              </svg>
              保存并标记已发送
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
