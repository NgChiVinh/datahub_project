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

      const res = await fetch(`${API_URL}/api/collections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    <div className="min-h-screen bg-[#fafbfc] font-sans text-slate-900 pb-20 pt-24">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden mb-16">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>

        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              <Link
                href="/"
                className="hover:text-emerald-500 transition-colors"
              >
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-emerald-500">Bộ sưu tập cộng đồng</span>
            </nav>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6 leading-none">
              Khám phá <span className="text-emerald-500">Hệ sinh thái</span>{" "}
              kiến thức
            </h1>
            <p className="text-slate-400 font-medium text-lg md:text-xl leading-relaxed mb-10">
              Tổng hợp những bộ sưu tập tài liệu chất lượng nhất được đóng góp
              bởi cộng đồng sinh viên VLU.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/profile"
                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-emerald-500/20"
              >
                Bộ sưu tập của tôi
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
            Bộ sưu tập <span className="text-emerald-500">Nổi bật</span>
          </h2>
          <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block"></div>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {collections.length} Kết quả
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[2.5rem] h-80 animate-pulse border border-slate-100"
              ></div>
            ))}
          </div>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <div
                key={col._id}
                className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-[4rem] group-hover:from-emerald-500/10 transition-colors"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    {col.userId?.fullName?.[0] || "U"}
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                      Tạo bởi
                    </p>
                    <p className="text-[11px] font-bold text-slate-700">
                      {col.userId?.fullName}
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {col.name}
                </h3>

                <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-8 flex-1 leading-relaxed">
                  {col.description ||
                    "Bộ sưu tập tài liệu học tập tổng hợp từ cộng đồng sinh viên."}
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50 mt-auto">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      {col.materialIds?.length || 0} Tài liệu
                    </span>
                  </div>
                  <Link
                    href={`/collections/${col._id}`}
                    className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:gap-3 transition-all"
                  >
                    Xem ngay
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <svg
                width="32"
                height="32"
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
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">
              Hiện chưa có bộ sưu tập công khai nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
