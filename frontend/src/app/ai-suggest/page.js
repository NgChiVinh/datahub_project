"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { SkeletonCard, LoadingView, UnauthenticatedView, EmptyStateView } from "./components";

const FETCH_LIMIT = 12;

const TYPE_MAP = {
  pdf:   { label: "PDF",   barColor: "#f43f5e", thumbA: "#fef2f2", thumbB: "#fce7f3", iconColor: "#f87171", badge: "bg-rose-50 text-rose-600 border border-rose-100" },
  docx:  { label: "WORD",  barColor: "#3b82f6", thumbA: "#eff6ff", thumbB: "#dbeafe", iconColor: "#60a5fa", badge: "bg-blue-50 text-blue-600 border border-blue-100" },
  pptx:  { label: "PPT",   barColor: "#f97316", thumbA: "#fff7ed", thumbB: "#ffedd5", iconColor: "#fb923c", badge: "bg-orange-50 text-orange-600 border border-orange-100" },
  video: { label: "VIDEO", barColor: "#a855f7", thumbA: "#faf5ff", thumbB: "#ede9fe", iconColor: "#c084fc", badge: "bg-purple-50 text-purple-600 border border-purple-100" },
  zip:   { label: "ZIP",   barColor: "#f59e0b", thumbA: "#fffbeb", thumbB: "#fef3c7", iconColor: "#fbbf24", badge: "bg-amber-50 text-amber-600 border border-amber-100" },
};
const DEFAULT_TYPE = { label: "FILE", barColor: "#059669", thumbA: "#f0fdf4", thumbB: "#dcfce7", iconColor: "#34d399", badge: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
const getType = (t) => TYPE_MAP[t?.toLowerCase()] ?? DEFAULT_TYPE;

const getScoreInfo = (score, isColdStart) => {
  // score là cosine similarity × 100, thường nằm trong khoảng 55-85.
  // Chuẩn hóa về [15, 100] để arc trực quan hơn.
  const pct = Math.min(100, Math.max(15, Math.round(((score - 55) / 30) * 85 + 15)));
  if (isColdStart) return { label: "Hot", pct: 65, color: "#94a3b8", bgCls: "bg-slate-100 text-slate-500" };
  if (score >= 78)  return { label: "Cao",  pct, color: "#10b981", bgCls: "bg-emerald-50 text-emerald-600" };
  if (score >= 65)  return { label: "Ổn",   pct, color: "#f59e0b", bgCls: "bg-amber-50 text-amber-600" };
  return               { label: "TB",   pct, color: "#94a3b8", bgCls: "bg-slate-100 text-slate-500" };
};

const FILTERS = [
  { key: "all",   label: "Tất cả" },
  { key: "pdf",   label: "PDF" },
  { key: "docx",  label: "Word" },
  { key: "pptx",  label: "PPT" },
  { key: "video", label: "Video" },
];

function FileIcon({ type, color, size = 40 }) {
  const t = type?.toLowerCase();
  if (t === "video") return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  );
  if (t === "zip") return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
  if (t === "pptx") return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
  return (
    <svg width={size} height={size} fill="none" stroke={color} viewBox="0 0 24 24" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

/* Circular score arc — SVG-based */
function ScoreArc({ pct, color, label }) {
  const r = 16, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease-out" }} />
      </svg>
      <span className="absolute text-[9px] font-black text-slate-700 leading-none">{label}</span>
    </div>
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

  if (authLoading || isLoading) return <LoadingView />;
  if (!isAuthed) return <UnauthenticatedView />;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">

      {/* ── HERO ── */}
      <section className="bg-slate-50/50 border-b border-slate-100 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">

            {/* Left */}
            <div className="max-w-2xl">
              <nav className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                <Link href="/" className="hover:text-emerald-500 transition-colors">Trang chủ</Link>
                <span>/</span>
                <span className="text-slate-600">Gợi ý từ AI</span>
              </nav>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">AI đang hoạt động</span>
                </div>

                {/* OpenAI badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700">
                    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.387 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.663zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.08.08 0 0 1 .032-.062l4.84-2.796a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
                  </svg>
                  <span className="text-[10px] font-semibold text-slate-500">
                    <span className="text-slate-700 font-bold">OpenAI</span> · text-embedding-3-small
                  </span>
                </div>

                {isColdStart && (
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                    Phổ biến — chưa cá nhân hóa
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Tài liệu <span className="text-emerald-500">riêng cho bạn</span>
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
                AI phân tích lịch sử tương tác và tìm kiếm những tài liệu tương đồng nhất với sở thích học tập của bạn.
              </p>

              {isColdStart && (
                <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 inline-block">
                  Tương tác thêm với tài liệu để AI cá nhân hóa kết quả.
                </p>
              )}
            </div>

            {/* Right: AI Insight card */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phân tích AI</p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${isColdStart ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {isColdStart ? "Phổ biến" : "Cá nhân hóa"}
                  </span>
                </div>

                <div className="px-5 py-4">
                  {topTopics.length > 0 ? (
                    <>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chủ đề nổi bật</p>
                      <div className="space-y-3">
                        {topTopics.map(([topic, count], i) => (
                          <div key={topic}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">{topic}</span>
                              <span className="text-[10px] text-slate-400 shrink-0 ml-2">{count} tài liệu</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${Math.round((count / items.length) * 100)}%`, transitionDelay: `${i * 120}ms` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-2">Chưa có dữ liệu chủ đề</p>
                  )}
                </div>

                <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-400">Tổng gợi ý</p>
                    <p className="text-xl font-black text-slate-900 leading-tight">{items.length}</p>
                  </div>
                  {basedOn && (
                    <div className="text-right max-w-[150px]">
                      <p className="text-[10px] text-slate-400 mb-0.5">Dựa trên</p>
                      <p className="text-[11px] font-semibold text-emerald-600 line-clamp-2 leading-snug">{basedOn}</p>
                    </div>
                  )}
                </div>
              </div>
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
                <button key={f.key} onClick={() => setFilterType(f.key)} disabled={isRefreshing}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                    filterType === f.key ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}>
                  {f.label}
                  {typeCounts[f.key] > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      filterType === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                    }`}>{typeCounts[f.key]}</span>
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setRefreshKey((k) => k + 1)} disabled={isRefreshing}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-60 group">
              <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${isRefreshing ? "animate-spin text-emerald-500" : "group-hover:rotate-180"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Đã xảy ra lỗi</h3>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button onClick={() => setRefreshKey((k) => k + 1)}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyStateView />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-sm mb-4">Không có tài liệu thuộc định dạng đã chọn.</p>
            <button onClick={() => setFilterType("all")}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
              Xem tất cả
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              {filteredItems.length} tài liệu được gợi ý
            </p>

            {isRefreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                {/* ── FEATURED TOP 2 ── */}
                {filteredItems.length >= 2 && filterType === "all" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    {filteredItems.slice(0, 2).map((doc, idx) => {
                      const type = getType(doc.materialType);
                      const rawScore = doc.score ? Math.round(doc.score * 100) : 85;
                      const scoreInfo = getScoreInfo(rawScore, isColdStart);
                      return (
                        <Link key={doc._id} href={`/documents/${doc._id}`}
                          className="group flex flex-col bg-white rounded-[1.5rem] border border-slate-100 hover:border-emerald-200/70 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                          style={{ animation: "fade-in-up 0.5s ease-out both", animationDelay: `${idx * 60}ms` }}>
                          {/* Tall featured thumbnail */}
                          <div className="relative flex items-center justify-center h-[180px] overflow-hidden"
                            style={{ background: `linear-gradient(135deg, ${type.thumbA}, ${type.thumbB})` }}>
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: type.barColor }} />
                            <span className="absolute font-black select-none pointer-events-none tracking-tighter"
                              style={{ fontSize: 90, color: type.barColor, opacity: 0.07, lineHeight: 1 }}>
                              {type.label}
                            </span>
                            <FileIcon type={doc.materialType} color={type.iconColor} size={52} />
                            {/* Rank crown */}
                            <div className={`absolute top-3 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-sm ${
                              idx === 0 ? "bg-amber-400 text-white" : "bg-slate-400 text-white"
                            }`}>
                              <span className="text-[10px] font-black">#{idx + 1}</span>
                              <span className="text-[9px] font-bold opacity-80">{idx === 0 ? "Top phù hợp" : "Top 2"}</span>
                            </div>
                            {/* Score arc */}
                            <div className="absolute top-3 right-3">
                              <ScoreArc pct={scoreInfo.pct} color={scoreInfo.color} label={scoreInfo.label} />
                            </div>
                            {/* Score bar */}
                            <div className="absolute bottom-0 left-1 right-0 h-[3px] bg-black/5">
                              <div className="h-full rounded-r-full transition-all duration-1000"
                                style={{ width: `${scoreInfo.pct}%`, background: scoreInfo.color, transitionDelay: `${idx * 100}ms` }} />
                            </div>
                          </div>
                          <div className="flex flex-col flex-1 p-5">
                            <div className="flex items-center gap-2 mb-2.5">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${type.badge}`}>{type.label}</span>
                              {doc.categoryId?.name && (
                                <span className="text-[10px] font-semibold text-slate-400 truncate">{doc.categoryId.name}</span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                            )}
                            <div className="flex-1" />
                            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                  {doc.uploaderId?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-slate-700 truncate leading-none">{doc.uploaderId?.fullName || "Ẩn danh"}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{doc.metrics?.viewCount || 0} lượt xem</p>
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
                    })}
                  </div>
                )}

                {/* ── REST 3-COL GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(filterType === "all" && filteredItems.length >= 2 ? filteredItems.slice(2) : filteredItems).map((doc, idx) => {
                    const realIdx = filterType === "all" ? idx + 2 : idx;
                    const type = getType(doc.materialType);
                    const rawScore = doc.score ? Math.round(doc.score * 100) : 85;
                    const scoreInfo = getScoreInfo(rawScore, isColdStart);
                    return (
                      <Link key={doc._id} href={`/documents/${doc._id}`}
                        className="group flex flex-col bg-white rounded-[1.5rem] border border-slate-100 hover:border-emerald-200/70 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        style={{ animation: "fade-in-up 0.5s ease-out both", animationDelay: `${(realIdx) * 55}ms` }}>
                        {/* Thumbnail */}
                        <div className="relative flex items-center justify-center h-[140px] overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${type.thumbA}, ${type.thumbB})` }}>
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: type.barColor }} />
                          <span className="absolute font-black select-none pointer-events-none tracking-tighter"
                            style={{ fontSize: 72, color: type.barColor, opacity: 0.08, lineHeight: 1 }}>
                            {type.label}
                          </span>
                          <FileIcon type={doc.materialType} color={type.iconColor} size={40} />
                          {/* Rank */}
                          <div className="absolute top-3 left-4 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm text-[10px] font-black bg-white/80 backdrop-blur-sm text-slate-500">
                            #{realIdx + 1}
                          </div>
                          {/* Score arc */}
                          <div className="absolute top-2.5 right-2.5">
                            <ScoreArc pct={scoreInfo.pct} color={scoreInfo.color} label={scoreInfo.label} />
                          </div>
                          {/* Score bar */}
                          <div className="absolute bottom-0 left-1 right-0 h-[3px] bg-black/5">
                            <div className="h-full rounded-r-full transition-all duration-1000"
                              style={{ width: `${scoreInfo.pct}%`, background: scoreInfo.color, transitionDelay: `${realIdx * 60}ms` }} />
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex flex-col flex-1 p-5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${type.badge}`}>{type.label}</span>
                            {doc.categoryId?.name && (
                              <span className="text-[10px] font-semibold text-slate-400 truncate">{doc.categoryId.name}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                            {doc.title}
                          </h3>
                          {doc.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                          )}
                          <div className="flex-1" />
                          <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-50">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                {doc.uploaderId?.fullName?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-700 truncate leading-none">{doc.uploaderId?.fullName || "Ẩn danh"}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{doc.metrics?.viewCount || 0} lượt xem</p>
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
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
