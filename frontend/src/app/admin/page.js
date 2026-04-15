"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [pendingAssets, setPendingAssets] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tất cả");
  const router = useRouter();

  // 1. Kiểm tra quyền Admin ngay khi vào trang
  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      alert("Bạn không có quyền truy cập trang quản trị!");
      router.push("/");
    }
  }, [user, authLoading, router]);

  // 2. Lấy danh sách tài liệu từ Backend
  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      console.log("Admin Dashboard: Fetching materials with status=all...");
      const res = await fetch("http://localhost:5000/api/materials?status=all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Không thể lấy dữ liệu");
      }

      const data = await res.json();
      console.log("Admin Dashboard: Received materials:", data.length);
      
      if (Array.isArray(data)) {
        setAllMaterials(data);
        // Lọc những cái đang chờ duyệt (pending)
        const pending = data.filter(item => item.status === "pending");
        console.log("Admin Dashboard: Pending assets found:", pending.length);
        setPendingAssets(pending);
      } else {
        console.error("Dữ liệu trả về không phải là mảng:", data);
        setAllMaterials([]);
        setPendingAssets([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách tài liệu:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // 3. Xử lý Duyệt / Từ chối
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/materials/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        alert(newStatus === "approved" ? "Đã duyệt tài liệu!" : "Đã từ chối tài liệu!");
        fetchMaterials(); // Tải lại danh sách
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Không thể kết nối đến server!");
    }
  };

  // Lọc theo tab
  const filteredAssets = pendingAssets.filter(asset => {
    if (activeTab === "Tất cả") return true;
    if (activeTab === "Tài liệu") return ["pdf", "docx", "pptx", "zip", "other"].includes(asset.materialType);
    if (activeTab === "Video") return asset.materialType === "video";
    if (activeTab === "Bài tập") return asset.categoryId?.name?.toLowerCase().includes("bài tập");
    return true;
  });

  if (authLoading || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="bg-slate-900 text-white py-4 px-8 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black">A</div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em]">DataHub Management Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase text-slate-400">Chào Admin, {user?.fullName}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold border border-slate-600">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Đang chờ duyệt", value: pendingAssets.length, color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Tổng tài liệu", value: allMaterials.length, color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Đã duyệt", value: allMaterials.filter(m => m.status === 'approved').length, color: "text-blue-500", bg: "bg-blue-50" }
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-8 rounded-[2rem] border border-white shadow-sm transition-transform hover:scale-[1.02]`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                Danh sách chờ kiểm duyệt
              </h2>
              
              <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                {["Tất cả", "Tài liệu", "Video"].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nội dung</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Người đăng</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Loại</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">Đang tải dữ liệu...</td></tr>
                  ) : filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="text-slate-200 mb-4" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Không còn nội dung chờ duyệt.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">{asset.title}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {asset.categoryId?.name} • {asset.academicYear}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{asset.uploaderId?.fullName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{asset.uploaderId?.email}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                             asset.materialType === 'video' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                           }`}>
                             {asset.materialType}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a 
                              href={asset.fileUrl} 
                              target="_blank" 
                              className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-2xl transition-all"
                              title="Xem tài liệu"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                            </a>
                            <button 
                              onClick={() => handleUpdateStatus(asset._id, "rejected")}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all" 
                              title="Từ chối"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(asset._id, "approved")}
                              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Duyệt bài
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
      </div>
    </ProtectedRoute>
  );
}
