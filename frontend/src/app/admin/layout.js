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
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Tài liệu", path: "/admin/material", icon: "📄" },
    { name: "Người dùng", path: "/admin/user", icon: "👥" },
    { name: "Danh mục", path: "/admin/category", icon: "📁" },
    { name: "Chuyên ngành", path: "/admin/major", icon: "🎓" },
    { name: "Bình luận", path: "/admin/comment", icon: "💬" },
    { name: "Đánh giá", path: "/admin/review", icon: "⭐" },
  ];

  if (loading || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col fixed h-full z-30`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <Link href="/admin" className="text-xl font-black text-white tracking-tight italic uppercase">
              DATA<span className="text-primary">HUB</span>
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex justify-between items-center sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              {menu.find(m => m.path === pathname)?.name || "Hệ thống"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Quản trị hệ thống Data Hub</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-tighter">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-black shadow-sm group hover:border-primary transition-all">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
