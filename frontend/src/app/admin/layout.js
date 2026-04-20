"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      alert("Bạn không có quyền truy cập!");
      router.push("/");
    }
  }, [user, loading, router]);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Material", path: "/admin/material" },
    { name: "User", path: "/admin/user" },
    { name: "Category", path: "/admin/category" },
    { name: "Major", path: "/admin/major" },
    { name: "Comment", path: "/admin/comment" },
    { name: "Review", path: "/admin/review" },
  ];

  if (loading || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-lg font-bold mb-6">Admin Panel</h2>

        <div className="flex flex-col gap-2">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`text-left px-4 py-2 rounded-xl text-sm transition ${
                pathname === item.path ? "bg-emerald-500" : "hover:bg-slate-700"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow flex justify-between items-center">
          <h1 className="font-bold text-lg">Admin Dashboard</h1>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.fullName}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
