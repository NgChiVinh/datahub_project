"use client";

import { useEffect, useState } from "react";

export default function MajorAdmin() {
  const [majors, setMajors] = useState([]);
  const [form, setForm] = useState({
    majorCode: "",
    name: "",
    department: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchMajors = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/majors");
      const data = await res.json();
      setMajors(data);
    } catch (err) {
      alert("Lỗi tải danh sách ngành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/api/majors/${editingId}`
      : `http://localhost:5000/api/majors`;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(editingId && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(form),
    });

    setForm({ majorCode: "", name: "", department: "" });
    setEditingId(null);
    fetchMajors();
  };

  const handleEdit = (m) => {
    setForm({
      majorCode: m.majorCode,
      name: m.name,
      department: m.department,
    });
    setEditingId(m._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa ngành này?")) return;

    await fetch(`http://localhost:5000/api/majors/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchMajors();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
          Quản lý <span className="text-primary">Ngành học</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
          Danh sách các chuyên ngành đào tạo
        </p>
      </div>

      {/* FORM */}
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          {editingId ? "Cập nhật ngành học" : "Thêm ngành học mới"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã ngành</label>
              <input
                type="text"
                placeholder="Ví dụ: KTPM, graphic-design..."
                value={form.majorCode}
                onChange={(e) => setForm({ ...form, majorCode: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên ngành</label>
              <input
                type="text"
                placeholder="Kỹ thuật phần mềm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Khoa quản lý</label>
              <input
                type="text"
                placeholder="Công nghệ thông tin"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
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
                  setForm({ majorCode: "", name: "", department: "" });
                }}
                className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            )}
            <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95">
              {editingId ? "Cập nhật ngành" : "Thêm ngành mới"}
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
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Mã ngành</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tên ngành</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Khoa</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</td>
                </tr>
              ) : (
                majors.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg border border-slate-200">
                        {m.majorCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{m.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 font-bold">{m.department}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Chỉnh sửa"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
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
