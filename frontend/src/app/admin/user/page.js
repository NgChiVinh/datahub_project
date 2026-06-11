"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function UserAdmin() {
  const [users, setUsers] = useState([]);
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { toast.error("Lỗi tải danh sách user"); return; }
      const data = await res.json();
      if (!Array.isArray(data)) { toast.error("Lỗi tải danh sách user"); return; }
      setUsers(data);
    } catch {
      toast.error("Lỗi tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChangeRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}/role`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role }),
        }
      );
      if (res.ok) { toast.success("Cập nhật vai trò thành công!"); fetchUsers(); }
      else { toast.error("Cập nhật vai trò thất bại"); }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá user này?")) return;
    if (id === currentUser?._id?.toString()) {
      toast.error("Không thể xóa tài khoản của chính bạn!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) { toast.success("Xóa người dùng thành công!"); fetchUsers(); }
      else { toast.error("Xóa người dùng thất bại"); }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const isSelf = (id) => id === currentUser?._id?.toString();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Người dùng</h1>
        <p className="text-[12px] text-slate-500 mt-0.5">Danh sách tất cả sinh viên & admin</p>
      </div>

      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Họ và tên</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Email / MSSV</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff06]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#ffffff04] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#ffffff0a] border border-[#ffffff10] flex items-center justify-center text-cyan-400 font-semibold text-xs flex-shrink-0">
                          {u.fullName?.charAt(0)}
                        </div>
                        <span className="text-[13px] font-medium text-slate-200">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] text-slate-300">{u.email}</span>
                        <span className="text-[11px] text-slate-600">{u.studentId || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={isSelf(u._id)}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-all focus:outline-none cursor-pointer ${
                          isSelf(u._id)
                            ? "opacity-40 cursor-not-allowed bg-[#ffffff06] text-slate-500 border-[#ffffff08]"
                            : u.role === "admin"
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40"
                            : "bg-[#ffffff08] text-slate-400 border-[#ffffff10] hover:border-[#ffffff20]"
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={isSelf(u._id)}
                        title={isSelf(u._id) ? "Không thể xóa tài khoản của chính bạn" : "Xóa người dùng"}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl ml-auto transition-all ${
                          isSelf(u._id)
                            ? "text-slate-700 cursor-not-allowed"
                            : "text-slate-500 hover:bg-red-500/15 hover:text-red-400"
                        }`}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && users.length > 0 && (
          <div className="px-5 py-3 border-t border-[#ffffff08]">
            <p className="text-[11px] text-slate-600">{users.length} người dùng</p>
          </div>
        )}
      </div>
    </div>
  );
}
