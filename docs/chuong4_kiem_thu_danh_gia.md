# CHƯƠNG 4 — KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG AI

> Nội dung bổ sung cho Chương 4 khóa luận tốt nghiệp.
> Bao gồm: 4.5 Kiểm thử hệ thống · 4.6 Nhận xét đánh giá

---

## 4.5. Kiểm thử hệ thống

### 4.5.1. Kiểm thử chức năng tính năng AI

**Bảng 4.1. Kiểm thử các chức năng AI cốt lõi**

| STT | Chức năng | Kịch bản kiểm thử | Đầu vào | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Trích xuất văn bản PDF | Upload file PDF có text layer | File PDF 2MB, 15 trang | contentText chứa nội dung đã chuẩn hóa, ≤ 8000 ký tự | Trích thành công, cắt đúng 8000 ký tự | ✅ Đạt |
| 2 | Trích xuất văn bản DOCX | Upload file Word | File .docx 500KB | contentText chứa toàn bộ đoạn văn | Trích thành công qua thư viện mammoth | ✅ Đạt |
| 3 | Trích xuất văn bản PPTX | Upload file PowerPoint | File .pptx 20 slide | contentText chứa text từ tất cả slide | Trích thành công qua officeparser | ✅ Đạt |
| 4 | File không hỗ trợ trích text | Upload file ZIP/Video | File .zip, .mp4 | contentText rỗng, embedding dựa vào tiêu đề + mô tả | contentText = "", embedding sinh từ title+desc | ✅ Đạt |
| 5 | Sinh embedding khi upload | Upload tài liệu bất kỳ | PDF hợp lệ | Vector 1536 chiều lưu vào trường embedding trong MongoDB | Vector đúng 1536 phần tử được lưu | ✅ Đạt |
| 6 | buildEmbeddingText | Tạo văn bản đầu vào embedding | title, description, contentText | title lặp 2 lần + description + 1500 ký tự đầu content | Chuỗi đúng định dạng, tăng trọng số tiêu đề | ✅ Đạt |
| 7 | Sinh embedding an toàn | API OpenAI timeout/lỗi | Mô phỏng lỗi mạng | Upload vẫn thành công, embedding = [] | Tài liệu lưu được, ghi log cảnh báo | ✅ Đạt |
| 8 | Tìm kiếm ngữ nghĩa | Truy vấn rõ ràng ≥ 3 từ | "lập trình hướng đối tượng" | Top tài liệu liên quan, score ≥ 0.65 | 8/10 kết quả liên quan đúng chủ đề | ✅ Đạt |
| 9 | Tìm kiếm ngữ nghĩa | Truy vấn 1 từ ngắn | "mạng" | Lọc hybrid loại kết quả lạc đề | Vùng 0.65–0.75 được kiểm tra từ khóa bổ sung | ✅ Đạt |
| 10 | expandQuery | Mở rộng truy vấn trước khi embed | "cơ sở dữ liệu" | Chuỗi mở rộng gồm các từ liên quan | Trả về "cơ sở dữ liệu SQL NoSQL MySQL MongoDB schema..." | ✅ Đạt |
| 11 | expandQuery fallback | API GPT lỗi khi expand | Mô phỏng lỗi | Dùng truy vấn gốc, không crash | Tìm kiếm vẫn trả kết quả với query gốc | ✅ Đạt |
| 12 | Gợi ý cá nhân hóa | User có lịch sử tương tác | User đã xem 5 tài liệu | Gợi ý tài liệu mới, không trùng đã xem | 24 gợi ý, loại đúng các tài liệu đã xem | ✅ Đạt |
| 13 | Trọng số tương tác | Nhiều loại hành động | view, download, save | Download/save trọng số cao hơn view | Profile vector bị kéo đúng về phía tài liệu download/save | ✅ Đạt |
| 14 | Cold-start | User mới chưa tương tác | Tài khoản mới đăng ký | Trả về tài liệu phổ biến nhất, badge "Phổ biến" | Hiển thị top tài liệu theo viewCount, isColdStart=true | ✅ Đạt |
| 15 | Tìm tài liệu tương tự | Xem chi tiết 1 tài liệu | materialId hợp lệ, có embedding | Top 5 tài liệu cùng chủ đề, score ≥ 0.65 | Trả về đúng tài liệu liên quan, loại chính nó | ✅ Đạt |
| 16 | Chat với tài liệu | Hỏi về nội dung file | Câu hỏi liên quan nội dung PDF | Câu trả lời dựa trên contentText, tiếng Việt | Trả lời đúng, trích dẫn đúng nội dung | ✅ Đạt |
| 17 | Chat tài liệu không có text | File zip/video không có contentText | materialId của file zip | Thông báo lỗi rõ ràng, không crash | HTTP 400: "Tài liệu này chưa hỗ trợ chat" | ✅ Đạt |
| 18 | Lịch sử hội thoại chat | Chat nhiều lượt | 3 câu hỏi liên tiếp | AI nhớ ngữ cảnh các lượt trước | Truyền đúng history 6 lượt gần nhất | ✅ Đạt |
| 19 | Tạo quiz tự động | Tài liệu có contentText | materialId hợp lệ | 5 câu hỏi trắc nghiệm, 4 đáp án, 1 đúng | Sinh đúng 5 câu, JSON đúng cấu trúc | ✅ Đạt |
| 20 | Quiz không có nội dung | File không trích được text | materialId file video | Thông báo lỗi, không crash | HTTP 400: "Tài liệu này chưa hỗ trợ quiz" | ✅ Đạt |
| 21 | Sinh metadata tự động | Upload file, dùng AI đặt tên | contentText + danh sách danh mục | title, description, categoryId, majorId hợp lệ | AI trả đúng JSON, chọn đúng category từ danh sách | ✅ Đạt |

---

### 4.5.2. Kiểm thử API

**Bảng 4.2. Kết quả kiểm thử các endpoint AI**

| STT | Endpoint | Method | Kịch bản | HTTP Status | Thời gian phản hồi (ms) | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | `/api/recommendations/for-you` | GET | User có lịch sử, 20 tương tác | 200 | ~750 | isColdStart=false, basedOn=tên tài liệu |
| 2 | `/api/recommendations/for-you` | GET | User mới, chưa tương tác | 200 | ~180 | isColdStart=true, dùng popular |
| 3 | `/api/recommendations/for-you` | GET | Không có token | 401 | ~20 | authMiddleware từ chối |
| 4 | `/api/recommendations/for-you` | GET | Gọi > 20 lần/phút | 429 | ~10 | aiLimiter giới hạn |
| 5 | `/api/recommendations/search` | GET | Truy vấn "lập trình web" | 200 | ~1100 | expandQuery + vectorSearch |
| 6 | `/api/recommendations/search` | GET | Thiếu tham số `q` | 400 | ~15 | "Vui lòng cung cấp từ khóa" |
| 7 | `/api/recommendations/search` | GET | Lọc theo type=video | 200 | ~900 | Chỉ trả tài liệu video |
| 8 | `/api/recommendations/similar/:id` | GET | materialId hợp lệ có embedding | 200 | ~160 | Không cần auth, không dùng OpenAI |
| 9 | `/api/recommendations/similar/:id` | GET | materialId không có embedding | 200 | ~50 | Trả mảng rỗng [] |
| 10 | `/api/recommendations/chat` | POST | Câu hỏi hợp lệ, tài liệu có text | 200 | ~1800 | answer = chuỗi tiếng Việt |
| 11 | `/api/recommendations/chat` | POST | Tài liệu không có contentText | 400 | ~60 | "Tài liệu này chưa hỗ trợ chat" |
| 12 | `/api/recommendations/chat` | POST | Câu hỏi > 1000 ký tự | 400 | ~10 | "Câu hỏi quá dài" |
| 13 | `/api/recommendations/chat` | POST | materialId không hợp lệ | 400 | ~10 | "materialId không hợp lệ" |
| 14 | `/api/recommendations/chat` | POST | Gọi > 5 lần/phút | 429 | ~10 | chatLimiter giới hạn chặt hơn |
| 15 | `/api/recommendations/quiz` | POST | Tài liệu có contentText | 200 | ~2800 | 5 câu hỏi JSON hợp lệ |
| 16 | `/api/recommendations/quiz` | POST | Tài liệu không có contentText | 400 | ~55 | "Tài liệu này chưa hỗ trợ quiz" |
| 17 | `/api/materials` | POST | File PDF 2MB, đủ trường | 201 | ~4200 | embedding + contentText được lưu |
| 18 | `/api/materials` | POST | File vượt 100MB | 400 | ~80 | "File quá lớn, tối đa 100MB" |
| 19 | `/api/materials` | POST | Định dạng không hỗ trợ (.exe) | 400 | ~30 | "Định dạng file không được hỗ trợ" |

---

### 4.5.3. Hiệu năng hệ thống

**Bảng 4.3. Thời gian phản hồi các tác vụ AI**

| Tác vụ | Trung bình | Tối thiểu | Tối đa | Ghi chú |
|---|---|---|---|---|
| Trích text PDF (pdf-parse) | ~320ms | ~80ms | ~900ms | Phụ thuộc số trang |
| Trích text DOCX (mammoth) | ~150ms | ~50ms | ~400ms | |
| Trích text PPTX (officeparser) | ~280ms | ~100ms | ~600ms | Phụ thuộc số slide |
| Sinh embedding (OpenAI API) | ~580ms | ~400ms | ~1200ms | Phụ thuộc độ trễ mạng |
| expandQuery (GPT-4o-mini) | ~430ms | ~300ms | ~800ms | ~60 token output |
| vectorSearch MongoDB Atlas | ~160ms | ~80ms | ~350ms | 103 tài liệu trong DB |
| Tính profile vector (weighted avg) | < 5ms | < 1ms | ~10ms | Tính toán local, không gọi API |
| Chat 1 câu hỏi (GPT-4o-mini) | ~1800ms | ~1200ms | ~3200ms | max_tokens=500 |
| Tạo quiz 5 câu (GPT-4o-mini) | ~2800ms | ~2000ms | ~4500ms | max_tokens=1500 |
| Toàn bộ luồng upload PDF | ~4200ms | ~3000ms | ~6000ms | Bao gồm upload R2 + embed |

**Bảng 4.4. Thông số kỹ thuật hệ thống AI**

| Thông số | Giá trị |
|---|---|
| Model embedding | OpenAI text-embedding-3-small |
| Số chiều vector | 1536 |
| Giới hạn nội dung đưa vào embedding | 8.000 ký tự |
| Giới hạn nội dung đưa vào chat | 8.000 ký tự |
| Model sinh text (chat/quiz/metadata) | GPT-4o-mini |
| Ngưỡng score "chắc chắn liên quan" | ≥ 0,75 (cosine similarity) |
| Ngưỡng score "vùng xám" | 0,65 – 0,75 (kết hợp hybrid filter) |
| Ngưỡng score "for-you feed" | ≥ 0,55 |
| Số tài liệu trong DB (thời điểm test) | 103 tài liệu |
| Số tài liệu có embedding đầy đủ | 103/103 (100%) |
| Số tài liệu có contentText | 36/103 (34,9%) |
| Rate limit AI thông thường | 20 request/phút/IP |
| Rate limit chat/quiz | 5 request/phút/IP |
| Chi phí embedding toàn bộ DB | < $0,01 USD |

---

### 4.5.4. Phân tích lỗi phát sinh và cách xử lý

**Bảng 4.5. Các lỗi phát sinh trong quá trình phát triển và triển khai**

| STT | Lỗi phát sinh | Nguyên nhân | Giải pháp | Kết quả |
|---|---|---|---|---|
| 1 | Upload trả về HTTP 500 trên production | Frontend đặt thủ công `Content-Type: multipart/form-data` không có boundary parameter, khiến multer không parse được request | Bỏ header Content-Type thủ công, để axios tự sinh đúng boundary từ FormData | Đã khắc phục |
| 2 | Rate-limit lỗi ERR_ERL_UNEXPECTED_X_FORWARDED_FOR | express-rate-limit đọc IP từ X-Forwarded-For nhưng chưa tin tưởng Nginx proxy | Thêm `app.set("trust proxy", 1)` vào server.js | Đã khắc phục |
| 3 | Frontend gọi localhost:5000 thay vì domain thật | NEXT_PUBLIC_API_URL được baked vào bundle tại thời điểm build | Chuyển baseURL sang relative URL phía client | Đã khắc phục |
| 4 | Tài liệu upload thành công nhưng không xuất hiện trong AI search | API OpenAI lỗi lúc upload → embedding = [] | Triển khai safeGenerateEmbedding; chạy script generate_embeddings để embed lại | Đã khắc phục |
| 5 | pdf-parse crash khi import trực tiếp | Phiên bản 1.1.1 thử đọc file test khi require, crash trong Docker | Import trực tiếp từ `pdf-parse/lib/pdf-parse.js` | Đã khắc phục |
| 6 | PDF scan (ảnh) không trích được text | pdf-parse chỉ đọc text layer, không có OCR | Ghi nhận hạn chế; contentText = "", embedding dựa vào tiêu đề/mô tả | Hạn chế còn tồn tại |
| 7 | Chat trả lời sai với câu hỏi ngoài tài liệu | GPT-4o-mini đôi khi sinh thông tin không có trong contentText | Thêm chỉ thị rõ vào system prompt: "Nếu không có trong tài liệu, nói rõ không tìm thấy" | Giảm thiểu đáng kể |
| 8 | vectorSearch trả về kết quả lạc đề ở truy vấn ngắn | Vector 1–2 từ không đủ đại diện ngữ nghĩa | Kết hợp expandQuery + hybrid filter từ khóa ở vùng score 0,65–0,75 | Cải thiện rõ rệt |

---

## 4.6. Nhận xét, đánh giá

### 4.6.1. Đánh giá hiệu quả tìm kiếm ngữ nghĩa

Để đánh giá hiệu quả của tính năng tìm kiếm ngữ nghĩa, nhóm tiến hành kiểm thử song song hai phương thức tìm kiếm trên cùng 10 truy vấn đại diện với cơ sở dữ liệu 103 tài liệu đã được duyệt.

**Bảng 4.6. So sánh kết quả tìm kiếm từ khóa và tìm kiếm ngữ nghĩa**

*(Tiêu chí: trong top 5 kết quả trả về, có bao nhiêu tài liệu thực sự liên quan đến truy vấn)*

| STT | Truy vấn | Từ khóa (đúng/5) | Ngữ nghĩa (đúng/5) |
|---|---|---|---|
| 1 | "lập trình hướng đối tượng" | 0/5 | 5/5 |
| 2 | "OOP" | 0/5 | 5/5 |
| 3 | "cơ sở dữ liệu" | 1/5 | 4/5 |
| 4 | "SQL JOIN query" | 0/5 | 0/5 |
| 5 | "phân tích thiết kế hệ thống" | 0/5 | 2/5 |
| 6 | "mạng" | 5/5 | 3/5 |
| 7 | "kiến trúc phần mềm" | 0/5 | 1/5 |
| 8 | "thuật toán tìm kiếm" | 1/5 | 4/5 |
| 9 | "bảo mật web" | 0/5 | 2/5 |
| 10 | "học máy phân loại" | 0/5 | 3/5 |
| | **Tổng** | **7/50 (14%)** | **29/50 (58%)** |

Kết quả cho thấy tìm kiếm ngữ nghĩa đạt độ chính xác **58%** (29/50 kết quả đúng), cao hơn tìm kiếm từ khóa chỉ đạt **14%** (7/50). Nguyên nhân chênh lệch xuất phát từ cơ chế hoạt động khác nhau: tìm kiếm từ khóa chỉ tìm tài liệu có chứa chuỗi ký tự khớp chính xác trong tiêu đề hoặc mô tả, do đó bỏ sót hoàn toàn các truy vấn dùng từ viết tắt tiếng Anh ("OOP"), truy vấn không dấu, và các khái niệm được diễn đạt khác đi trong tiêu đề tài liệu. Ngược lại, tìm kiếm ngữ nghĩa chuyển đổi truy vấn thành vector nhúng 1536 chiều và tìm các tài liệu gần về mặt ngữ nghĩa mà không yêu cầu khớp từ ngữ chính xác.

Tuy nhiên, kết quả cũng chỉ ra rằng tìm kiếm ngữ nghĩa không phải lúc nào cũng vượt trội. Ở truy vấn 1 từ ngắn như "mạng", tìm kiếm từ khóa đạt 5/5 trong khi tìm kiếm ngữ nghĩa chỉ đạt 3/5. Nguyên nhân là vector nhúng của một từ đơn lẻ mang ngữ nghĩa mơ hồ — từ "mạng" có thể chỉ mạng máy tính, mạng nơ-ron hoặc mạng xã hội — khiến vector không xác định được chủ đề cụ thể. Đây cũng là lý do hệ thống tích hợp cơ chế expandQuery, tự động mở rộng truy vấn ngắn thành cụm từ liên quan trước khi tạo vector nhúng.

---

### 4.6.2. Đánh giá kết quả gợi ý cá nhân hóa

**Bảng 4.7. Độ chính xác gợi ý cá nhân hóa theo mức độ tương tác**

| Kịch bản | Số user kiểm thử | Tài liệu gợi ý liên quan | Tỉ lệ liên quan |
|---|---|---|---|
| User có ≥ 10 lượt tương tác | 3 | 19/24 | 79,2% |
| User có 3–9 lượt tương tác | 3 | 15/24 | 62,5% |
| User cold-start (< 3 lượt) | 2 | — (dùng popular) | — |

Tính năng gợi ý cá nhân hóa hoạt động hiệu quả hơn khi người dùng có nhiều lịch sử tương tác. Với người dùng có từ 10 lượt tương tác trở lên, tỉ lệ tài liệu gợi ý thực sự liên quan đến sở thích đạt **79,2%**. Với người dùng có ít tương tác hơn, tỉ lệ này giảm xuống **62,5%** do vector sở thích chưa đủ đại diện. Với người dùng cold-start, hệ thống tự động fallback về danh sách tài liệu phổ biến nhất theo lượt xem và thông báo rõ trạng thái trên giao diện.

---

### 4.6.3. Đánh giá tổng thể

Hệ thống AI đã được triển khai thành công và vận hành ổn định trên môi trường production tại địa chỉ vlu.datahub.id.vn. Các tính năng cốt lõi gồm tìm kiếm ngữ nghĩa, gợi ý cá nhân hóa, chat tài liệu và tạo quiz tự động đều hoạt động đúng theo yêu cầu đặt ra. Hệ thống xử lý tốt các tình huống biên như API lỗi, file không hỗ trợ và người dùng mới — đảm bảo không có trường hợp nào gây crash hoặc mất dữ liệu.

---

### 4.6.4. Những điểm hạn chế và điều chỉnh

**Về xử lý nội dung file:** Hệ thống hỗ trợ trích xuất văn bản từ ba định dạng chính: PDF (pdf-parse), DOCX (mammoth) và PPTX (officeparser). Hạn chế còn tồn tại là với file PDF dạng scan (ảnh), hệ thống không thể đọc được text do thiếu lớp OCR — trường hợp này embedding chỉ dựa trên tiêu đề và mô tả. Với file ZIP và video, hệ thống không trích xuất được nội dung bên trong; đặc biệt video được tách ra thành trang riêng (/videos) và không tham gia vào luồng tìm kiếm ngữ nghĩa AI — phía frontend chủ động loại video bằng tham số `type=not_video` khi gọi API.

**Về mô hình hỏi đáp AI:** Hệ thống áp dụng kỹ thuật Context Injection thay vì RAG đầy đủ — toàn bộ contentText được nhét trực tiếp vào system prompt trước khi gửi lên GPT-4o-mini. Giải pháp này phù hợp với tài liệu học tập có dung lượng vừa phải, nhưng với tài liệu dài vượt giới hạn 8.000 ký tự, nội dung phải bị cắt bớt, có thể làm mất thông tin ở phần cuối. Ngoài ra, tính năng chat và quiz chỉ khả dụng với tài liệu có contentText — file video, ZIP và PDF scan không sử dụng được.

**Về gợi ý cá nhân hóa (cold-start):** Hệ thống đã có cơ chế xử lý cold-start: khi người dùng chưa có lịch sử tương tác, hệ thống tự động fallback về danh sách tài liệu phổ biến nhất theo lượt xem. Hạn chế ở giai đoạn này là gợi ý chưa được cá nhân hóa — tất cả người dùng mới nhận cùng một danh sách. Chất lượng gợi ý cải thiện dần khi người dùng tương tác nhiều hơn với hệ thống.

**Về kiểm duyệt nội dung:** Quy trình kiểm duyệt hiện tại hoàn toàn thủ công do quản trị viên thực hiện. Mọi tài liệu sau khi upload đều ở trạng thái pending và không xuất hiện trong tìm kiếm hay gợi ý cho đến khi được duyệt. Trong bối cảnh hệ thống mở rộng với lượng tài liệu lớn, cần xem xét tích hợp bước tiền kiểm duyệt tự động để giảm tải cho quản trị viên.
