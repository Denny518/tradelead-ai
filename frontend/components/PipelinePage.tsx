"use client";

import { useState, useEffect } from "react";
import { listCustomers, updateCustomer, Customer } from "@/lib/api";

const STAGES: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "新线索", color: "text-gray-600", bg: "bg-gray-50" },
  sent: { label: "已发送", color: "text-blue-600", bg: "bg-blue-50" },
  replied: { label: "已回复", color: "text-green-600", bg: "bg-green-50" },
  quoted: { label: "已报价", color: "text-yellow-600", bg: "bg-yellow-50" },
  won: { label: "已成交", color: "text-amber-600", bg: "bg-amber-50" },
  lost: { label: "已流失", color: "text-red-600", bg: "bg-red-50" },
};

const STAGE_ORDER = ["new", "sent", "replied", "quoted", "won", "lost"];

export default function PipelinePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listCustomers({ limit: 200 });
      setCustomers(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDragStart = (e: React.DragEvent, customerId: number) => {
    e.dataTransfer.setData("customerId", String(customerId));
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOver(null);
    const customerId = parseInt(e.dataTransfer.getData("customerId"));
    if (isNaN(customerId)) return;

    // Optimistic update
    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, status } : c)));
    try {
      await updateCustomer(customerId, { status });
    } catch (err) {
      console.error("Failed to update:", err);
      fetchData(); // Revert on error
    }
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOver(status);
  };

  const getCustomersByStage = (stage: string) => customers.filter((c) => c.status === stage);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  // Calculate totals
  const total = customers.length;
  const won = customers.filter((c) => c.status === "won").length;
  const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : "0";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Pipeline 看板</h2>
          <p className="text-sm text-gray-500">拖拽客户卡片更新状态</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">总计 <b className="text-gray-900">{total}</b> 客户</span>
          <span className="text-gray-500">成交 <b className="text-green-600">{won}</b></span>
          <span className="text-gray-500">转化率 <b className="text-blue-600">{conversionRate}%</b></span>
          <button onClick={fetchData} className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">刷新</button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="grid grid-cols-6 gap-2 sm:gap-3" style={{ minWidth: "900px", gridTemplateColumns: "repeat(6, minmax(130px, 1fr))" }}>
        {STAGE_ORDER.map((stage) => {
          const stageCustomers = getCustomersByStage(stage);
          const stageInfo = STAGES[stage];
          const isOver = dragOver === stage;

          return (
            <div
              key={stage}
              onDrop={(e) => handleDrop(e, stage)}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={() => setDragOver(null)}
              className={`rounded-xl border-2 transition-all min-h-[300px] ${
                isOver ? "border-primary bg-blue-50/50" : "border-transparent bg-gray-50"
              }`}
            >
              {/* Stage header */}
              <div className={`px-3 py-3 rounded-t-xl ${stageInfo.bg}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${stageInfo.color}`}>{stageInfo.label}</span>
                  <span className="text-xs font-bold text-gray-500">{stageCustomers.length}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2">
                {stageCustomers.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow text-sm"
                  >
                    <div className="font-medium text-gray-900 truncate">{c.company_name}</div>
                    {c.contact_name && (
                      <div className="text-xs text-gray-500 mt-1">{c.contact_name}</div>
                    )}
                    {c.email && (
                      <div className="text-xs text-gray-400 truncate mt-0.5">{c.email}</div>
                    )}
                    {c.match_score > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.match_score >= 80 ? "bg-green-500" : c.match_score >= 60 ? "bg-yellow-500" : "bg-orange-500"}`}
                            style={{ width: `${c.match_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{c.match_score}</span>
                      </div>
                    )}
                  </div>
                ))}
                {stageCustomers.length === 0 && (
                  <div className="text-center py-6 text-xs text-gray-300">拖拽到此</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
