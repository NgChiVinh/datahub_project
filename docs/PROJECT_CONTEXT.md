# CONTEXT DỰ ÁN DATAHUB — DÙNG CHO VIẾT BÁO CÁO

> File này tóm tắt toàn bộ thông tin kỹ thuật và nội dung đã viết của dự án DataHub.
> Mục đích: đưa vào chat AI để hỗ trợ viết báo cáo khóa luận tốt nghiệp.

---

## 1. THÔNG TIN CHUNG

- **Tên đề tài:** Thiết kế và xây dựng website chia sẻ tài liệu học tập
- **Sinh viên thực hiện:** Nguyễn Chí Vinh
- **Trường:** Đại học Văn Lang — Khoa Công nghệ thông tin
- **Domain production:** https://vlu.datahub.id.vn
- **GitHub:** https://github.com/NgChiVinh/datahub_project

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Vector Search | MongoDB Atlas Vector Search |
| AI Embedding | OpenAI text-embedding-3-small (1536 chiều) |
| AI Generation | OpenAI GPT-4o-mini |
| Lưu trữ file | Cloudflare R2 (PDF, Word, PPTX) |
| Lưu trữ media | Cloudinary (video, ảnh thumbnail) |
| Xác thực | JWT (JSON Web Token) + bcrypt |
| Rate Limiting | express-rate-limit |
| Triển khai | VPS Ubuntu 22.04, Docker, PM2, Nginx, Let's Encrypt |

---

## 3. KIẾN TRÚC HỆ THỐNG

```
User Browser
    │
    ▼
Nginx (HTTPS: vlu.datahub.id.vn)
    ├── /       → Frontend Next.js (PM2, port 3500)
    └── /api/   → Backend Express (Docker, port 5000)
                        │
                        ├── MongoDB Atlas (dữ liệu + Vector Search)
                        ├── OpenAI API (embedding + generation)
                        ├── Cloudflare R2 (file tài liệu)
                        └── Cloudinary (video, ảnh)
```

- Kiến trúc: **Client-Server, RESTful API**
- Frontend và Backend tách biệt hoàn toàn
- Backend chạy Docker container, Frontend chạy PM2

---

## 4. CHỨC NĂNG CHÍNH CỦA HỆ THỐNG

### 4.1 Chức năng người dùng
- Đăng ký, đăng nhập, quản lý tài khoản, đổi mật khẩu
- Đăng tải tài liệu (PDF, Word, PPTX, Video) kèm thông tin, danh mục, tag
- Tìm kiếm tài liệu theo từ khóa hoặc ngữ nghĩa
- Xem chi tiết tài liệu, tải xuống, xem trực tuyến
- Bình luận, đánh giá (review + rating) tài liệu
- Lưu tài liệu vào bộ sưu tập cá nhân
- Thích (like) tài liệu
- Nhận gợi ý tài liệu cá nhân hóa

### 4.2 Chức năng quản trị viên (Admin)
- Duyệt / từ chối tài liệu trước khi công khai
- Quản lý người dùng, tài liệu, danh mục, ngành học, tag
- Xử lý báo cáo vi phạm
- Xem thống kê hệ thống

### 4.3 Chức năng AI (6 tính năng)
1. **Gợi ý cá nhân hóa (For-You Feed)** — `/ai-suggest`
2. **Tìm kiếm ngữ nghĩa (Semantic Search)** — thanh tìm kiếm
3. **Tài liệu tương tự (Similar Documents)** — sidebar trang chi tiết
4. **Nhãn lý do gợi ý** — hiển thị tại sao tài liệu được gợi ý
5. **Hỏi đáp AI theo nội dung tài liệu** — trang chi tiết tài liệu
6. **Tạo quiz trắc nghiệm tự động** — trang chi tiết tài liệu

---

## 5. CHI TIẾT KỸ THUẬT AI

### 5.1 Pipeline Embedding
1. Upload file → trích xuất text (pdf-parse, mammoth, officeparser)
2. Xây chuỗi: `title + description + contentText.slice(0, 5000)`
3. Gọi `text-embedding-3-small` → vector 1536 chiều
4. Lưu vào `materials.embedding` trong MongoDB Atlas

### 5.2 Gợi ý cá nhân hóa — Thuật toán Weighted Average Embedding
```
1. Lấy tối đa 20 tương tác gần nhất của user
2. Tính profile vector = Σ(embedding_i × weight_i) / Σweight_i
3. MongoDB Atlas $vectorSearch với profile vector
4. Loại trừ tài liệu đã tương tác
5. Trả về top N (score >= 0.55)
```

**Bảng trọng số:**
| Hành động | Weight |
|---|---|
| Xem (view) | 1 |
| Tải xuống (download) | 3 |
| Lưu bộ sưu tập | 4 |
| Thích (like) | 5 |

**Cold-start:** Chưa có lịch sử → trả tài liệu phổ biến nhất

### 5.3 Tìm kiếm ngữ nghĩa — Hybrid Filter
```
Query → expandQuery() [GPT-4o-mini mở rộng từ khóa]
      → generateEmbedding() [text-embedding-3-small]
      → $vectorSearch (numCandidates=100)
      → Hybrid Filter:
          score >= 0.75 → giữ luôn
          0.65 ≤ score < 0.75 → giữ nếu có từ khóa trùng
          score < 0.65 → loại bỏ
      → Kết quả (tối đa 12 tài liệu)
```

### 5.4 Chat với tài liệu — Context Injection
- Toàn bộ `contentText.slice(0, 8000)` nhúng vào system prompt
- Gửi kèm 6 messages gần nhất (Sliding Window History)
- Model: GPT-4o-mini, max_tokens=500, temperature=0.3
- **Không dùng RAG** vì 93% tài liệu là slide/lab report ngắn

### 5.5 Quiz tự động — Prompt Engineering
- GPT-4o-mini sinh 5 câu trắc nghiệm từ nội dung tài liệu
- Output JSON chuẩn: question, options[4], answer(index)
- Chấm điểm hoàn toàn phía client

### 5.6 Nhãn lý do gợi ý — Rule-based
| Điều kiện | Hiển thị |
|---|---|
| Cold-start | "Phổ biến trong cộng đồng" |
| Có basedOn + category | "Tương tự [tên doc] · [category]" |
| Chỉ có basedOn | "Dựa trên [tên doc]" |
| Fallback | "Phù hợp với sở thích của bạn" |

### 5.7 Rate Limiting
- Chat, Quiz: **5 request/phút/IP**
- Search AI, For-You: **20 request/phút/IP**

### 5.8 Ước tính chi phí OpenAI
| Tính năng | Chi phí/lần | $3 dùng được |
|---|---|---|
| Chat | ~$0.0005 | ~6.000 tin nhắn |
| Quiz | ~$0.0008 | ~3.750 lần |
| Semantic Search | ~$0.000002 | ~1.500.000 lần |

---

## 6. CƠ SỞ DỮ LIỆU

**Collections MongoDB:**
- `users` — thông tin tài khoản
- `materials` — tài liệu (có trường `embedding[]`, `contentText`)
- `categories` — danh mục/môn học (51 categories, 5 parent)
- `majors` — ngành học (5 ngành)
- `tags` — tag tài liệu
- `interactions` — lịch sử tương tác (view/download/like/save)
- `comments` — bình luận
- `reviews` — đánh giá + rating
- `reports` — báo cáo vi phạm
- `collections` — bộ sưu tập cá nhân

**Vector Search Index:** `vector_index` trên field `embedding`, cosine similarity

---

## 7. TRIỂN KHAI (DEPLOYMENT)

- **VPS:** Atlantic.net, Ubuntu 22.04, server `dieplai-dev`, IP `103.47.226.171`
- **Domain:** tenten.vn, DNS A record `vlu → 103.47.226.171`
- **Backend:** Docker container `datahub-backend`, port 5000
- **Frontend:** PM2 `datahub-frontend`, port 3500 (port 3000 bị chiếm)
- **Nginx:** Reverse proxy, `/api/` → port 5000, `/` → port 3500
- **SSL:** Let's Encrypt (Certbot), tự gia hạn 90 ngày

---

## 8. BẢO MẬT

- **JWT** — xác thực stateless, token lưu localStorage
- **bcrypt** — mã hóa mật khẩu (salt rounds = 10)
- **Phân quyền** — user / admin, middleware kiểm tra role
- **Kiểm duyệt** — tài liệu cần admin duyệt trước khi công khai
- **Rate Limiting** — giới hạn request/phút cho AI endpoints
- **Secrets** — lưu trong `.env` trên server, gitignored, không commit

---

## 9. ĐỊNH DẠNG FILE HỖ TRỢ

| Định dạng | Lưu trữ | Trích xuất text |
|---|---|---|
| PDF | Cloudflare R2 | pdf-parse ✅ |
| Word (.docx) | Cloudflare R2 | mammoth ✅ |
| PowerPoint (.pptx) | Cloudflare R2 | officeparser ⚠️ (chưa đầy đủ) |
| Video (mp4, mov...) | Cloudinary | Không (dùng title+desc) |

---

## 10. PHƯƠNG PHÁP NGHIÊN CỨU AI

- **Content-based Filtering** (không dùng Collaborative Filtering — quy mô user còn nhỏ)
- **Cosine Similarity** đo độ tương đồng vector
- **Weighted Average Embedding** tính profile vector người dùng
- **Query Expansion** mở rộng từ khóa tìm kiếm bằng GPT
- **Hybrid Filter** kết hợp vector score + keyword overlap
- **Context Injection** thay vì RAG truyền thống
- **Sliding Window History** giữ ngữ cảnh hội thoại

---

## 11. CÁC HỆ THỐNG THAM KHẢO

| Hệ thống | Ưu điểm | Hạn chế |
|---|---|---|
| Studocu | Kho tài liệu lớn, tìm kiếm tốt | Không phù hợp nội dung VN, phí cao |
| Tailieu.vn | Nội dung tiếng Việt phong phú | Tìm kiếm từ khóa, không có AI |
| Semantic Scholar | Tìm kiếm ngữ nghĩa mạnh | Chỉ dành cho nghiên cứu khoa học |
| Notion AI | Hỗ trợ AI tìm kiếm và khai thác | Không chuyên biệt cho tài liệu học tập |

**Khoảng trống:** Chưa có nền tảng nào vừa phục vụ sinh viên Việt Nam, vừa có AI hỗ trợ học tập, vừa có kiểm duyệt nội dung.

---

## 12. NỘI DUNG BÁO CÁO ĐÃ VIẾT

### Tóm tắt
Hệ thống DataHub tích hợp 6 tính năng AI, xây dựng trên MongoDB + Express.js + Next.js + Node.js theo kiến trúc RESTful API. AI dùng text-embedding-3-small và GPT-4o-mini của OpenAI kết hợp MongoDB Atlas Vector Search.

### Từ khóa
Chia sẻ tài liệu học tập; Hệ thống quản lý học liệu; Trí tuệ nhân tạo; Tìm kiếm ngữ nghĩa; Hệ gợi ý; Vector Search.

### Giả thuyết nghiên cứu
1. Có thể xây dựng hệ thống web chia sẻ tài liệu ổn định với MERN stack + RESTful API + tích hợp AI.
2. MongoDB Atlas Vector Search + OpenAI có thể nâng cao chất lượng tìm kiếm ngữ nghĩa và gợi ý so với tìm kiếm truyền thống.
3. Bảo mật JWT + phân quyền + kiểm duyệt giúp bảo vệ dữ liệu và hạn chế nội dung không phù hợp.

### Phạm vi KHÔNG nghiên cứu
- Mua bán tài liệu, thanh toán trực tuyến
- Quản lý điểm và lớp học
- Theo dõi tiến độ học tập
- Xử lý bản quyền và chống đạo văn chuyên sâu
- Xác thực đa yếu tố (MFA)
- Mã hóa dữ liệu đầu cuối

---

## 13. TÌNH TRẠNG DỮ LIỆU HIỆN TẠI (tính đến 15/06/2026)

- 107/115 tài liệu phi video (93%) có embedding và contentText
- 51 categories, 5 ngành học, 18 tags
- Hệ thống đang chạy production tại vlu.datahub.id.vn
