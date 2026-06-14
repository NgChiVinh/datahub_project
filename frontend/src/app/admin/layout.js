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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const menu = [
    { name: "Dashboard",    path: "/admin",          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h2" },
    { name: "Tài liệu",     path: "/admin/material", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Người dùng",   path: "/admin/user",     icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Báo cáo",      path: "/admin/report",   icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-10h.01M9 16h.01" },
    { name: "Danh mục",     path: "/admin/category", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
    { name: "Chuyên ngành", path: "/admin/major",    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0v7" },
    { name: "Thẻ (Tags)",   path: "/admin/tag",      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { name: "Bình luận",    path: "/admin/comment",  icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" },
    { name: "Đánh giá",     path: "/admin/review",   icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
  ];

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPage = menu.find(m => m.path === pathname);

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`bg-slate-900 text-slate-300 flex flex-col fixed h-full z-40 transition-all duration-300 ease-in-out w-64 ${!isSidebarOpen ? "md:w-[72px]" : ""} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center border-b border-white/5 flex-shrink-0">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
                <span className="text-white text-sm font-black">D</span>
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-sm font-bold text-white tracking-tight">DataHub</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Quản trị hệ thống</span>
              </div>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white text-sm font-black">D</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {isSidebarOpen && (
            <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 mt-1">
              Hệ thống
            </p>
          )}
          {menu.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 group relative ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full"></div>
                )}
                <div className={`flex-shrink-0 transition-colors ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-200"}`}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                {isSidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                {!isSidebarOpen && (
                  <div className="fixed left-[78px] px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-2xl border border-white/10">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/5 flex-shrink-0 space-y-0.5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-red-400/70 hover:text-red-300 hover:bg-red-400/10 transition-all duration-150"
          >
            <div className="flex-shrink-0">
              <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </div>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-[12px] text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all duration-150"
          >
            <div className="flex-shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                {isSidebarOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>}
              </svg>
            </div>
            {isSidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 ${isSidebarOpen ? "md:ml-64" : "md:ml-[72px]"}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em]">
              {currentPage?.name || "Admin"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[12px] font-semibold text-slate-600">{user?.fullName}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
