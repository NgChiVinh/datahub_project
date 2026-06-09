"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { SkeletonCard, LoadingView, UnauthenticatedView, EmptyStateView } from "./components";

const FETCH_LIMIT = 12;

const TYPE_MAP = {
  pdf:   { label: "PDF",   barColor: "#f43f5e", thumbFrom: "#fef2f2", thumbTo: "#fecaca", iconColor: "#f87171", badge: "bg-rose-50 text-rose-600 border border-rose-100" },
  docx:  { label: "WORD",  barColor: "#3b82f6", thumbFrom: "#eff6ff", thumbTo: "#bfdbfe", iconColor: "#60a5fa", badge: "bg-blue-50 text-blue-600 border border-blue-100" },
  pptx:  { label: "PPT",   barColor: "#f97316", thumbFrom: "#fff7ed", thumbTo: "#fed7aa", iconColor: "#fb923c", badge: "bg-orange-50 text-orange-600 border border-orange-100" },
  video: { label: "VIDEO", barColor: "#a855f7", thumbFrom: "#faf5ff", thumbTo: "#e9d5ff", iconColor: "#c084fc", badge: "bg-purple-50 text-purple-600 border border-purple-100" },
  zip:   { label: "ZIP",   barColor: "#f59e0b", thumbFrom: "#fffbeb", thumbTo: "#fde68a", iconColor: "#fbbf24", badge: "bg-amber-50 text-amber-600 border border-amber-100" },
};
const DEFAULT_TYPE = { label: "FILE", barColor: "#059669", thumbFrom: "#f0fdf4", thumbTo: "#bbf7d0", iconColor: "#34d399", badge: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
const getType = (t) => TYPE_MAP[t?.toLowerCase()] ?? DEFAULT_TYPE;

const getScoreBadge = (score, isColdStart) => {
  if (isColdStart) return { label: "Phổ biến", cls: "bg-white/90 text-slate-500" };
  if (score >= 80)  return { label: `${score}%`, cls: "bg-emerald-500 text-white" };
  if (score >= 60)  return { label: `${score}%`, cls: "bg-amber-500 text-white" };
  return { label: `${score}%`, cls: "bg-white/90 text-slate-500" };
};

const FILTERS = [
  { key: "all",   label: "Tất cả" },
  { key: "pdf",   label: "PDF" },
  { key: "docx",  label: "Word" },
  { key: "video", label: "Video" },
];

function FileIcon({ type, color }) {
  const t = type?.toLowerCase();
  if (t === "video") return (
    <svg width="32" height="32" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  );
  if (t === "zip") return (
    <svg width="32" height="32" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
  if (t === "pptx") return (
    <svg width="32" height="32" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
  return (
    <svg width="32" height="32" fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

export default function AISuggestPage() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems]               = useState([]);
  const [isColdStart, setIsColdStart]   = useState(false);
  const [basedOn, setBasedOn]           = useState(null);
  const [error, setError]               = useState(null);
  const [filterType, setFilterType]     = useState("all");
  const [refreshKey, setRefreshKey]     = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthed) { setIsLoading(false); return; }

      // Phân biệt lần đầu load vs. refresh
      const isFirstLoad = refreshKey === 0;
      if (isFirstLoad) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const res = await api.get(`/api/recommendations/for-you?limit=${FETCH_LIMIT}`);
        const json = res.data;
        if (json?.success) {
          setItems(Array.isArray(json.data) ? json.data : []);
          setIsColdStart(!!json.isColdStart);
          setBasedOn(json.basedOn || null);
          setError(null);
        } else {
          setError(json?.message || "Không lấy được gợi ý");
        }
      } catch {
        setError("Lỗi kết nối server");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    if (!authLoading) fetchRecommendations();
  }, [isAuthed, authLoading, refreshKey]);

  const filteredItems = filterType === "all"
    ? items
    : items.filter((d) => d.materialType?.toLowerCase() === filterType);

  const typeCounts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === "all" ? items.length : items.filter((d) => d.materialType?.toLowerCase() === f.key).length;
    return acc;
  }, {});

  const topTopics = Object.entries(
    items.reduce((acc, doc) => {
      const cat = doc.categoryId?.name;
      if (cat) acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b - a).slice(0, 4);

  // Chỉ hiện LoadingView lần đầu load
  if (authLoading || isLoading) return <LoadingView />;
  if (!isAuthed) return <UnauthenticatedView />;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">

      {/* ── HERO ── */}
      <section className="bg-slate-50/50 border-b border-slate-100">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            {/* Left: text */}
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">AI đang hoạt động</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <svg width="13" height="13" viewBox="0 0 28 28" fill="none">
                    <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="url(#ggrad)"/>
                    <defs>
                      <linearGradient id="ggrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4285F4"/><stop offset="1" stopColor="#0F9D58"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="text-[11px] font-semibold text-slate-500">Powered by <span className="text-slate-700">Gemini</span></span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08] mb-4">
                Tài liệu được chọn lọc{" "}
                <span className="text-emerald-500">riêng cho bạn</span>
              </h1>
              <p className="text-base text-slate-500 leading-relaxed max-w-lg">
                AI phân tích lịch sử tương tác và tìm kiếm những tài liệu tương đồng nhất với sở thích học tập của bạn.
              </p>
            </div>

            {/* Right: AI insight card */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phân tích AI</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isColdStart ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {isColdStart ? "Phổ biến" : "Cá nhân hóa"}
                  </span>
                </div>

                <div className="px-5 py-4">
                  {topTopics.length > 0 ? (
                    <>
                      <p className="text-[10px] font-semibold text-slate-400 mb-3">Chủ đề nổi bật</p>
                      <div className="space-y-3">
                        {topTopics.map(([topic, count], i) => (
                          <div key={topic}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-700 truncate max-w-[160px]">{topic}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">{count} tài liệu</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-400 rounded-full"
                                style={{
                                  width: `${Math.round((count / items.length) * 100)}%`,
                                  transition: `width 0.8s ease-out ${i * 120}ms`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">Chưa có dữ liệu chủ đề</p>
                  )}
                </div>

                <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Tổng gợi ý</p>
                    <p className="text-lg font-black text-slate-900 leading-tight">{items.length}</p>
                  </div>
                  {basedOn && (
                    <div className="text-right max-w-[160px]">
                      <p className="text-[10px] text-slate-400 mb-0.5">Dựa trên</p>
                      <p className="text-xs font-semibold text-emerald-600 line-clamp-2 leading-snug">{basedOn}</p>
                    </div>
                  )}
                </div>
              </div>

              {isColdStart && (
                <div className="mt-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Tương tác thêm với tài liệu để AI cá nhân hóa kết quả cho bạn.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  disabled={isRefreshing}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50 ${
                    filterType === f.key
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {f.label}
                  {typeCounts[f.key] > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      filterType === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {typeCounts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isRefreshing}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-60 group"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : "group-hover:rotate-180 transition-transform duration-500"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="container mx-auto max-w-7xl px-4 pt-8">
        {error ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Đã xảy ra lỗi</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyStateView />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm mb-4">Không có tài liệu nào thuộc định dạng đã chọn.</p>
            <button
              onClick={() => setFilterType("all")}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">
              {filteredItems.length} tài liệu được gợi ý
            </p>

            {/* Grid: skeleton khi refresh, card thật khi đã có data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isRefreshing
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredItems.map((doc, idx) => {
                    const type = getType(doc.materialType);
                    const rawScore = doc.score ? Math.round(doc.score * 100) : 85;
                    const score = getScoreBadge(rawScore, isColdStart);

                    return (
                      <Link
                        key={doc._id}
                        href={`/documents/${doc._id}`}
                        className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200/70 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                        style={{
                          animation: "fade-in-up 0.5s ease-out both",
                          animationDelay: `${idx * 70}ms`,
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative flex items-center justify-center h-[88px] overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${type.thumbFrom}, ${type.thumbTo})` }}
                        >
                          {/* Ghost type text — background watermark */}
                          <span
                            className="absolute font-black select-none pointer-events-none tracking-tighter"
                            style={{ fontSize: 56, color: type.barColor, opacity: 0.1, lineHeight: 1 }}
                          >
                            {type.label}
                          </span>

                          {/* Rank badge — vàng/bạc/đồng cho top 3 */}
                          <div className={`absolute top-3 left-3 w-[22px] h-[22px] rounded-lg flex items-center justify-center shadow-sm ${
                            idx === 0 ? "bg-amber-400" :
                            idx === 1 ? "bg-slate-400" :
                            idx === 2 ? "bg-amber-700/75" :
                            "bg-white/80 backdrop-blur-sm"
                          }`}>
                            <span className={`text-[10px] font-black ${idx < 3 ? "text-white" : "text-slate-500"}`}>
                              #{idx + 1}
                            </span>
                          </div>

                          <FileIcon type={doc.materialType} color={type.iconColor} />

                          <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-black shadow-sm ${score.cls}`}>
                            {score.label}
                          </div>

                          <div
                            className="absolute left-0 top-0 bottom-0 w-[3px]"
                            style={{ background: type.barColor }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${type.badge}`}>
                              {type.label}
                            </span>
                            {doc.categoryId?.name && (
                              <span className="text-[10px] font-semibold text-slate-400 truncate">
                                {doc.categoryId.name}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-600 transition-colors">
                            {doc.title}
                          </h3>

                          {doc.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mb-1">
                              {doc.description}
                            </p>
                          )}

                          <div className="flex-1" />

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {doc.uploaderId?.fullName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-700 truncate leading-none">
                                  {doc.uploaderId?.fullName || "Ẩn danh"}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  {doc.metrics?.viewCount || 0}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold group-hover:bg-emerald-600 transition-colors">
                              Xem
                              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
