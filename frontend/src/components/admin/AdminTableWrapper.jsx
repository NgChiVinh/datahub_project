"use client";
import { useRef, useEffect, useState } from "react";

export default function AdminTableWrapper({ children }) {
  const containerRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const check = () => setIsOverflowing(el.scrollWidth > el.clientWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {isOverflowing && (
        <div className="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Vuốt để xem thêm
        </div>
      )}
      <div ref={containerRef} className="overflow-x-auto">
        <div className="min-w-[600px]">
          {children}
        </div>
      </div>
    </div>
  );
}
