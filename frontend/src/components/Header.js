"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    setIsOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navLinks = [
    { name: "Tài liệu", href: "/documents" },
    { name: "Video bài học", href: "/videos" },
    { name: "Bài tập", href: "/assignments" },
  ];

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-20 items-center justify-center px-4">
          <Link href="/" className="flex items-center group transition-transform hover:scale-105 duration-300">
            <div className="relative h-12 w-40">
              <Image src="/images/logo_datahub.png" alt="DataHub Logo" fill className="object-contain" priority />
            </div>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        
        {/* Left Section: Mobile Toggle & Logo */}
        <div className={`flex items-center gap-4 transition-all duration-300 ${isSearchOpen ? "w-0 overflow-hidden opacity-0 lg:w-auto lg:opacity-100" : "w-auto opacity-100"}`}>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          
          <Link href="/" className="flex items-center group min-w-[120px]">
            <div className="relative h-10 w-32 lg:h-12 lg:w-40 transition-all duration-300 group-hover:scale-105">
              <Image src="/images/logo_datahub.png" alt="DataHub Logo" fill className="object-contain object-left" priority />
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation (Hidden when searching on desktop) OR Search Input */}
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
          {isSearchOpen ? (
            <div className="relative flex items-center animate-in fade-in zoom-in-95 duration-200">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm tài liệu, bài giảng..."
                className="w-full bg-slate-50 border-2 border-emerald-100 rounded-2xl px-5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          ) : (
            <nav className="hidden lg:flex items-center justify-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 hover:text-emerald-600 relative group/link ${
                    pathname === link.href ? "text-emerald-600" : "text-slate-600"
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover/link:w-full"}`}></span>
                </Link>
              ))}

              <Link 
                href="/ai-suggest"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-[11px] font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 group/ai"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 animate-pulse"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                AI Gợi ý
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {!isSearchOpen && (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          )}

          <Link 
            href="/upload" 
            className="hidden sm:flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-600 hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span className="hidden xl:inline">Tải lên</span>
          </Link>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="group flex items-center gap-2 rounded-2xl p-1 lg:pr-3 bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-100"
            >
              <div className="h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-md transition-transform group-hover:rotate-6">
                {session?.user ? (
                  <span className="text-[11px] font-black text-white">{getInitials(session.user.name || session.user.email)}</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`hidden md:block text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-4 w-60 origin-top-right rounded-[1.5rem] bg-white p-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] animate-in fade-in zoom-in-95 duration-200">
                {!session?.user ? (
                  <div className="flex flex-col gap-1 p-1">
                    <Link href="/login" className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">ĐĂNG NHẬP</Link>
                    <Link href="/register" className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-white bg-slate-900 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-slate-900/10">ĐĂNG KÝ</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 p-1">
                    <div className="px-4 py-3 bg-slate-50 rounded-xl mb-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tài khoản</p>
                      <p className="text-[13px] font-black text-slate-800 truncate uppercase tracking-tight">{session.user.name || session.user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all">TRANG CÁ NHÂN</Link>
                    <button onClick={() => signOut()} className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all w-full text-left">ĐĂNG XUẤT</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        {/* Drawer Content */}
        <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-10">
              <div className="relative h-10 w-32">
                <Image src="/images/logo_datahub.png" alt="DataHub Logo" fill className="object-contain object-left" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-2xl font-black uppercase tracking-tighter text-slate-800 hover:text-emerald-600 transition-colors">
                  {link.name}
                </Link>
              ))}
              <Link href="/ai-suggest" className="flex items-center justify-between w-full p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-emerald-700">
                <span className="text-xl font-black uppercase tracking-tight">AI Gợi ý</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse text-emerald-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </Link>
            </div>

            <div className="mt-auto">
              <Link href="/upload" className="flex items-center justify-center gap-3 w-full p-5 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Tải tài liệu lên
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
