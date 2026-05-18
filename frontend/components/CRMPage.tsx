"use client";

import { useState, useEffect, useCallback } from "react";
import { Customer, listCustomers, updateCustomer, deleteCustomer, exportCustomersCSVUrl } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  new: { label: "新线索", className: "badge-new" },
  sent: { label: "已发送", className: "badge-sent" },
  replied: { label: "已回复", className: "badge-replied" },
  quoted: { label: "已报价", className: "badge-quoted" },
  won: { label: "已成交", className: "badge-won" },
  lost: { label: "已流失", className: "badge-lost" },
};

const STATUS_OPTIONS = ["new", "sent", "replied", "quoted", "won", "lost"];

export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCustomers({ status: statusFilter || undefined, limit: 200 });
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateCustomer(id, { status: newStatus });
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除此客户？")) return;
    try {
      await deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">我的客户</h2>
          <p className="text-sm text-gray-500">共 {customers.length} 位客户</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="">全部状态</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
            ))}
          </select>
          {/* Export CSV */}
          <a
            href={exportCustomersCSVUrl(statusFilter || undefined)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            导出CSV
          </a>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            刷新
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无客户数据</p>
          <p className="text-sm mt-1">去"客户搜索"页面搜索并保存客户</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">公司名称</th>
                  <th className="px-6 py-3 font-medium text-gray-500">联系人</th>
                  <th className="px-6 py-3 font-medium text-gray-500">邮箱</th>
                  <th className="px-6 py-3 font-medium text-gray-500">状态</th>
                  <th className="px-6 py-3 font-medium text-gray-500">匹配度</th>
                  <th className="px-6 py-3 font-medium text-gray-500">最后更新</th>
                  <th className="px-6 py-3 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{c.company_name}</div>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          {c.website.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div>{c.contact_name || "-"}</div>
                      {c.position && <div className="text-xs text-gray-400">{c.position}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {c.email ? (
                        <span className="text-primary text-xs">{c.email}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === c.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          onBlur={() => handleStatusChange(c.id, editStatus)}
                          autoFocus
                          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white outline-none"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{STATUS_MAP[s]?.label || s}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => { setEditingId(c.id); setEditStatus(c.status); }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_MAP[c.status]?.className || "badge-new"}`}
                        >
                          {STATUS_MAP[c.status]?.label || c.status}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.match_score >= 80 ? "bg-green-500" : c.match_score >= 60 ? "bg-yellow-500" : "bg-orange-500"}`}
                            style={{ width: `${c.match_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{c.match_score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(c.updated_at)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
