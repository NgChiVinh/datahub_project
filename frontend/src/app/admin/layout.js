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
    { name: "Dashboard", path: "/admin", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h2"/></svg> },
    { name: "Tài liệu", path: "/admin/material", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
    { name: "Người dùng", path: "/admin/user", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { name: "Báo cáo", path: "/admin/report", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-10h.01M9 16h.01"/></svg> },
    { name: "Danh mục", path: "/admin/category", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg> },
    { name: "Chuyên ngành", path: "/admin/major", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.019a11.952 11.952 0 00-6.824-2.962 12.083 12.083 0 01.665-6.479L12 14z"/><path d="M12 14v7"/></svg> },
    { name: "Thẻ (Tags)", path: "/admin/tag", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg> },
    { name: "Bình luận", path: "/admin/comment", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg> },
    { name: "Đánh giá", path: "/admin/review", icon: <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> },
  ];

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090f]">
        <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPage = menu.find(m => m.path === pathname);

  return (
    <div className="flex min-h-screen bg-[#09090f]">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-60" : "w-[68px]"
        } bg-[#0d0d14] border-r border-[#ffffff08] text-slate-400 transition-all duration-300 ease-in-out flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="h-14 px-4 flex items-center border-b border-[#ffffff08] flex-shrink-0">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <span className="text-[#09090f] text-xs font-black">D</span>
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-sm font-semibold text-white tracking-tight">DataHub</span>
                <span className="text-[10px] text-slate-600 mt-0.5">Admin Panel</span>
              </div>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                <span className="text-[#09090f] text-xs font-black">D</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {isSidebarOpen && (
            <p className="px-2.5 text-[10px] font-medium text-slate-600 uppercase tracking-widest mb-2 mt-1 select-none">
              Hệ thống
            </p>
          )}

          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 group relative ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-500 hover:bg-[#ffffff06] hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-0.5 h-5 bg-cyan-400 rounded-r-full"></div>
                )}
                <div className={`flex-shrink-0 transition-colors ${isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-300"}`}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <span className="font-medium truncate">{item.name}</span>
                )}
                {!isSidebarOpen && (
                  <div className="fixed left-[74px] px-3 py-1.5 bg-[#1c1c28] text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl border border-[#ffffff10]">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-[#ffffff08] flex-shrink-0 space-y-0.5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-2.5 py-2.5 w-full rounded-xl text-[13px] font-medium text-red-500/60 hover:text-red-400 hover:bg-red-500/08 transition-all duration-150 group"
          >
            <div className="flex-shrink-0">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </div>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 px-2.5 py-2 w-full rounded-xl text-[12px] text-slate-600 hover:text-slate-400 hover:bg-[#ffffff04] transition-all duration-150"
          >
            <div className="flex-shrink-0">
              {isSidebarOpen ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              )}
            </div>
            {isSidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-60" : "ml-[68px]"}`}>
        {/* Header */}
        <header className="h-14 bg-[#0d0d14]/80 backdrop-blur-xl border-b border-[#ffffff08] px-8 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              {currentPage?.name || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
              <span className="text-[12px] text-slate-400 font-medium">{user?.fullName}</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#ffffff0a] border border-[#ffffff10] flex items-center justify-center text-cyan-400 font-semibold text-sm flex-shrink-0">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
