**Bảng 2.2: Tổng hợp công nghệ sử dụng trong hệ thống DataHub**

| Tên công nghệ | Vai trò trong hệ thống | Đánh giá thực hiện |
|---|---|---|
| Next.js 16 | Framework frontend, xử lý routing, SSR và CSR | Hoạt động ổn định, hỗ trợ App Router giúp tổ chức code rõ ràng |
| React 19 | Xây dựng giao diện theo mô hình component tái sử dụng | Đáp ứng tốt yêu cầu giao diện động, quản lý state hiệu quả |
| Tailwind CSS 4 | Thiết kế giao diện responsive theo hướng utility-first | Rút ngắn thời gian phát triển UI, dễ tùy chỉnh theo thiết kế |
| Node.js 18 | Môi trường chạy JavaScript phía máy chủ | Xử lý đồng thời nhiều request hiệu quả nhờ mô hình bất đồng bộ |
| Express.js | Xây dựng toàn bộ REST API, xác thực, phân quyền | Linh hoạt, dễ mở rộng, tích hợp middleware thuận tiện |
| MongoDB Atlas | Lưu trữ toàn bộ dữ liệu hệ thống trên đám mây | Vận hành ổn định, không cần quản lý hạ tầng cơ sở dữ liệu |
| MongoDB Atlas Vector Search | Lập chỉ mục và truy vấn vector embedding (cosine similarity) | Thực hiện tìm kiếm ngữ nghĩa và gợi ý cá nhân hóa chính xác |
| Mongoose | Định nghĩa schema, validation và truy vấn MongoDB | Giúp quản lý cấu trúc dữ liệu nhất quán trong toàn dự án |
| OpenAI text-embedding-3-small | Chuyển đổi văn bản tài liệu thành vector 1.536 chiều | Chi phí thấp, chất lượng embedding đủ đáp ứng yêu cầu gợi ý |
| OpenAI GPT-4o-mini | Mở rộng truy vấn, hỏi đáp tài liệu, tạo quiz trắc nghiệm | Phản hồi nhanh, độ chính xác cao với chi phí tối ưu |
| Cloudflare R2 | Lưu trữ tệp tài liệu PDF, Word, PowerPoint | Ổn định, không tính phí băng thông đọc, tiết kiệm chi phí |
| Cloudinary | Lưu trữ video bài giảng và ảnh thumbnail | Hỗ trợ tốt đa định dạng media, CDN giúp tải nhanh |
| JWT | Xác thực người dùng stateless giữa frontend và backend | Hoạt động chính xác, phù hợp kiến trúc frontend-backend tách biệt |
| bcrypt | Mã hóa mật khẩu người dùng một chiều với salt ngẫu nhiên | Đảm bảo bảo mật mật khẩu, chống tấn công brute-force |
| Docker | Container hóa backend, đảm bảo môi trường nhất quán | Triển khai nhanh, dễ rebuild khi có code mới |
| PM2 | Quản lý tiến trình frontend Next.js trên production | Tự động khởi động lại khi lỗi, duy trì uptime ổn định |
| Nginx | Reverse proxy, điều hướng /api/ và /, xử lý SSL | Hoạt động ổn định, cấu hình đơn giản cho kiến trúc hai service |
| Let's Encrypt | Cấp chứng chỉ SSL/TLS miễn phí, tự gia hạn 90 ngày | Cấu hình một lần, tự động gia hạn không cần can thiệp thủ công |
| Git / GitHub | Quản lý phiên bản mã nguồn, nguồn code triển khai lên VPS | Hỗ trợ tốt quy trình phát triển và redeploy qua git pull |
| VPS Ubuntu 22.04 | Máy chủ vật lý chạy toàn bộ hệ thống production | Đủ tài nguyên cho giai đoạn phát triển và demo sản phẩm |
