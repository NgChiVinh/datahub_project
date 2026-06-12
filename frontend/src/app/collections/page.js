"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CollectionsDiscoveryPage() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchPublicCollections();
  }, []);

  const fetchPublicCollections = async () => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/collections`, {
        headers,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      const data = await res.json();
      setCollections(data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-32 pt-28 selection:bg-blue-200">
      {/* Premium Hero Section */}
      <section className="relative mb-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Outer glow container */}
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl shadow-blue-900/20 p-[1px]">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-20"></div>
            
            {/* Inner Content */}
            <div className="relative bg-slate-950/90 backdrop-blur-3xl rounded-[3rem] p-10 md:p-20 overflow-hidden">
              {/* Decorative Orbs */}
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-500/20 via-purple-500/20 to-transparent rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none mix-blend-screen"></div>
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none mix-blend-screen"></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

              <div className="max-w-3xl relative z-10">
                <nav className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-10 tracking-widest uppercase">
                  <Link
                    href="/"
                    className="hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Trang chủ
                  </Link>
                  <span className="text-slate-600">/</span>
                  <span className="text-blue-400">Bộ sưu tập cộng đồng</span>
                </nav>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-[1.05]">
                  Khám phá <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Tri thức vô tận
                  </span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl font-medium">
                  Tổng hợp những bộ sưu tập tài liệu chọn lọc và chất lượng nhất được đóng góp
                  bởi cộng đồng sinh viên. Tìm kiếm, lưu trữ và chia sẻ ngay hôm nay.
                </p>
                <div className="flex flex-wrap gap-5">
                  <Link
                    href="/profile?tab=collections"
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl text-sm font-bold overflow-hidden transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative">Bộ sưu tập của tôi</span>
                    <svg className="relative w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <a
                    href="#explore"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-sm font-bold hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    Khám phá ngay
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="explore" className="container mx-auto max-w-7xl px-4 sm:px-6 scroll-mt-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Bộ sưu tập <span className="text-blue-600">Nổi bật</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">Những chủ đề đang được quan tâm nhiều nhất</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm">
             <div className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
             </div>
             <span className="text-sm font-bold text-slate-700">
               {collections.length} <span className="text-slate-400 font-medium">Kết quả</span>
             </span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[2.5rem] h-[380px] animate-pulse border border-slate-100 shadow-sm"
              ></div>
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <Link
                href={`/collections/${col._id}`}
                key={col._id}
                className="group bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200/50 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 transition-all duration-500 relative flex flex-col overflow-hidden"
              >
                {/* Accent line on hover */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Decorative blob */}
                <div className="absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 flex items-center justify-center font-black text-xl shadow-inner border border-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    {col.userId?.fullName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                      Tạo bởi
                    </p>
                    <p className="text-sm font-black text-slate-800 tracking-tight">
                      {col.userId?.fullName}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-[1.3] tracking-tight">
                    {col.name}
                  </h3>

                  <p className="text-slate-500 text-sm md:text-base line-clamp-3 mb-10 flex-1 leading-relaxed font-medium">
                    {col.description ||
                      "Bộ sưu tập tài liệu học tập tổng hợp từ cộng đồng sinh viên."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2.5 bg-slate-50 group-hover:bg-blue-50 transition-colors px-4 py-2 rounded-xl">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-500">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-sm font-black text-slate-700 group-hover:text-blue-700 transition-colors">
                        {col.materialIds?.length || 0} <span className="font-semibold text-slate-500 group-hover:text-blue-500">Tài liệu</span>
                      </span>
                    </div>
                    <div
                      className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-blue-500/30"
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="transform group-hover:translate-x-1 transition-transform"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-500 shadow-inner">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Chưa có bộ sưu tập nào</h3>
              <p className="text-slate-500 font-medium text-lg">
                Hiện tại chưa có bộ sưu tập công khai nào trên hệ thống.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
