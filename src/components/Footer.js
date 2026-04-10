import Link from "next/link";
import Image from "next/image"; // Đảm bảo bạn đã import Image

export default function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-slate-100 mt-auto">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {/* Logo đã được thay thế */}
              <div className="relative h-12 w-40 overflow-hidden">
                <Image 
                  src="/images/logo_datahub.png" // Thay đường dẫn tới file logo của bạn
                  alt="DataHub Logo" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>
            <p className="text-xs font-medium leading-loose text-slate-500">
              Nền tảng chia sẻ tri thức số hoá hàng đầu cho cộng đồng sinh viên Công nghệ thông tin Đại học Văn Lang.
            </p>
          </div>

          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Nền tảng</h5>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-600">
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Về chúng tôi</Link></li>
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Hướng dẫn</Link></li>
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">API Tài liệu</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Pháp lý</h5>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-600">
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Điều khoản sử dụng</Link></li>
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Bản quyền</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Hỗ trợ</h5>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-600">
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Liên hệ</Link></li>
              <li><Link href="#" className="hover:text-[#004d40] transition-colors">Trung tâm trợ giúp</Link></li>
              <li className="mt-2 flex items-center gap-4 text-slate-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-[#004d40]"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-[#004d40]"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
              </li>
            </ul>
          </div>
        </div>

        {/* Đã cập nhật năm bản quyền thành 2026 */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-slate-50 pt-8 md:flex-row">
          <p className="text-[10px] font-bold text-slate-400">© 2026 IT University DataHub. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Powered by VLU IT Faculty</span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span>Designed with Scholastic Fluidity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
