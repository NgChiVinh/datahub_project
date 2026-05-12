"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleLogoClick = (e) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const menuItems = [
    {
      title: "Khám phá",
      links: [
        { name: "Tài liệu học tập", href: "/documents" },
        { name: "Video bài giảng", href: "/videos" },
        { name: "Đồ án sinh viên", href: "/projects" },
        { name: "Gợi ý từ AI", href: "/ai-suggest" },
      ],
    },
    {
      title: "Cộng đồng",
      links: [
        { name: "Bảng xếp hạng", href: "/leaderboard" },
        { name: "Đóng góp tài liệu", href: "/upload" },
        { name: "Câu hỏi thường gặp", href: "/faq" },
        { name: "Liên hệ hỗ trợ", href: "/contact" },
      ],
    },
    {
      title: "Chính sách",
      links: [
        { name: "Điều khoản sử dụng", href: "/terms" },
        { name: "Chính sách bảo mật", href: "/privacy" },
        { name: "Quy định bản quyền", href: "/copyright" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between gap-20 mb-24">
          
          {/* Brand Identity */}
          <div className="max-w-sm flex flex-col gap-8">
            <Link href="/" onClick={handleLogoClick} className="inline-block transition-transform hover:scale-105">
              <div className="relative h-14 w-52">
                <Image 
                  src="/images/logo_datahub.png" 
                  alt="DataHub Logo" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              Hệ thống quản lý và chia sẻ tri thức số hóa dành riêng cho sinh viên Khoa Công nghệ Thông tin - Trường Đại học Văn Lang.
            </p>
            <div className="flex items-center gap-5">
              <a href="#" className="group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </div>
              </a>
              <a href="#" className="group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </div>
              </a>
              <a href="#" className="group">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#22C55E] group-hover:text-white transition-all duration-300">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
              </a>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-12">
            {menuItems.map((item) => (
              <div key={item.title} className="flex flex-col gap-7">
                <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
                  {item.title}
                </h5>
                <ul className="flex flex-col gap-4">
                  {item.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors relative group w-fit"
                      >
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Info Bar & Copyright */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="relative h-12 w-32 transition-all duration-500">
              <Image 
                src="/images/logo_vlu.png" 
                alt="VLU Logo" 
                fill
                className="object-contain object-left"
              />
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khoa Công nghệ Thông tin</span>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">Văn Lang University</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © {currentYear} <span className="text-slate-900">DataHub Project</span>. All rights reserved.
            </p>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.1em]">
              Phát triển bởi Cộng đồng Sinh viên IT VLU
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
