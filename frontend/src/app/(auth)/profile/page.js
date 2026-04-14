"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("uploads");
  const [userDocs, setUserDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  // Fetch tài liệu của chính user này
  useEffect(() => {
    const fetchUserDocs = async () => {
      if (!user?._id) return;
      try {
        setIsLoadingDocs(true);
        const res = await fetch(`http://localhost:5000/api/materials?uploaderId=${user._id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setUserDocs(data);
        }
      } catch (error) {
        console.error("Lỗi lấy tài liệu cá nhân:", error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchUserDocs();
  }, [user]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] px-4">
        <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"></path></svg>
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase italic">Bạn chưa đăng nhập</h2>
           <p className="text-slate-500 font-medium leading-relaxed">Vui lòng đăng nhập để xem thông tin cá nhân và quản lý tài liệu của bạn.</p>
           <Link href="/login" className="block w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs">
             Đăng nhập ngay
           </Link>
        </div>
      </div>
    );
  }

  // Tính toán chỉ số tổng quát
  const totalViews = userDocs.reduce((sum, doc) => sum + (doc.metrics?.viewCount || 0), 0);
  const totalDownloads = userDocs.reduce((sum, doc) => sum + (doc.metrics?.downloadCount || 0), 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
        <div className="container mx-auto max-w-7xl px-4 lg:px-12 py-10">
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)] overflow-hidden mb-12 relative group">
            <div className="h-48 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="px-10 md:px-16 pb-12 relative">
                <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 mb-8">
                  <div className="relative group/avatar">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] bg-white p-2 shadow-2xl relative z-10 overflow-hidden">
                        <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-5xl font-black shadow-inner relative">
                            {user.avatar ? (
                              <Image src={user.avatar} alt="avatar" fill className="object-cover" />
                            ) : (
                              user.fullName?.[0] || "U"
                            )}
                        </div>
                      </div>
                      <button className="absolute bottom-2 right-2 z-20 w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-xl hover:bg-emerald-500 transition-all active:scale-90">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </button>
                  </div>
                  
                  <div className="flex-1 space-y-2 pb-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{user.fullName || "Người dùng DataHub"}</h1>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">Verified Student</div>
                      </div>
                      <p className="text-slate-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                        {user.email}
                      </p>
                  </div>
                  
                  <div className="flex gap-4 pb-2">
                      <button className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all border border-slate-100 shadow-sm">
                        Chỉnh sửa profile
                      </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-50">
                  {[
                    { label: "Tài liệu đã đăng", value: userDocs.length, color: "text-emerald-500" },
                    { label: "Tổng lượt xem", value: totalViews.toLocaleString(), color: "text-blue-500" },
                    { label: "Lượt tải về", value: totalDownloads.toLocaleString(), color: "text-amber-500" },
                    { label: "Ngành học", value: user.major || "Chưa cập nhật", color: "text-purple-500" }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-xl font-black ${stat.color} tracking-tight truncate`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'uploads', label: 'Tài liệu của tôi', icon: 'file' },
                { id: 'favorites', label: 'Đã lưu', icon: 'bookmark' },
                { id: 'collections', label: 'Bộ sưu tập', icon: 'folder' },
                { id: 'settings', label: 'Cài đặt tài khoản', icon: 'settings' }
            ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 whitespace-nowrap border-2 ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20' 
                      : 'bg-white border-transparent text-slate-400 hover:border-slate-100 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'uploads' && (
                <div className="space-y-6">
                  {isLoadingDocs ? (
                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải tài liệu của bạn...</div>
                  ) : userDocs.length > 0 ? userDocs.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all group flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6 flex-1">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:rotate-6 ${doc.materialType === 'video' ? 'bg-slate-900 text-white' : 'bg-red-50 text-red-500'}`}>
                              <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          </div>
                          <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight line-clamp-1">{doc.title}</h3>
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${doc.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                                    {doc.status === 'approved' ? 'Đã duyệt' : 'Đang chờ'}
                                </span>
                              </div>
                              <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                <span>{doc.materialType}</span>
                                <span className="flex items-center gap-1.5"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2.5"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2"/></svg> {doc.metrics?.viewCount} views</span>
                                <span>Đăng ngày {new Date(doc.createdAt).toLocaleDateString("vi-VN")}</span>
                              </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Link href={`/documents/${doc._id}`} className="px-6 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                              Xem chi tiết
                          </Link>
                          <button className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-slate-400 transition-all border border-transparent hover:border-red-100">
                              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bạn chưa đóng góp tài liệu nào...</p>
                        <Link href="/upload" className="inline-block mt-6 text-primary font-black text-[10px] uppercase tracking-widest hover:underline">Tải lên ngay</Link>
                    </div>
                  )}
                </div>
            )}

            {activeTab !== 'uploads' && (
                <div className="py-32 text-center rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-100">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                      <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Tính năng đang phát triển...</h3>
                </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
