import Link from "next/link";

/* ── Blob Loader (SVG metaball) ── */
export const BlobLoader = ({ size = 1 }) => (
  <div style={{ transform: `scale(${size})`, display: "inline-block", lineHeight: 0, position: "relative" }}>
    {/* Ambient glow behind the blob */}
    <div style={{
      position: "absolute", inset: -20, borderRadius: "50%",
      background: "radial-gradient(circle, #22d3ee28 0%, #1d4ed815 45%, transparent 70%)",
      animation: "loader-pulse 2.4s ease-in-out infinite",
      pointerEvents: "none",
    }} />
    <div style={{
      filter: "drop-shadow(0 0 18px #22d3ee88) drop-shadow(0 16px 36px #1d4ed866)",
      animation: "loader-colorize 6s ease-in-out infinite",
    }}>
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix in="blur" type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
          <radialGradient id="bgrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%"   stopColor="#a5f3fc" />
            <stop offset="45%"  stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#1e40af" />
          </radialGradient>
        </defs>
        <g filter="url(#goo)">
          {/* Central — anchor blob */}
          <circle cx="60" cy="60" r="22" fill="url(#bgrad)" />
          {/* Orbit A — large, fast CW, tight */}
          <circle cx="60" cy="27" r="15" fill="url(#bgrad)"
            style={{ transformOrigin: "60px 60px", animation: "loader-rotation 2s linear infinite" }} />
          {/* Orbit B — medium, slow CCW, wide */}
          <circle cx="95" cy="60" r="12" fill="url(#bgrad)"
            style={{ transformOrigin: "60px 60px", animation: "loader-rotation 3s linear infinite reverse", animationDelay: "-0.8s" }} />
          {/* Orbit C — medium-small, medium CW, starts bottom-left */}
          <circle cx="35" cy="88" r="10" fill="url(#bgrad)"
            style={{ transformOrigin: "60px 60px", animation: "loader-rotation 3.8s linear infinite", animationDelay: "-1.4s" }} />
          {/* Orbit D — small, fast CCW, close in */}
          <circle cx="60" cy="38" r="8" fill="url(#bgrad)"
            style={{ transformOrigin: "60px 60px", animation: "loader-rotation 1.6s linear infinite reverse", animationDelay: "-0.5s" }} />
          {/* Orbit E — tiny, medium CW, starts upper-right */}
          <circle cx="88" cy="35" r="6" fill="url(#bgrad)"
            style={{ transformOrigin: "60px 60px", animation: "loader-rotation 2.4s linear infinite", animationDelay: "-1.0s" }} />
        </g>
      </svg>
    </div>
  </div>
);


export const SkeletonCard = () => (
  <div className="flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    {/* Thumbnail skeleton — khớp h-[88px] */}
    <div className="relative h-[88px] bg-gradient-to-br from-slate-100 to-slate-150 flex items-center justify-center overflow-hidden">
      <div className="absolute w-16 h-16 rounded-full bg-slate-200/60" />
      <div className="absolute top-3 left-3 w-[22px] h-[22px] rounded-lg bg-white/70" />
      <div className="w-8 h-8 rounded-full bg-slate-200" />
      <div className="absolute top-3 right-3 w-10 h-5 rounded-lg bg-white/70" />
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-200" />
    </div>

    {/* Content skeleton */}
    <div className="flex flex-col flex-1 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="h-5 w-10 bg-slate-100 rounded-md" />
        <div className="h-4 w-20 bg-slate-50 rounded" />
      </div>
      <div className="h-4 w-5/6 bg-slate-100 rounded mb-1.5" />
      <div className="h-4 w-2/3 bg-slate-100 rounded mb-1.5" />
      <div className="h-3 w-1/2 bg-slate-50 rounded" />
      <div className="flex-1 min-h-[16px]" />
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-200" />
          <div>
            <div className="h-3 w-20 bg-slate-100 rounded mb-1" />
            <div className="h-2.5 w-10 bg-slate-50 rounded" />
          </div>
        </div>
        <div className="h-7 w-14 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

export const AIIntroView = () => {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center relative overflow-hidden"    
      style={{ animation: "fade-in 0.3s ease-out" }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Ghost "AI" text */}
      <div className="absolute right-8 bottom-10 pointer-events-none select-none hidden lg:block" aria-hidden="true">
        <span className="font-black leading-none" style={{ fontSize: 200, color: "#059669", opacity: 0.04, fontWeight: 900 }}>AI</span>
      </div>

      {/* Center */}
      <div className="relative flex flex-col items-center text-center px-6">

        {/* Blob loader + decorative rings */}
        <div className="relative flex items-center justify-center mb-10">
          {/* Outer slow-expand ring */}
          <div className="absolute w-64 h-64 rounded-full border border-cyan-400/20 animate-ping"
            style={{ animationDuration: "3.5s" }} />
          {/* Middle ring */}
          <div className="absolute w-48 h-48 rounded-full border border-blue-400/25 animate-ping"
            style={{ animationDuration: "3.5s", animationDelay: "1.2s" }} />
          {/* Inner glow disc */}
          <div className="absolute w-44 h-44 rounded-full"
            style={{ background: "radial-gradient(circle, #22d3ee10 0%, transparent 70%)", animation: "loader-pulse 2.4s ease-in-out infinite" }} />
          <BlobLoader size={1.5} />
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1.5"
          style={{ animation: "fade-in-up 0.4s ease-out 0.2s both" }}>
          AI đang chuẩn bị cho bạn
        </h2>
        <p className="text-sm text-slate-400 mb-8"
          style={{ animation: "fade-in-up 0.4s ease-out 0.35s both" }}>
          Phân tích sở thích và tìm tài liệu phù hợp nhất
        </p>

        {/* Steps */}
        <div className="space-y-3 text-left w-64">
          {[
            { label: "Kết nối AI engine", delay: 450 },
            { label: "Đọc lịch sử tương tác", delay: 850 },
            { label: "Tìm kiếm tài liệu phù hợp", delay: 1250 },
          ].map(({ label, delay }) => (
            <div key={label} className="flex items-center gap-2.5"
              style={{ animation: "fade-in-up 0.35s ease-out both", animationDelay: `${delay}ms` }}>
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{ animation: "bounce-slow 1s ease-in-out infinite", animationDelay: `${delay}ms` }} />
              </div>
              <span className="text-sm text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AIRefreshingView = () => (
  <div className="flex flex-col items-center justify-center py-16 min-h-[280px]"
    style={{ animation: "fade-in 0.3s ease-out both" }}>
    <div className="relative flex items-center justify-center mb-5">
      <div className="absolute w-36 h-36 rounded-full border border-cyan-400/20 animate-ping"
        style={{ animationDuration: "3s" }} />
      <BlobLoader size={0.85} />
    </div>
    <p className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
      AI đang tìm kiếm<AiTypingDots />
    </p>
    <p className="text-xs text-slate-400">Phân tích sở thích học tập của bạn</p>
  </div>
);

function AiTypingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 ml-1 mb-0.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-emerald-500 inline-block"
          style={{ animation: "bounce-slow 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />  
      ))}
    </span>
  );
}

export const LoadingView = () => (
  <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
    {/* Hero skeleton — 2 cột khớp layout thật */}
    <section className="bg-slate-50/40 border-b border-slate-100">
      <div className="container mx-auto max-w-7xl px-4 py-12 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          {/* Left */}
          <div className="max-w-2xl flex-1">
            <div className="flex gap-2.5 mb-5">
              <div className="h-7 w-40 bg-slate-100 rounded-full" />
              <div className="h-7 w-36 bg-slate-100 rounded-full" />
            </div>
            <div className="h-12 w-4/5 bg-slate-100 rounded-2xl mb-3" />
            <div className="h-12 w-3/5 bg-slate-100 rounded-2xl mb-5" />
            <div className="h-4 w-full max-w-md bg-slate-50 rounded-xl mb-2" />
            <div className="h-4 w-3/4 max-w-sm bg-slate-50 rounded-xl" />
          </div>
          {/* Right — AI insight card skeleton */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-50">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-6 w-20 bg-slate-100 rounded-lg" />
              </div>
              <div className="px-5 py-4 space-y-3">
                {[80, 60, 45, 70].map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <div className="h-3 bg-slate-100 rounded" style={{ width: `${w}%` }} />
                      <div className="h-3 w-12 bg-slate-50 rounded" />
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4 flex justify-between pt-3 border-t border-slate-50">
                <div>
                  <div className="h-2.5 w-16 bg-slate-50 rounded mb-1.5" />
                  <div className="h-6 w-8 bg-slate-100 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Filter bar skeleton */}
    <div className="border-b border-slate-100 px-4 py-3">
      <div className="container mx-auto max-w-7xl flex gap-2 animate-pulse">
        {[72, 56, 60, 64].map((w, i) => (
          <div key={i} style={{ width: w }} className="h-9 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Grid skeleton */}
    <div className="container mx-auto max-w-7xl px-4 pt-8">
      <div className="h-3 w-36 bg-slate-100 rounded mb-5 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  </div>
);

export const UnauthenticatedView = () => (
  <div className="min-h-[90vh] flex items-center justify-center bg-white p-6 font-sans">
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-8">
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>

      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">
        Gợi ý cá nhân hóa
      </span>

      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
        Đăng nhập để AI<br />
        <span className="text-emerald-500">gợi ý cho bạn</span>
      </h2>

      <p className="text-slate-500 leading-relaxed mb-8">
        AI sẽ phân tích lịch sử tương tác của bạn và tìm kiếm những tài liệu phù hợp nhất thông qua vector similarity search.
      </p>

      <div className="space-y-3 mb-8 text-left">
        {[
          "Phân tích sở thích học tập từ lịch sử",
          "Tìm tài liệu liên quan qua AI embedding",
          "Cập nhật gợi ý theo thời gian thực",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
            <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {item}
          </div>
        ))}
      </div>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 group"
      >
        Đăng nhập ngay
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  </div>
);

export const EmptyStateView = () => (
  <div className="text-center py-24 max-w-lg mx-auto">
    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
      <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>

    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4 block">
      AI đang học hỏi
    </span>

    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">
      Chưa đủ dữ liệu để gợi ý
    </h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-8">
      Hãy khám phá và tương tác với các tài liệu trong thư viện. AI sẽ học từ hành vi của bạn để đưa ra gợi ý cá nhân hóa.
    </p>

    <Link
      href="/documents"
      className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 group"
    >
      Khám phá thư viện
      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  </div>
);
