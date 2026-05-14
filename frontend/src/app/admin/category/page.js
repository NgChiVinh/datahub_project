"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    majorId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [catRes, majorRes] = await Promise.all([
        fetch(`${baseUrl}/api/categories`),
        fetch(`${baseUrl}/api/majors`)
      ]);
      const catData = await catRes.json();
      const majorData = await majorRes.json();
      
      setCategories(catData);
      setMajors(majorData);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? "Đang cập nhật..." : "Đang tạo mới...");

    try {
      const method = editingId ? "PUT" : "POST";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const url = editingId
        ? `${baseUrl}/api/categories/${editingId}`
        : `${baseUrl}/api/categories`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi xử lý");
      }

      toast.success(editingId ? "Cập nhật thành công!" : "Tạo mới thành công!", { id: loadingToast });
      setForm({ name: "", description: "", majorId: "" });
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Lỗi hệ thống", { id: loadingToast });
    }
  };

  const handleEdit = (cat) => {
    setForm({
      name: cat.name,
      description: cat.description || "",
      majorId: cat.majorId?._id || cat.majorId || "",
    });
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    await fetch(`${baseUrl}/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchData();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
          Quản lý <span className="text-primary">Danh mục & Môn học</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
          Gán môn học vào đúng chuyên ngành
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          {editingId ? "Cập nhật thông tin" : "Thêm môn học mới"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên môn học</label>
              <input
                type="text"
                placeholder="Ví dụ: Lập trình Java..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Thuộc Chuyên ngành</label>
              <select
                value={form.majorId}
                onChange={(e) => setForm({ ...form, majorId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm appearance-none cursor-pointer"
                required
              >
                <option value="">-- Chọn chuyên ngành --</option>
                {majors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả ngắn</label>
              <input
                type="text"
                placeholder="Mô tả môn học"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", description: "", majorId: "" });
                }}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            )}
            <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
              {editingId ? "Cập nhật ngay" : "Tạo môn học"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tên môn học</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Chuyên ngành</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                        <span className="text-[10px] text-slate-300 font-medium">{cat.description || "Không có mô tả"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cat.majorId ? (
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">
                          {cat.majorId.name}
                        </span>
                      ) : (
                        <span className="text-red-400 text-[9px] font-black uppercase">Chưa gán ngành</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Xóa"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
