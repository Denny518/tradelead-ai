"use client";

import { useState, useEffect } from "react";
import { getTeamMembers, addTeamMember, removeTeamMember } from "@/lib/api";

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      setMembers(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    try {
      await addTeamMember(email, role);
      setEmail("");
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("确认移除该成员？")) return;
    try {
      await removeTeamMember(id);
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">团队协作</h2>
          <p className="text-sm text-gray-500">邀请团队成员，共享客户数据</p>
        </div>
      </div>

      {/* Add member form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">邀请团队成员</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">邮箱地址</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">角色</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="member">业务员</option>
              <option value="owner">管理员</option>
            </select>
          </div>
          <button onClick={handleAdd} disabled={!email.trim()} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50">
            发送邀请
          </button>
        </div>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
          <p className="text-lg">暂无团队成员</p>
          <p className="text-sm mt-1">邀请你的同事加入团队</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 font-medium text-gray-500">邮箱</th>
                <th className="px-6 py-3 font-medium text-gray-500">角色</th>
                <th className="px-6 py-3 font-medium text-gray-500">加入时间</th>
                <th className="px-6 py-3 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.memberEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.role === "owner" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                      {m.role === "owner" ? "管理员" : "业务员"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(m.createdAt).toLocaleDateString("zh-CN")}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleRemove(m.id)} className="text-red-500 hover:text-red-700 text-xs">移除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
