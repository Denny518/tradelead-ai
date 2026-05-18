"use client";

import { SearchResultItem } from "@/lib/api";

interface SearchResultsProps {
  results: SearchResultItem[];
  onFindEmail: (website: string) => void;
  onGenerateEmail: (item: SearchResultItem) => void;
  onSaveToCRM: (item: SearchResultItem) => void;
  findingEmail: string | null;
  emailResults: Record<string, { name: string; email: string; position: string }[]>;
  savedIds: Set<number>;
}

const SCORE_COLORS: Record<string, string> = {
  high: "bg-green-500",
  mid: "bg-yellow-500",
  low: "bg-orange-500",
};

function scoreColor(score: number): string {
  if (score >= 80) return SCORE_COLORS.high;
  if (score >= 60) return SCORE_COLORS.mid;
  return SCORE_COLORS.low;
}

export default function SearchResults({
  results,
  onFindEmail,
  onGenerateEmail,
  onSaveToCRM,
  findingEmail,
  emailResults,
  savedIds,
}: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">
          搜索结果 <span className="text-gray-400 font-normal">({results.length} 条)</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-6 py-3 font-medium text-gray-500">公司名称</th>
              <th className="px-6 py-3 font-medium text-gray-500">网站</th>
              <th className="px-6 py-3 font-medium text-gray-500">描述</th>
              <th className="px-6 py-3 font-medium text-gray-500">匹配度</th>
              <th className="px-6 py-3 font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {results.map((item, idx) => {
              const domain = item.website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0];
              const emails = emailResults[domain];
              const isSaved = savedIds.has(idx);

              return (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.company_name}</td>
                  <td className="px-6 py-4">
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {domain.length > 28 ? domain.slice(0, 28) + "..." : domain}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${scoreColor(item.match_score)}`}
                          style={{ width: `${item.match_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{item.match_score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onFindEmail(domain)}
                        disabled={findingEmail === domain}
                        className="px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      >
                        {findingEmail === domain ? "查找中..." : "找邮箱"}
                      </button>
                      <button
                        onClick={() => onGenerateEmail(item)}
                        className="px-2.5 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                      >
                        生成邮件
                      </button>
                      <button
                        onClick={() => onSaveToCRM(item)}
                        disabled={isSaved}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          isSaved
                            ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                            : "text-purple-600 bg-purple-50 hover:bg-purple-100"
                        }`}
                      >
                        {isSaved ? "已保存" : "保存CRM"}
                      </button>
                    </div>
                    {emails && emails.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                        {emails.map((e, ei) => (
                          <div key={ei} className="text-gray-700">
                            <span className="font-medium">{e.name}</span>
                            {e.position && <span className="text-gray-400"> - {e.position}</span>}
                            <br />
                            <span className="text-primary">{e.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
