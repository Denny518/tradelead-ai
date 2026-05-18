"use client";

import { useState, useEffect } from "react";
import { EmailVersion } from "@/lib/api";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  contactName: string;
  emails: Record<string, EmailVersion> | null;
  generating: boolean;
  onRegenerate: (emailType: string) => void;
  onCopy: (content: string) => void;
  onSaveEmail: (version: number, subject: string, content: string) => void;
}

const VERSION_LABELS: Record<string, string> = {
  version1: "正式版",
  version2: "简洁版",
  version3: "故事版",
};

const EMAIL_TYPES = [
  { value: "initial", label: "初次开发信" },
  { value: "followup1", label: "跟进 第3天" },
  { value: "followup2", label: "跟进 第7天" },
  { value: "followup3", label: "跟进 第14天" },
];

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
}: EmailModalProps) {
  const [activeVersion, setActiveVersion] = useState("version1");
  const [emailType, setEmailType] = useState("initial");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    if (emails && emails[activeVersion]) {
      setEditedContent(emails[activeVersion].content);
    }
  }, [emails, activeVersion]);

  if (!isOpen) return null;

  const currentEmail = emails?.[activeVersion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI 生成开发信</h3>
            <p className="text-sm text-gray-500">
              客户：{customerName}{contactName ? ` / ${contactName}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email type selector */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-500 mr-1">邮件类型：</span>
          <div className="flex gap-1">
            {EMAIL_TYPES.map((et) => (
              <button
                key={et.value}
                onClick={() => { setEmailType(et.value); onRegenerate(et.value); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  emailType === et.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {et.label}
              </button>
            ))}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">邮件内容（可编辑）</label>
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
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              复制内容
            </button>
            <button
              onClick={() => onSaveEmail(parseInt(activeVersion.replace("version", "")), currentEmail.subject, editedContent)}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
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
