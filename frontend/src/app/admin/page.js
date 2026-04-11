"use client";
import { useState } from "react";
import Image from "next/image";

const MOCK_PENDING_ASSETS = [
  {
    id: 1,
    type: "Tài liệu",
    title: "Slide bài giảng Hệ điều hành - Chương 3",
    author: "Nguyễn Văn An",
    date: "12/04/2026 14:30",
    size: "2.4 MB",
    category: "Cơ sở ngành",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"
  },
  {
    id: 2,
    type: "Video",
    title: "Hướng dẫn cài đặt môi trường Docker trên Ubuntu",
    author: "Trần Minh Tâm",
    date: "12/04/2026 15:10",
    duration: "12:45",
    category: "Kỹ thuật phần mềm",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b193ef5?w=400&q=80"
  },
  {
    id: 3,
    type: "Bài tập",
    title: "Giải đề thi mẫu cấu trúc dữ liệu - Học kỳ 1",
    author: "Lê Thị Hồng",
    date: "12/04/2026 16:05",
    category: "Cấu trúc dữ liệu",
    thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80"
  }
];

export default function AdminDashboard() {
  const [pendingAssets, setPendingAssets] = useState(MOCK_PENDING_ASSETS);
  const [activeTab, setActiveTab] = useState("Tất cả");

  const handleApprove = (id) => {
    // Demo: Xóa khỏi danh sách chờ sau khi duyệt
    setPendingAssets(pendingAssets.filter(asset => asset.id !== id));
    alert("Đã duyệt nội dung thành công!");
  };

  const handleReject = (id) => {
    setPendingAssets(pendingAssets.filter(asset => asset.id !== id));
    alert("Đã từ chối và xóa nội dung rác.");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sidebar giả lập hoặc Top Navigation cho Admin */}
      <div className="bg-slate-900 text-white py-4 px-8 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black">A</div>
           <h1 className="text-sm font-black uppercase tracking-[0.2em]">DataHub Management Center</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-bold uppercase text-slate-400">Chào Admin, Bo</span>
           <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-12 py-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Chờ duyệt", value: pendingAssets.length, color: "text-orange-500", bg: "bg-orange-50" },
            { label: "Tổng tài liệu", value: "1,240", color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Báo cáo xấu", value: "0", color: "text-red-500", bg: "bg-red-50" }
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} p-8 rounded-[2rem] border border-white shadow-sm`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Management Area */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
              Danh sách chờ kiểm duyệt
            </h2>
            
            <div className="flex bg-slate-50 p-1.5 rounded-2xl">
              {["Tất cả", "Tài liệu", "Video", "Bài tập"].map(tab => (
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
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Ngày gửi</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingAssets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center">
                          <svg className="text-slate-200 mb-4" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tuyệt vời! Không còn nội dung chờ duyệt.</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  pendingAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border-2 border-white">
                            <Image src={asset.thumbnail} alt="" fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{asset.title}</p>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest">{asset.type} • {asset.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-tight">{asset.author}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Sinh viên</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-medium text-slate-500">{asset.date}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleReject(asset.id)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all" 
                            title="Từ chối"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                          <button 
                            onClick={() => handleApprove(asset.id)}
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
  );
}
