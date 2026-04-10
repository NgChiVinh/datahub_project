import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <div className="relative h-16 w-48 overflow-hidden group-hover:scale-105 transition-transform">
            <Image 
              src="/images/logo_datahub.png" 
              alt="DataHub Logo" 
              fill
              className="object-contain object-left text-left"
              priority
            />
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="#" className="hover:text-primary transition-colors border-b-2 border-primary py-7 uppercase">Tài liệu</Link>
          <Link href="#" className="hover:text-primary transition-colors py-7 uppercase">Video bài học</Link>
          <Link href="#" className="hover:text-primary transition-colors py-7 uppercase">Bài tập</Link>
          <Link href="#" className="flex items-center gap-1 hover:text-primary transition-colors py-7 uppercase text-nowrap">

            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            AI GỢI Ý
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/40 active:scale-95 uppercase tracking-wider">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            Tải lên
          </button>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-emerald-100 bg-white p-0.5 shadow-md cursor-pointer hover:border-emerald-500 transition-all">
            <div className="h-full w-full rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-black">JD</div>
          </div>
        </div>
      </div>
    </header>
  );
}
