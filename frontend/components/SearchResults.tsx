"use client";

import { SearchResultItem } from "@/lib/api";

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-50 text-blue-700" },
  google_maps: { label: "Maps", color: "bg-green-50 text-green-700" },
  google_local: { label: "Local", color: "bg-teal-50 text-teal-700" },
  google_shopping: { label: "Shopping", color: "bg-orange-50 text-orange-700" },
  google_news: { label: "News", color: "bg-purple-50 text-purple-700" },
  bing: { label: "Bing", color: "bg-cyan-50 text-cyan-700" },
};

function SourceBadge({ source }: { source?: string }) {
  const badge = source ? SOURCE_BADGES[source] : null;
  if (!badge) return null;
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${badge.color}`}>
      {badge.label}
    </span>
  );
}

interface SearchResultsProps {
  results: SearchResultItem[];
  onFindEmail: (website: string) => void;
  onGenerateEmail: (item: SearchResultItem) => void;
  onSaveToCRM: (item: SearchResultItem) => void;
  findingEmail: string | null;
  emailResults: Record<string, { name: string; email: string; position: string }[]>;
  savedIds: Set<number>;
  emailsGenerated: Set<number>;
}

export default function SearchResults({
  results,
  onFindEmail,
  onGenerateEmail,
  onSaveToCRM,
  findingEmail,
  emailResults,
  savedIds,
  emailsGenerated,
}: SearchResultsProps) {
  if (results.length === 0) return null;

  // Count steps completed
  const withEmails = results.filter((_, i) => {
    const domain = extractDomain(results[i].website);
    return !!emailResults[domain];
  }).length;

  return (
    <div className="mt-6 space-y-4">
      {/* Workflow progress indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="font-medium text-gray-900">搜索客户</span>
            <span className="text-xs text-gray-400">({results.length} 条结果)</span>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeWidth={2}/></svg>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${withEmails > 0 ? "bg-green-500" : "bg-gray-300"}`}>2</div>
            <span className={`font-medium ${withEmails > 0 ? "text-gray-900" : "text-gray-400"}`}>查找邮箱</span>
            <span className="text-xs text-gray-400">({withEmails}/{results.length} 已查找)</span>
          </div>
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeWidth={2}/></svg>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${emailsGenerated.size > 0 ? "bg-green-500" : "bg-gray-300"}`}>3</div>
            <span className={`font-medium ${emailsGenerated.size > 0 ? "text-gray-900" : "text-gray-400"}`}>生成开发信</span>
            <span className="text-xs text-gray-400">({emailsGenerated.size} 已生成)</span>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">公司名称</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">网站</th>
                <th className="px-4 py-3 font-medium text-gray-500 max-w-xs">描述</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">匹配度</th>
                <th className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">三步流程</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map((item, idx) => {
                const domain = extractDomain(item.website);
                const emails = emailResults[domain];
                const isSaved = savedIds.has(idx);
                const emailGenerated = emailsGenerated.has(idx);

                return (
                  <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${emails?.length ? "bg-green-50/30" : ""} ${emailGenerated ? "bg-blue-50/20" : ""}`}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 flex items-center gap-1.5 flex-wrap">
                        {item.company_name}
                        <SourceBadge source={item.source} />
                      </div>
                      {item.address && <div className="text-[11px] text-gray-400 mt-0.5">{item.address}</div>}
                      {item.phone && <div className="text-[11px] text-gray-400">{item.phone}</div>}
                      {item.rating ? <div className="text-[11px] text-yellow-600 mt-0.5">★ {item.rating} ({item.reviews_count} reviews)</div> : null}
                    </td>
                    <td className="px-4 py-4">
                      <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                        {domain.length > 25 ? domain.slice(0, 25) + "..." : domain}
                      </a>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs max-w-xs">
                      <div className="line-clamp-2">{item.description}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.match_score >= 80 ? "bg-green-500" : item.match_score >= 60 ? "bg-yellow-500" : "bg-orange-500"}`}
                            style={{ width: `${item.match_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{item.match_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* Step 1 indicator - always done */}
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-[10px] font-bold" title="搜索完成">1</span>
                        <span className="text-gray-300 mx-0.5">→</span>

                        {/* Step 2: Find Email */}
                        {emails?.length ? (
                          <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold" title="邮箱已找到">2</span>
                        ) : (
                          <button
                            onClick={() => onFindEmail(domain)}
                            disabled={findingEmail === domain}
                            className="px-2 py-1.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {findingEmail === domain ? "查找中..." : "找邮箱"}
                          </button>
                        )}
                        <span className="text-gray-300 mx-0.5">→</span>

                        {/* Step 3: Generate Email */}
                        {emailsGenerated.has(idx) ? (
                          <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold" title="邮件已生成">3</span>
                        ) : (
                          <button
                            onClick={() => onGenerateEmail(item)}
                            className={`px-2 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
                              emails?.length
                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                            disabled={!emails?.length}
                            title={!emails?.length ? "请先查找邮箱" : "生成开发信"}
                          >
                            写开发信
                          </button>
                        )}
                      </div>

                      {/* Email details */}
                      {emails && emails.length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-[11px] max-w-[200px]">
                          {emails.map((e, ei) => (
                            <div key={ei} className={ei > 0 ? "mt-1 pt-1 border-t border-gray-100" : ""}>
                              <div className="font-medium text-gray-700">{e.name}</div>
                              {e.position && <div className="text-gray-400">{e.position}</div>}
                              <div className="text-primary text-[10px]">{e.email}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Save to CRM */}
                      <div className="mt-1">
                        <button
                          onClick={() => onSaveToCRM(item)}
                          disabled={isSaved}
                          className={`text-[10px] font-medium transition-colors ${
                            isSaved ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:text-purple-800"
                          }`}
                        >
                          {isSaved ? "已保存到CRM" : "保存到CRM"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}
