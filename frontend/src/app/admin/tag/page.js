"use client";

import { useEffect, useState } from "react";

export default function TagAdmin() {
  const [tags, setTags] = useState([]);
  const [form, setForm] = useState({
    name: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/tags");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTags(data);
      }
    } catch (err) {
      alert("Lỗi tải danh sách tag");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Bạn cần đăng nhập với quyền Admin");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/tags/${editingId}`
      : `http://localhost:5000/api/tags`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ name: "" });
        setEditingId(null);
        fetchTags();
        alert(editingId ? "Cập nhật thành công" : "Thêm tag mới thành công");
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  const handleEdit = (tag) => {
    setForm({
      name: tag.name,
    });
    setEditingId(tag._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa tag này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchTags();
        alert("Xóa thành công");
      } else {
        const data = await res.json();
        alert(data.message || "Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
          Quản lý <span className="text-primary">Thẻ (Tags)</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
          Danh sách các từ khóa phân loại tài liệu
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          {editingId ? "Cập nhật thẻ" : "Thêm thẻ mới"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên thẻ</label>
              <input
                type="text"
                placeholder="Ví dụ: Lập trình, Đồ họa, Marketing..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: "" });
                }}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            )}
            <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
              {editingId ? "Cập nhật thẻ" : "Thêm thẻ mới"}
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tên thẻ</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Slug</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</td>
                </tr>
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Chưa có thẻ nào</td>
                </tr>
              ) : (
                tags.map((tag) => (
                  <tr key={tag._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{tag.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg border border-slate-200">
                        {tag.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(tag._id)}
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
