"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", majorId: "", parentId: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [catRes, majorRes] = await Promise.all([
        fetch(`${baseUrl}/api/categories`),
        fetch(`${baseUrl}/api/majors`),
      ]);
      setCategories(await catRes.json());
      setMajors(await majorRes.json());
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? "Đang cập nhật..." : "Đang tạo mới...");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${baseUrl}/api/categories/${editingId}` : `${baseUrl}/api/categories`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi xử lý");
      }
      toast.success(editingId ? "Cập nhật thành công!" : "Tạo mới thành công!", { id: loadingToast });
      setForm({ name: "", description: "", majorId: "", parentId: "" });
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
      parentId: cat.parentId?._id || cat.parentId || "",
    });
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.message || "Xóa thất bại");
        return;
      }
      toast.success("Xóa thành công");
      fetchData();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  const inputCls = "w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 focus:outline-none transition-all";
  const selectCls = inputCls + " appearance-none cursor-pointer";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Danh mục & Môn học</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Cấu trúc chương trình đào tạo</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ffffff06] border border-[#ffffff08] rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[11px] font-medium text-slate-400">{categories.length} danh mục</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ffffff06] border border-[#ffffff08] rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
            <span className="text-[11px] font-medium text-slate-400">{majors.length} chuyên ngành</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ffffff08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
              {editingId ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              )}
            </div>
            <span className="text-[13px] font-medium text-white">
              {editingId ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </span>
          </div>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setForm({ name: "", description: "", majorId: "", parentId: "" }); }}
              className="text-[12px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              Hủy bỏ
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tên môn học *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="VD: Cấu trúc dữ liệu..."
                className={inputCls}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Chuyên ngành</label>
              <select
                value={form.majorId}
                onChange={(e) => setForm({ ...form, majorId: e.target.value, parentId: "" })}
                className={selectCls}
                required
              >
                <option value="">-- Chọn chuyên ngành --</option>
                {majors.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Danh mục cha</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                disabled={!form.majorId}
                className={`${selectCls} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <option value="">-- Cấp cao nhất --</option>
                {categories
                  .filter(c => !c.parentId && c._id !== editingId && (c.majorId?._id || c.majorId) === form.majorId)
                  .map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Mô tả ngắn</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ghi chú thêm..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-500 text-[#09090f] rounded-xl text-[13px] font-semibold hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              {editingId ? "Xác nhận cập nhật" : "Khởi tạo môn học"}
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ffffff08] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cơ sở dữ liệu danh mục</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tên danh mục</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Phân loại</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Chuyên ngành</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Hành động</th>
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
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <p className="text-[13px] text-slate-500">Chưa có dữ liệu nào</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-[#ffffff04] transition-colors group">
                    <td className="px-5 py-3.5">
                      {cat.parentId ? (
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-slate-600 text-sm">↳</span>
                          <span className="text-[13px] text-slate-300">{cat.name}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-medium text-slate-200">{cat.name}</span>
                      )}
                      {cat.description && (
                        <p className="text-[11px] text-slate-600 mt-0.5 pl-5 line-clamp-1">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                        cat.parentId
                          ? "bg-slate-500/15 text-slate-400 border-slate-500/20"
                          : "bg-cyan-500/15 text-cyan-400 border-cyan-500/20"
                      }`}>
                        {cat.parentId ? "Danh mục con" : "Gốc"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                        <span className="text-[12px] text-slate-400">{cat.majorId?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#ffffff08] text-slate-400 hover:bg-cyan-500/15 hover:text-cyan-400 transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && categories.length > 0 && (
          <div className="px-5 py-3 border-t border-[#ffffff08]">
            <p className="text-[11px] text-slate-600">{categories.length} danh mục</p>
          </div>
        )}
      </div>
    </div>
  );
}
