"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function MaterialAdmin() {
  const [allMaterials, setAllMaterials] = useState([]);
  const [majors, setMajors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", majorId: "", categoryId: "", academicYear: "", status: "",
  });

  const fetchMaterials = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ status: activeStatus, page: String(page), limit: String(limit), sortBy: "latest" });
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (activeTab === "Tài liệu") params.set("materialType", "not_video");
      else if (activeTab === "Video") params.set("materialType", "video");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { toast.error("Lỗi tải danh sách tài liệu"); return; }
      const data = await res.json();
      if (data?.materials) {
        setAllMaterials(data.materials);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      }
    } catch {
      console.error("Lỗi tải dữ liệu materials");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/majors`);
      const data = await res.json();
      if (Array.isArray(data)) setMajors(data);
    } catch {}
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
  };

  useEffect(() => { fetchMajors(); fetchCategories(); }, []);

  useEffect(() => {
    setCurrentPage(1);
    const t = setTimeout(() => fetchMaterials(1), 350);
    return () => clearTimeout(t);
  }, [activeStatus, activeTab, searchTerm]);

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setEditForm({
      title: material.title || "",
      description: material.description || "",
      majorId: material.majorId?._id || material.majorId || "",
      categoryId: material.categoryId?._id || material.categoryId || "",
      academicYear: material.academicYear || "Khác",
      status: material.status || "pending",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials/${editingMaterial._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(editForm),
        }
      );
      if (res.ok) { setIsEditModalOpen(false); fetchMaterials(currentPage); toast.success("Cập nhật thông tin thành công!"); }
      else { toast.error("Cập nhật thất bại"); }
    } catch { toast.error("Lỗi kết nối server"); }
  };

  const handleUpdateStatus = async (id, status) => {
    if (status === "rejected" && !window.confirm("Từ chối tài liệu này?")) return;
    if (status === "hidden" && !window.confirm("Ẩn tài liệu này khỏi hệ thống?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) { toast.success("Cập nhật trạng thái thành công!"); fetchMaterials(currentPage); }
      else { toast.error("Cập nhật trạng thái thất bại"); }
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/materials/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) { toast.success("Xóa tài liệu thành công!"); fetchMaterials(currentPage); }
      else { toast.error("Xóa thất bại"); }
    } catch { toast.error("Lỗi kết nối"); }
  };

  const statusConfig = {
    approved: { label: "Đã duyệt",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
    rejected: { label: "Từ chối",   cls: "bg-red-500/15 text-red-400 border-red-500/20" },
    pending:  { label: "Chờ duyệt", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
    hidden:   { label: "Đã ẩn",     cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" },
  };

  const typeColor = {
    video: "bg-amber-500",
    pdf:   "bg-red-500",
  };

  const statusTabs = [
    { label: "Chờ duyệt", value: "pending" },
    { label: "Đã duyệt",  value: "approved" },
    { label: "Từ chối",   value: "rejected" },
    { label: "Đã ẩn",     value: "hidden" },
    { label: "Tất cả",    value: "all" },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Tài liệu</h1>
          <p className="text-[12px] text-slate-500 mt-0.5">Quản lý nội dung học tập</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 focus:outline-none transition-all w-52"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-[#ffffff06] border border-[#ffffff08] rounded-xl">
            {statusTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => { setActiveStatus(s.value); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  activeStatus === s.value ? "bg-[#ffffff10] text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex gap-1 p-1 bg-[#ffffff06] border border-[#ffffff08] rounded-xl">
            {["Tất cả", "Tài liệu", "Video"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  activeTab === tab ? "bg-[#ffffff10] text-white" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111118] rounded-2xl border border-[#ffffff0a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#ffffff08]">
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tài liệu</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Người đăng</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Số liệu</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-4 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff06]">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest">Đang tải...</p>
                    </div>
                  </td>
                </tr>
              ) : allMaterials.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <p className="text-[13px] text-slate-500">Không có tài liệu nào</p>
                  </td>
                </tr>
              ) : (
                allMaterials.map((item) => {
                  const sc = statusConfig[item.status] || statusConfig.pending;
                  const tc = typeColor[item.materialType] || "bg-blue-500";
                  return (
                    <tr key={item._id} className="hover:bg-[#ffffff04] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tc}`}></span>
                            <span className="text-[13px] font-medium text-slate-200 line-clamp-1">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2 pl-3.5">
                            <span className="text-[11px] text-slate-600">{item.categoryId?.name || "Chưa phân loại"}</span>
                            <span className="text-slate-700">·</span>
                            <span className="text-[11px] text-slate-600">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#ffffff0a] border border-[#ffffff10] flex items-center justify-center text-[11px] text-cyan-400 font-semibold flex-shrink-0">
                            {item.uploaderId?.fullName?.charAt(0)}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-[12px] font-medium text-slate-300 truncate">{item.uploaderId?.fullName}</span>
                            <span className="text-[11px] text-slate-600 truncate">{item.uploaderId?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-[13px] font-semibold text-slate-300">{item.metrics?.viewCount || 0}</span>
                            <span className="text-[9px] text-slate-600 uppercase tracking-wide">Xem</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[13px] font-semibold text-slate-300">{item.metrics?.downloadCount || 0}</span>
                            <span className="text-[9px] text-slate-600 uppercase tracking-wide">Tải</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-1 text-[10px] font-medium rounded-lg border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ffffff08] text-slate-400 hover:bg-[#ffffff14] hover:text-slate-200 transition-all"
                            title="Xem trước">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </a>
                          <button onClick={() => handleOpenEdit(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ffffff08] text-slate-400 hover:bg-cyan-500/15 hover:text-cyan-400 transition-all"
                            title="Chỉnh sửa">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>

                          {item.status === "pending" && (
                            <>
                              <button onClick={() => handleUpdateStatus(item._id, "approved")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                                title="Phê duyệt">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              </button>
                              <button onClick={() => handleUpdateStatus(item._id, "rejected")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
                                title="Từ chối">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </>
                          )}

                          {item.status === "approved" && (
                            <button onClick={() => handleUpdateStatus(item._id, "hidden")}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ffffff08] text-slate-400 hover:bg-slate-600/40 hover:text-slate-200 transition-all"
                              title="Tạm ẩn">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                            </button>
                          )}

                          {(item.status === "hidden" || item.status === "rejected") && (
                            <button onClick={() => handleUpdateStatus(item._id, "approved")}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                              title="Khôi phục">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            </button>
                          )}

                          <button onClick={() => handleDelete(item._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all"
                            title="Xóa vĩnh viễn">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#ffffff08] flex items-center justify-between">
            <p className="text-[11px] text-slate-600">Trang {currentPage} / {totalPages}</p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchMaterials(currentPage - 1)}
                className="px-3.5 py-1.5 bg-[#ffffff08] border border-[#ffffff10] rounded-xl text-[11px] font-medium text-slate-400 hover:bg-[#ffffff14] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchMaterials(currentPage + 1)}
                className="px-3.5 py-1.5 bg-[#ffffff08] border border-[#ffffff10] rounded-xl text-[11px] font-medium text-slate-400 hover:bg-[#ffffff14] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111118] rounded-2xl w-full max-w-2xl border border-[#ffffff0f] shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#ffffff08] flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Chỉnh sửa tài liệu</h3>
                <p className="text-[11px] text-slate-600 mt-0.5">ID: {editingMaterial?._id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#ffffff08] text-slate-400 hover:bg-red-500/15 hover:text-red-400 transition-all">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateMaterial} className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Danh mục</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white focus:border-cyan-500/40 focus:outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Chuyên ngành</label>
                  <select
                    value={editForm.majorId}
                    onChange={(e) => setEditForm({ ...editForm, majorId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white focus:border-cyan-500/40 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Năm học</label>
                  <select
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white focus:border-cyan-500/40 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    {["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Khác"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white focus:border-cyan-500/40 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Mô tả</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#ffffff06] border border-[#ffffff0f] rounded-xl text-[13px] text-white placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 bg-[#ffffff08] border border-[#ffffff10] text-slate-400 rounded-xl text-[13px] font-medium hover:bg-[#ffffff14] hover:text-white transition-all">
                  Hủy bỏ
                </button>
                <button type="submit"
                  className="px-6 py-2.5 bg-cyan-500 text-[#09090f] rounded-xl text-[13px] font-semibold hover:bg-cyan-400 transition-all active:scale-95 shadow-lg shadow-cyan-500/20">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
