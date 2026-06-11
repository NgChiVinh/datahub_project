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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Lỗi tải danh sách user");
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        toast.error("Lỗi tải danh sách user");
        return;
      }
      setUsers(data);
    } catch (err) {
      toast.error("Lỗi tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangeRole = async (id, role) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        toast.success("Cập nhật vai trò thành công!");
        fetchUsers();
      } else {
        toast.error("Cập nhật vai trò thất bại");
      }
    } catch (err) {
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Xóa người dùng thành công!");
        fetchUsers();
      } else {
        toast.error("Xóa người dùng thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Quản lý <span className="text-primary">Người dùng</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Danh sách tất cả sinh viên & Admin
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Họ và tên</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Email / MSSV</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Vai trò</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          {u.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600">{u.email}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{u.studentId || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={u._id === currentUser?._id?.toString()}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none transition-all ${
                          u._id === currentUser?._id?.toString()
                            ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                            : u.role === "admin"
                            ? "cursor-pointer bg-primary/5 text-primary border-primary/20"
                            : "cursor-pointer bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u._id)}
                        disabled={u._id === currentUser?._id?.toString()}
                        className={`p-2 rounded-xl transition-all ${
                          u._id === currentUser?._id?.toString()
                            ? "text-slate-200 cursor-not-allowed"
                            : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                        }`}
                        title={u._id === currentUser?._id?.toString() ? "Không thể xóa tài khoản của chính bạn" : "Xóa người dùng"}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
