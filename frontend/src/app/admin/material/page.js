"use client";

import { useState, useEffect } from "react";

export default function MaterialAdmin() {
  const [allMaterials, setAllMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("pending");

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/materials?status=all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setAllMaterials(data);
    } catch (err) {
      alert("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

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
        fetchMaterials();
      } else {
        alert("Cập nhật thất bại");
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
        fetchMaterials();
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const filtered = allMaterials.filter((asset) => {
    // Lọc theo Status
    if (activeStatus !== "all" && asset.status !== activeStatus) return false;

    // Lọc theo Type
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Tài liệu") return asset.materialType !== "video";
    if (activeTab === "Video") return asset.materialType === "video";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "rejected": return "bg-red-50 text-red-600 border-red-100";
      case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
            Quản lý <span className="text-primary">Tài liệu</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Tổng số: {allMaterials.length} | Đang hiển thị: {filtered.length}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            {[
              { label: "Chờ duyệt", value: "pending" },
              { label: "Đã duyệt", value: "approved" },
              { label: "Từ chối", value: "rejected" },
              { label: "Tất cả", value: "all" }
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setActiveStatus(s.value)}
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
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tiêu đề tài liệu</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Người đăng</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trạng thái</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Loại</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📭</span>
                      <p className="text-sm font-bold text-slate-400">Không tìm thấy tài liệu nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.title}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{item.description || "Không có mô tả"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {item.uploaderId?.fullName?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-600">{item.uploaderId?.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase rounded-lg border ${
                        item.materialType === "video" 
                          ? "bg-amber-50 text-amber-600 border-amber-100" 
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {item.materialType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {item.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(item._id, "approved")}
                            className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all active:scale-95"
                          >
                            Duyệt
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(item._id, "rejected")}
                            className="px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all active:scale-95"
                          >
                            Từ chối
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="px-4 py-2 bg-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                        >
                          Xóa
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
