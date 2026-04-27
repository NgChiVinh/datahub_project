"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ... (existing effects)

  // Live Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:5000/api/materials?search=${searchQuery}&status=approved&limit=5`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = async (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Log search query
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/search-logs", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "" 
          },
          body: JSON.stringify({ searchQuery: searchQuery.trim() }),
        });
      } catch (err) {
        console.error("Lỗi log search:", err);
      }
      
      setIsSearchOpen(false);
      router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = async (material) => {
    // Log click
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/search-logs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "" 
        },
        body: JSON.stringify({ 
          searchQuery: searchQuery,
          clickedMaterialId: material._id 
        }),
      });
    } catch (err) {
      console.error("Lỗi log click:", err);
    }

    setIsSearchOpen(false);
    setSearchQuery("");
    if (material.materialType === "video") {
      router.push(`/videos/${material._id}`);
    } else {
      router.push(`/documents/${material._id}`);
    }
  };
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchInputRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch Notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
      } catch (error) {
        console.error("Lỗi lấy thông báo:", error);
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000); // Check mỗi phút
    return () => clearInterval(interval);
  }, [user]);

  const markNotifsAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/notifications/mark-as-read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsNotifOpen(false);
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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    if (isOpen || isNotifOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isNotifOpen]);

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { name: "Tài liệu", href: "/documents" },
    { name: "Video bài học", href: "/videos" },
    { name: "Bài tập", href: "/assignments" },
  ];

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto flex h-20 items-center justify-center px-4">
          <Link
            href="/"
            className="flex items-center group transition-transform hover:scale-105 duration-300"
          >
            <div className="relative h-12 w-40">
              <Image
                src="/images/logo_datahub.png"
                alt="DataHub Logo"
                fill
                className="object-contain"
                priority
              />
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
        <div
          className={`flex items-center gap-4 transition-all duration-300 ${isSearchOpen ? "w-0 overflow-hidden opacity-0 lg:w-auto lg:opacity-100" : "w-auto opacity-100"}`}
        >
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>

          <Link href="/" className="flex items-center group min-w-[120px]">
            <div className="relative h-10 w-32 lg:h-12 lg:w-40 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/images/logo_datahub.png"
                alt="DataHub Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation */}
        <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
          {isSearchOpen ? (
            <div className="relative flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-full flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Tìm kiếm tài liệu, bài giảng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  className="w-full bg-slate-50 border-2 border-emerald-100 rounded-2xl px-5 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                />
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setSuggestions([]);
                  }}
                  className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {(isSearching || suggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-[110] overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin inline-block w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full mr-2"></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tìm...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {suggestions.map((item) => (
                        <button
                          key={item._id}
                          onClick={() => handleSuggestionClick(item)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.materialType === "video" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                          }`}>
                            {item.materialType === "video" ? (
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            ) : (
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 truncate uppercase">{item.title}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                              {item.materialType} • {item.uploaderId?.fullName}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          const e = { key: "Enter" };
                          handleSearchSubmit(e);
                        }}
                        className="p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Xem tất cả kết quả cho "{searchQuery}"</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <nav className="hidden lg:flex items-center justify-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 hover:text-emerald-600 relative group/link ${
                    pathname === link.href
                      ? "text-emerald-600"
                      : "text-slate-600"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-500 transition-all duration-300 ${pathname === link.href ? "w-full" : "w-0 group-hover/link:w-full"}`}
                  ></span>
                </Link>
              ))}

              <Link
                href="/ai-suggest"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-[11px] font-black uppercase tracking-widest text-emerald-700 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 group/ai"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500 animate-pulse"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          )}

          {/* Notifications Bell */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markNotifsAsRead();
                }}
                className={`p-2.5 rounded-xl transition-all duration-300 relative ${isNotifOpen ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-80 origin-top-right rounded-[1.5rem] bg-white p-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">
                      Thông báo
                    </h3>
                    <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase">
                      Mới nhất
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <Link
                          key={n._id}
                          href={n.link || "#"}
                          className={`flex gap-3 p-4 hover:bg-slate-50 transition-all rounded-xl border-b border-slate-50 last:border-0 ${!n.isRead ? "bg-emerald-50/30" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                              n.type === "material_approved"
                                ? "bg-emerald-100 text-emerald-600"
                                : n.type === "material_rejected"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <p
                              className={`text-[11px] leading-tight ${!n.isRead ? "font-black text-slate-900" : "font-bold text-slate-600"}`}
                            >
                              {n.message}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold">
                              {new Date(n.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase">
                        Không có thông báo nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            href="/upload"
            className="hidden sm:flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-600 hover:scale-105 active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span className="hidden xl:inline">Tải lên</span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="group flex items-center gap-2 rounded-2xl p-1 lg:pr-3 bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-100"
            >
              <div className="h-9 w-9 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-md transition-transform group-hover:rotate-6">
                {user ? (
                  <span className="text-[11px] font-black text-white">
                    {getInitials(user.fullName || user.email)}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`hidden md:block text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-4 w-60 origin-top-right rounded-[1.5rem] bg-white p-2 shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-[100] animate-in fade-in zoom-in-95 duration-200">
                {!user ? (
                  <div className="flex flex-col gap-1 p-1">
                    <Link
                      href="/login"
                      className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                    >
                      ĐĂNG NHẬP
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-white bg-slate-900 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-slate-900/10"
                    >
                      ĐĂNG KÝ
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 p-1">
                    <div className="px-4 py-3 bg-slate-50 rounded-xl mb-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {user.role === "admin"
                          ? "Quản trị viên"
                          : "Tài khoản sinh viên"}
                      </p>
                      <p className="text-[13px] font-black text-slate-800 truncate uppercase tracking-tight">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100/50 mb-1"
                      >
                        TRANG QUẢN TRỊ
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                    >
                      TRANG CÁ NHÂN
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-4 px-4 py-3.5 text-xs font-black text-red-500 hover:bg-red-50 rounded-xl transition-all w-full text-left"
                    >
                      ĐĂNG XUẤT
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-10">
              <div className="relative h-10 w-32">
                <Image
                  src="/images/logo_datahub.png"
                  alt="DataHub Logo"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-2xl font-black uppercase tracking-tighter text-slate-800 hover:text-emerald-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/ai-suggest"
                className="flex items-center justify-between w-full p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-emerald-700"
              >
                <span className="text-xl font-black uppercase tracking-tight">
                  AI Gợi ý
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse text-emerald-500"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
              </Link>
            </div>

            <div className="mt-auto">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full p-5 rounded-[1.5rem] bg-red-500 text-white font-black uppercase tracking-widest shadow-xl"
                >
                  ĐĂNG XUẤT
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-3 w-full p-5 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl"
                >
                  ĐĂNG NHẬP
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
