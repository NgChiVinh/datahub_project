"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AdminTableWrapper from "@/components/admin/AdminTableWrapper";

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
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xoá user này?")) return;
    if (id === currentUser?._id?.toString()) { toast.error("Không thể xóa tài khoản của chính bạn!"); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) { toast.success("Xóa người dùng thành công!"); fetchUsers(); }
      else { toast.error("Xóa người dùng thất bại"); }
    } catch { toast.error("Lỗi kết nối"); }
  };

  const isSelf = (id) => id === currentUser?._id?.toString();

  return (
    <div className="space-y-7 pb-10">
      <div>
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
          <span className="w-6 h-[2px] bg-emerald-600"></span>
          Quản lý
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Người dùng</h1>
        <p className="text-sm text-slate-400 font-medium mt-1">Danh sách tất cả sinh viên & admin trong hệ thống</p>
      </div>

      <AdminTableWrapper>
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{users.length} thành viên</p>
        </div>

        <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Họ và tên</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email / MSSV</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                          {u.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-slate-600 font-medium">{u.email}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{u.studentId || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={isSelf(u._id)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                          isSelf(u._id)
                            ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                            : u.role === "admin"
                            ? "bg-primary/5 text-primary border-primary/20 hover:border-primary/40"
                            : "bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={isSelf(u._id)}
                        title={isSelf(u._id) ? "Không thể xóa tài khoản của chính bạn" : "Xóa người dùng"}
                        className={`p-2.5 rounded-xl transition-all ${
                          isSelf(u._id) ? "text-slate-200 cursor-not-allowed" : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </AdminTableWrapper>
    </div>
  );
}
