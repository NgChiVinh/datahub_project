"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  const menu = [
    { name: "Dashboard", path: "/admin", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h2"/></svg> },
    { name: "Tài liệu", path: "/admin/material", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
    { name: "Người dùng", path: "/admin/user", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { name: "Báo cáo", path: "/admin/report", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-10h.01M9 16h.01"/></svg> },
    { name: "Danh mục", path: "/admin/category", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg> },
    { name: "Chuyên ngành", path: "/admin/major", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.01 0 0012 20.019a11.952 11.952 0 00-6.824-2.962 12.083 12.083 0 01.665-6.479L12 14z"/><path d="M12 14v7"/></svg> },
    { name: "Thẻ (Tags)", path: "/admin/tag", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg> },
    { name: "Bình luận", path: "/admin/comment", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg> },
    { name: "Đánh giá", path: "/admin/review", icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> },
  ];

  if (loading || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-72" : "w-24"
        } bg-[#0f172a] text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col fixed h-full z-40 shadow-2xl shadow-slate-900/50`}
      >
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl font-black italic">D</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black text-white tracking-tighter uppercase italic">DATA<span className="text-primary">HUB</span></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Management</span>
              </div>
            </Link>
          ) : (
             <div className="w-full flex justify-center">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-white text-xl font-black italic">D</span>
                </div>
             </div>
          )}
        </div>

        <nav className="flex-1 px-5 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {isSidebarOpen && <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 mt-6">Hệ thống</p>}
          
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative ${
                  isActive 
                    ? "bg-slate-800/60 text-white shadow-inner" 
                    : "hover:bg-slate-800/30 hover:text-white text-slate-300"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-in fade-in slide-in-from-left-2 duration-300"></div>
                )}
                <div className={`transition-all duration-300 ${isActive ? "text-primary scale-110" : "text-slate-400 group-hover:text-slate-200"}`}>
                  {item.icon}
                </div>
                {isSidebarOpen && <span className="tracking-tight">{item.name}</span>}
                {!isSidebarOpen && (
                  <div className="fixed left-24 px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl border border-slate-700/50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className={`p-4 rounded-3xl transition-all duration-500 ${isSidebarOpen ? "bg-slate-800/40 border border-slate-700/30 shadow-inner" : ""}`}>
            <button 
              onClick={logout}
              className={`flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-300 group`}
            >
              <div className="group-hover:rotate-180 transition-transform duration-500">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </div>
              {isSidebarOpen && <span>Đăng xuất</span>}
            </button>
            
            {isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="mt-4 w-full py-2 flex items-center justify-center text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                Thu gọn
              </button>
            )}
            {!isSidebarOpen && (
               <button 
                onClick={() => setSidebarOpen(true)}
                className="w-full flex justify-center py-2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? "ml-72" : "ml-24"}`}>
        {/* Header */}
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-10 flex justify-between items-center sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                {menu.find(m => m.path === pathname)?.name || "Hệ thống Quản trị"}
              </h1>
            </div>
            <p className="text-lg font-black text-slate-800 tracking-tight italic">Hệ thống <span className="text-primary italic">DATAHUB</span></p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-sm font-black text-slate-800 tracking-tight">{user?.fullName}</p>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Administrator</span>
              </div>
            </div>
            <div className="relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-primary font-black text-xl shadow-slate-200/50 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                {user?.fullName?.charAt(0)}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity -z-10"></div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
