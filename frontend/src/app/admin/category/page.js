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
    parentId: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const [catRes, majorRes] = await Promise.all([
        fetch(`${baseUrl}/api/categories`),
        fetch(`${baseUrl}/api/majors`),
      ]);

      const catData = await catRes.json();
      const majorData = await majorRes.json();

      setCategories(catData);
      setMajors(majorData);
    } catch {
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

    const loadingToast = toast.loading(
      editingId ? "Đang cập nhật..." : "Đang tạo mới...",
    );

    try {
      const method = editingId ? "PUT" : "POST";

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const url = editingId
        ? `${baseUrl}/api/categories/${editingId}`
        : `${baseUrl}/api/categories`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          ...form,
          parentId: form.parentId || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.message || "Lỗi xử lý");
      }

      toast.success(
        editingId ? "Cập nhật thành công!" : "Tạo mới thành công!",
        {
          id: loadingToast,
        },
      );

      setForm({
        name: "",
        description: "",
        majorId: "",
        parentId: "",
      });

      setEditingId(null);

      fetchData();
    } catch (err) {
      toast.error(err.message || "Lỗi hệ thống", {
        id: loadingToast,
      });
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      await fetch(`${baseUrl}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Xóa thành công");

      fetchData();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
            Quản lý <span className="text-primary">Danh mục & Môn học</span>
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200"></span>
            Cấu trúc chương trình đào tạo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{categories.length} Danh mục</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{majors.length} Chuyên ngành</span>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {editingId ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </span>
              {editingId ? "Cập nhật thông tin danh mục" : "Thiết lập môn học mới"}
            </h3>
            
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "", description: "", majorId: "", parentId: "" });
                }}
                className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                Hủy bỏ thay đổi
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* TÊN */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Tên môn học <span className="text-red-500 text-xs">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Cấu trúc dữ liệu..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold text-sm placeholder:text-slate-300 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* CHUYÊN NGÀNH */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Thuộc Chuyên ngành
                </label>
                <div className="relative">
                  <select
                    value={form.majorId}
                    onChange={(e) => setForm({ ...form, majorId: e.target.value, parentId: "" })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold text-sm appearance-none cursor-pointer shadow-sm"
                    required
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* MÔN CHA */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Môn học gốc (Cha)
                </label>
                <div className="relative">
                  <select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    disabled={!form.majorId}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold text-sm appearance-none cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Cấp cao nhất --</option>
                    {categories
                      .filter(
                        (c) =>
                          !c.parentId &&
                          c._id !== editingId &&
                          (c.majorId?._id || c.majorId) === form.majorId,
                      )
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* MÔ TẢ */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Mô tả ngắn
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ghi chú thêm về môn này..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-slate-800 font-bold text-sm placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="group relative px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <span className="relative flex items-center gap-3">
                  {editingId ? "Xác nhận cập nhật" : "Khởi tạo môn học"}
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden relative">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
             Cơ sở dữ liệu danh mục
           </h3>
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-slate-200"></div>
             <div className="w-3 h-3 rounded-full bg-slate-100"></div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Môn học / Danh mục</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Phân loại</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Chuyên ngành</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang trích xuất dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-sm font-bold text-slate-400 italic">Chưa có dữ liệu nào được khởi tạo</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {cat.parentId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-light text-xl">↳</span>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{cat.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors uppercase tracking-tight italic">{cat.name}</span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-[10px] text-slate-400 font-medium ml-6 md:ml-0 mt-1 line-clamp-1">{cat.description}</p>
                      )}
                    </td>

                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        cat.parentId 
                          ? "bg-slate-100 text-slate-500 border border-slate-200" 
                          : "bg-indigo-50 text-indigo-500 border border-indigo-100 shadow-sm shadow-indigo-100/50"
                      }`}>
                        {cat.parentId ? "Môn con" : "Gốc (Parent)"}
                      </span>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-xs font-bold text-slate-600">{cat.majorId?.name || "N/A"}</span>
                      </div>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-white hover:text-primary hover:shadow-md border border-transparent hover:border-slate-100 transition-all group/btn"
                          title="Chỉnh sửa"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:shadow-md border border-transparent hover:border-red-100 transition-all"
                          title="Xóa vĩnh viễn"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        
        {/* Footer info */}
        {!loading && categories.length > 0 && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
               Cuộn để xem thêm • Hệ thống quản lý dữ liệu tập trung
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
