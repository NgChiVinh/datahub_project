"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoryAdmin() {
  const [categories, setCategories] = useState([]);
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", majorId: "", parentId: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [catRes, majorRes] = await Promise.all([fetch(`${base}/api/categories`), fetch(`${base}/api/majors`)]);
      setCategories(await catRes.json());
      setMajors(await majorRes.json());
    } catch { toast.error("Lỗi khi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingId ? "Đang cập nhật..." : "Đang tạo mới...");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${base}/api/categories/${editingId}` : `${base}/api/categories`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || "Lỗi xử lý"); }
      toast.success(editingId ? "Cập nhật thành công!" : "Tạo mới thành công!", { id: loadingToast });
      setForm({ name: "", description: "", majorId: "", parentId: "" });
      setEditingId(null);
      fetchData();
    } catch (err) { toast.error(err.message || "Lỗi hệ thống", { id: loadingToast }); }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || "", majorId: cat.majorId?._id || cat.majorId || "", parentId: cat.parentId?._id || cat.parentId || "" });
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${base}/api/categories/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); toast.error(errData.message || "Xóa thất bại"); return; }
      toast.success("Xóa thành công");
      fetchData();
    } catch { toast.error("Lỗi khi xóa"); }
  };

  const inputCls = "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/5 transition-all placeholder:text-slate-300 shadow-sm";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <span className="w-6 h-[2px] bg-emerald-600"></span>
            Quản lý
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh mục & Môn học</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Cấu trúc chương trình đào tạo</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{categories.length} Danh mục</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{majors.length} Chuyên ngành</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/10 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
        <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {editingId
                  ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                }
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                {editingId ? "Cập nhật thông tin danh mục" : "Thiết lập môn học mới"}
              </span>
            </div>
            {editingId && (
              <button
                onClick={() => { setEditingId(null); setForm({ name: "", description: "", majorId: "", parentId: "" }); }}
                className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                Hủy bỏ
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên môn học *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Cấu trúc dữ liệu..." className={inputCls} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Chuyên ngành</label>
                <select value={form.majorId} onChange={e => setForm({...form, majorId: e.target.value, parentId: ""})} className={inputCls + " appearance-none cursor-pointer"} required>
                  <option value="">-- Chọn chuyên ngành --</option>
                  {majors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Môn học cha</label>
                <select value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} disabled={!form.majorId}
                  className={inputCls + " appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}>
                  <option value="">-- Cấp cao nhất --</option>
                  {categories.filter(c => !c.parentId && c._id !== editingId && (c.majorId?._id || c.majorId) === form.majorId)
                    .map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mô tả ngắn</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ghi chú thêm..." className={inputCls} />
              </div>
            </div>

            <div className="flex justify-end mt-7">
              <button type="submit"
                className="group relative px-9 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:brightness-110 transition-all active:scale-95">
                <span className="flex items-center gap-2.5">
                  {editingId ? "Xác nhận cập nhật" : "Khởi tạo môn học"}
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cơ sở dữ liệu danh mục</h3>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <div className="w-3 h-3 rounded-full bg-slate-100"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="px-7 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Môn học / Danh mục</th>
                <th className="px-7 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Phân loại</th>
                <th className="px-7 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Chuyên ngành</th>
                <th className="px-7 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center">
                    <p className="text-sm font-bold text-slate-400 italic">Chưa có dữ liệu nào</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-2">
                        {cat.parentId ? (
                          <>
                            <span className="text-slate-300 font-light text-lg">↳</span>
                            <span className="text-sm font-semibold text-slate-600 group-hover:text-primary transition-colors">{cat.name}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{cat.name}</span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 ml-5 line-clamp-1">{cat.description}</p>
                      )}
                    </td>
                    <td className="px-7 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        cat.parentId ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-primary/5 text-primary border-primary/20 shadow-sm"
                      }`}>
                        {cat.parentId ? "Môn con" : "Gốc (Parent)"}
                      </span>
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-xs font-semibold text-slate-600">{cat.majorId?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-7 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(cat)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all"
                          title="Chỉnh sửa">
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(cat._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all"
                          title="Xóa vĩnh viễn">
                          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
          <div className="p-5 bg-slate-50/50 border-t border-slate-50 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {categories.length} danh mục • Hệ thống quản lý dữ liệu tập trung
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
