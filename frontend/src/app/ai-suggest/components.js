import Link from "next/link";

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
