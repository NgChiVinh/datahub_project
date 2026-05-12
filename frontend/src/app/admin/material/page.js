"use client";

import { useState, useEffect } from "react";

export default function MaterialAdmin() {
  const [allMaterials, setAllMaterials] = useState([]);
  const [majors, setMajors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  // State cho Modal Chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    majorId: "",
    categoryId: "",
    academicYear: "",
    status: ""
  });

  const fetchMaterials = async (page = 1) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Sử dụng API lọc từ backend để lấy đúng dữ liệu phân trang
      const statusParam = activeStatus === "all" ? "all" : activeStatus;
      const res = await fetch(
        `http://localhost:5000/api/materials?status=${statusParam}&page=${page}&limit=${limit}&sortBy=latest`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (data && data.materials) {
        setAllMaterials(data.materials);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(data.pagination?.currentPage || 1);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu materials");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMajors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/majors");
      const data = await res.json();
      if (Array.isArray(data)) setMajors(data);
    } catch (err) {
      console.error("Lỗi tải majors");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error("Lỗi tải categories");
    }
  };

  useEffect(() => {
    fetchMaterials(1);
    fetchMajors();
    fetchCategories();
  }, [activeStatus]);

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setEditForm({
      title: material.title || "",
      description: material.description || "",
      majorId: material.majorId?._id || material.majorId || "",
      categoryId: material.categoryId?._id || material.categoryId || "",
      academicYear: material.academicYear || "Khác",
      status: material.status || "pending"
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/materials/${editingMaterial._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchMaterials(currentPage);
        alert("Cập nhật thông tin tài liệu thành công!");
      } else {
        alert("Cập nhật thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchMaterials(currentPage);
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchMaterials(currentPage);
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const filtered = allMaterials.filter((asset) => {
    // Lọc theo Search Term
    if (searchTerm && !asset.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Lọc theo Loại (Type)
    if (activeTab === "Tài liệu") {
      if (asset.materialType === "video") return false;
    } else if (activeTab === "Video") {
      if (asset.materialType !== "video") return false;
    }

    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "hidden": return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "approved": return "Đã duyệt";
      case "rejected": return "Từ chối";
      case "pending": return "Chờ duyệt";
      case "hidden": return "Đã ẩn";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Quản lý <span className="text-primary">Tài liệu</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Hệ thống quản lý nội dung học tập
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search Bar */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all w-64"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>

          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            {[
              { label: "Chờ duyệt", value: "pending" },
              { label: "Đã duyệt", value: "approved" },
              { label: "Từ chối", value: "rejected" },
              { label: "Đã ẩn", value: "hidden" },
              { label: "Tất cả", value: "all" }
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setActiveStatus(s.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeStatus === s.value 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Type Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            {["Tất cả", "Tài liệu", "Video"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Thông tin tài liệu</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Người đăng</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Số liệu</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trạng thái</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📭</span>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không có dữ liệu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            item.materialType === "video" ? "bg-amber-400" : 
                            item.materialType === "pdf" ? "bg-red-400" : "bg-blue-400"
                          }`}></span>
                          <span className="text-sm font-bold text-slate-700 line-clamp-1">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {item.categoryId?.name || "Chưa phân loại"}
                          </span>
                          <span className="text-[9px] font-black text-slate-300">•</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 uppercase">
                          {item.uploaderId?.fullName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{item.uploaderId?.fullName}</span>
                          <span className="text-[9px] font-bold text-slate-400">{item.uploaderId?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-slate-700">{item.metrics?.viewCount || 0}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Xem</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[11px] font-black text-slate-700">{item.metrics?.downloadCount || 0}</span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tải</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border shadow-sm ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Nút Xem trước - Luôn hiện */}
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                          title="Xem trước tài liệu"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </a>

                        {/* Nút Sửa */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="w-9 h-9 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all active:scale-90"
                          title="Chỉnh sửa thông tin"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        
                        {/* Nhóm nút Duyệt (Dành cho bài Pending) */}
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item._id, "approved")}
                              className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                              title="Phê duyệt"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item._id, "rejected")}
                              className="w-9 h-9 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                              title="Từ chối phê duyệt"
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          </>
                        )}

                        {/* Nút Ẩn (Dành cho bài đã Approved) */}
                        {item.status === "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(item._id, "hidden")}
                            className="w-9 h-9 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-600 hover:text-white transition-all active:scale-90"
                            title="Tạm ẩn tài liệu"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                          </button>
                        )}

                        {/* Nút Khôi phục/Hiện lại (Dành cho bài Hidden hoặc Rejected) */}
                        {(item.status === "hidden" || item.status === "rejected") && (
                          <button
                            onClick={() => handleUpdateStatus(item._id, "approved")}
                            className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                            title="Khôi phục / Duyệt lại"
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-90"
                          title="Xóa vĩnh viễn"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchMaterials(currentPage - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Trước
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchMaterials(currentPage + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Chỉnh sửa tài liệu</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {editingMaterial?._id}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateMaterial} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề tài liệu</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục</label>
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Chuyên ngành</label>
                  <select
                    value={editForm.majorId}
                    onChange={(e) => setEditForm({ ...editForm, majorId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {majors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Năm học</label>
                  <select
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                  >
                    {["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Khác"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả tài liệu</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:outline-none focus:border-primary/30 transition-all text-slate-800 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
                >
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
