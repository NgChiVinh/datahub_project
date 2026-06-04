import Link from "next/link";

export const SkeletonCard = () => (
  <div className="bg-white/50 backdrop-blur-xl rounded-[32px] border border-white/60 p-5 h-full animate-pulse shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
    <div className="aspect-[16/9] w-full bg-slate-200/50 rounded-[24px] mb-6"></div>
    <div className="flex flex-col flex-1">
      <div className="h-6 w-5/6 bg-slate-200/50 rounded-lg mb-4"></div>
      
      {/* Skeleton AI Explanation */}
      <div className="mb-6 p-4 rounded-[20px] bg-slate-100/50 border border-slate-100">
        <div className="h-3 w-32 bg-slate-200/60 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-slate-200/60 rounded-full"></div>
            <div className="h-4 w-48 bg-slate-200/60 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-4 h-4 bg-slate-200/60 rounded-full"></div>
            <div className="h-4 w-32 bg-slate-200/60 rounded"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[12px] bg-slate-200/50"></div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-slate-200/50 rounded"></div>
            <div className="h-2 w-12 bg-slate-200/50 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-28 bg-slate-200/50 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export const LoadingView = () => (
  <div className="min-h-screen bg-slate-50 font-sans">
    {/* Skeleton Hero & Stats */}
    <div className="pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 animate-pulse flex flex-col items-center">
        <div className="h-10 w-48 bg-white/60 rounded-full mb-8 shadow-sm"></div>
        <div className="h-14 md:h-16 w-3/4 max-w-3xl bg-slate-200/60 rounded-2xl mb-6"></div>
        <div className="h-6 w-full max-w-2xl bg-slate-200/50 rounded-xl mb-10"></div>
        
        {/* Stats Skeleton */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
           {[1,2,3,4].map(i => (
             <div key={i} className="bg-white/40 rounded-[24px] p-5 h-32 border border-white/50"></div>
           ))}
        </div>
      </div>
    </div>
    
    <div className="container mx-auto px-4 pb-24 relative z-10 -mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  </div>
);

export const UnauthenticatedView = () => (
  <div className="min-h-[90vh] flex items-center justify-center p-6 bg-slate-50 font-sans">
    <div className="relative max-w-lg w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-emerald-300/30 via-cyan-300/20 to-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 p-12 rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-br from-emerald-100 to-cyan-50 text-emerald-500 mb-8 border border-white shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Mở khóa gợi ý thông minh</h2>
        <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
          Đăng nhập để AI phân tích hoạt động học tập và đề xuất những tài liệu chất lượng cao, phù hợp nhất với bạn.
        </p>
        <Link href="/login" className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[20px] text-lg font-bold shadow-xl shadow-slate-900/10 hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all duration-300 active:scale-95 group">
          Bắt đầu phân tích
          <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </Link>
      </div>
    </div>
  </div>
);

export const EmptyStateView = () => (
  <div className="text-center py-24 bg-white/60 backdrop-blur-xl rounded-[40px] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8 border border-slate-200/60">
       <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
       AI ĐANG HỌC HỎI
    </div>
    
    <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[28px] flex items-center justify-center mx-auto mb-8 text-slate-400 shadow-inner border border-white">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    </div>
    
    <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">AI cần thêm dữ liệu để đưa ra gợi ý</h3>
    <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto">
      Hãy khám phá thêm tài liệu trong thư viện để hệ thống có thể hiểu rõ hơn về sở thích và mục tiêu học tập của bạn.
    </p>
    
    <Link href="/documents" className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white rounded-[16px] font-bold shadow-lg shadow-slate-900/10 hover:bg-emerald-500 hover:shadow-emerald-500/20 transition-all duration-300">
      Khám phá thư viện
    </Link>
  </div>
);
