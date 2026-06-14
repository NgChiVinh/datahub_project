# Báo Cáo Tính Năng AI — DataHub

> **Dự án:** DataHub — Nền tảng chia sẻ tài liệu học tập  
> **Công nghệ AI:** OpenAI text-embedding-3-small, GPT-4o-mini, MongoDB Atlas Vector Search

---

## PHẦN 1: TÓM TẮT KẾT QUẢ

Hệ thống DataHub tích hợp 6 tính năng AI chính, chia thành 2 nhóm:

### Nhóm 1 — Gợi ý và Tìm kiếm thông minh
| Tính năng | Mô tả |
|---|---|
| **Gợi ý cá nhân hóa** | Phân tích lịch sử tương tác, gợi ý tài liệu phù hợp với sở thích từng người dùng |
| **Tài liệu tương tự** | Hiển thị các tài liệu có nội dung gần giống trên trang chi tiết |
| **Tìm kiếm ngữ nghĩa** | Tìm kiếm theo ý nghĩa thay vì từ khóa cứng nhắc |
| **Nhãn lý do gợi ý** | Giải thích tại sao mỗi tài liệu được gợi ý (VD: "Tương tự Giải tích 1 · Toán học") |

### Nhóm 2 — Tương tác với tài liệu
| Tính năng | Mô tả |
|---|---|
| **Chat với tài liệu** | Hỏi đáp AI về nội dung tài liệu cụ thể, có nhớ ngữ cảnh hội thoại (Context Injection) |
| **Tạo quiz tự động** | Sinh 5 câu hỏi trắc nghiệm từ nội dung tài liệu |

**Mô hình AI sử dụng:**
- `text-embedding-3-small` (OpenAI) — chuyển văn bản thành vector 1536 chiều
- `gpt-4o-mini` (OpenAI) — sinh nội dung (quiz, câu trả lời, mở rộng query)

---

## PHẦN 2: CHI TIẾT KỸ THUẬT

### 2.1 Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│  /ai-suggest   /documents/[id]   /documents (search)     │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────┐
│              BACKEND (Express.js)                        │
│   recommendationController → recommendationService       │
│   recommendationController → aiService                   │
└───────────┬──────────────────────────┬──────────────────┘
            │                          │
┌───────────▼──────────┐   ┌───────────▼──────────────────┐
│   OpenAI API         │   │   MongoDB Atlas              │
│ - text-embedding-    │   │ - Vector Search Index        │
│   3-small (embed)    │   │ - Cosine Similarity          │
│ - gpt-4o-mini (gen)  │   │ - materials.embedding[]      │
└──────────────────────┘   └──────────────────────────────┘
```

---

### 2.2 Pipeline Embedding Tài Liệu

**Mục đích:** Chuyển nội dung tài liệu thành vector số học để so sánh ngữ nghĩa.

**Luồng xử lý khi upload:**
1. Server nhận file (PDF, DOCX, PPTX)
2. Trích xuất văn bản thuần (`extractText` — dùng `pdf-parse`, `mammoth`, `officeparser`)
3. Xây dựng chuỗi embedding: `title + description + contentText.slice(0, 5000)`
4. Gọi `text-embedding-3-small` → nhận vector 1536 chiều
5. Lưu vào `materials.embedding` trong MongoDB Atlas

**Độ phủ:** 107/115 tài liệu phi video (93%) có embedding và contentText.

---

### 2.3 Gợi Ý Cá Nhân Hóa (For-You Feed)

**Endpoint:** `GET /api/recommendations/for-you`  
**File:** `Backend/services/recommendationService.js` → `getPersonalizedRecommendations()`

**Thuật toán:**

```
1. Lấy tối đa 20 tương tác gần nhất của user (sort theo updatedAt)
2. Lọc: chỉ giữ tài liệu đã duyệt + có embedding
3. Tính profile vector = Σ(embedding_i × weight_i) / Σweight_i
4. MongoDB Atlas $vectorSearch với profile vector
5. Loại trừ tài liệu đã tương tác ($nin)
6. Trả về top N kết quả (score >= 0.55)
```

**Bảng trọng số tương tác:**
| Hành động | Weight |
|---|---|
| Xem tài liệu (view) | 1 |
| Tải xuống (download) | 3 |
| Lưu vào bộ sưu tập | 4 |
| Thích (like) | 5 |

**Cold-start:** Khi user chưa có lịch sử tương tác → trả về tài liệu có nhiều lượt xem nhất (popular feed).

**`basedOn`:** Tiêu đề tài liệu có trọng số cao nhất trong profile → dùng để hiển thị nhãn lý do gợi ý.

---

### 2.4 Tìm Kiếm Ngữ Nghĩa (Semantic Search)

**Endpoint:** `GET /api/recommendations/search?q=...`  
**File:** `Backend/services/recommendationService.js` → `semanticSearch()`

**Luồng xử lý:**

```
Query người dùng
    │
    ▼
expandQuery() ─── gpt-4o-mini mở rộng từ khóa
    │              VD: "giải tích" → "giải tích vi tích phân đạo hàm giới hạn..."
    ▼
generateEmbedding() ─── text-embedding-3-small
    │
    ▼
$vectorSearch (numCandidates=100)
    │
    ▼
Hybrid Filter:
  score >= 0.75 → giữ luôn (chắc chắn liên quan)
  0.65 ≤ score < 0.75 → chỉ giữ nếu có từ khóa trùng trong title/desc/contentText
  score < 0.65 → loại bỏ
    │
    ▼
Kết quả (tối đa 12 tài liệu, lọc video)
```

**Lý do dùng hybrid filter:** Vector embedding đôi khi trả về tài liệu "nghe có vẻ liên quan" nhưng thực ra không. Vùng xám (0.65–0.75) cần xác nhận thêm bằng keyword để tránh kết quả nhiễu.

**Calibration:** Ngưỡng được đo thực tế trên `text-embedding-3-small` (score thấp hơn mô hình Gemini khoảng 0.1–0.15).

---

### 2.5 Tài Liệu Tương Tự (Similar Documents)

**Endpoint:** `GET /api/recommendations/similar/:materialId`  
**File:** `Backend/services/recommendationService.js` → `findSimilarMaterials()`

**Luồng:** Dùng embedding của tài liệu hiện tại làm query vector → $vectorSearch → loại chính nó → lọc score >= 0.65.

**Hiển thị:** Section "Gợi ý AI" trong sidebar trang `/documents/[id]`. Fallback về "Cùng chuyên mục" nếu tài liệu không có embedding.

---

### 2.6 Chat Với Tài Liệu (RAG)

**Endpoint:** `POST /api/recommendations/chat`  
**File:** `Backend/services/aiService.js` → `chatWithDocument()`

**Kiến trúc (Context Injection):**

```
System prompt: "Trợ lý học tập. Tài liệu: [contentText.slice(0, 8000)]"
    +
History: [tối đa 6 messages gần nhất (3 exchanges)]
    +
User: [câu hỏi mới]
    │
    ▼
gpt-4o-mini (max_tokens=500, temperature=0.3)
    │
    ▼
Câu trả lời tiếng Việt
```

**Phương pháp Context Injection vs RAG truyền thống:**

Hệ thống sử dụng **Context Injection** thay vì RAG (Retrieval-Augmented Generation) truyền thống. Toàn bộ nội dung tài liệu (tối đa 8.000 ký tự) được đưa trực tiếp vào system prompt, thay vì chia nhỏ (chunk) và tìm kiếm đoạn liên quan theo từng câu hỏi.

Lý do lựa chọn: RAG truyền thống dễ bỏ sót ngữ cảnh quan trọng khi chunking cắt sai vị trí (giữa công thức, giữa định nghĩa), đặc biệt với tài liệu học thuật có cấu trúc phụ thuộc lẫn nhau. Context Injection đảm bảo AI luôn có đủ thông tin và phù hợp với phần lớn tài liệu trong hệ thống (slide bài giảng, lab report thường dưới 40 trang).

**Giới hạn đã biết:** Với tài liệu trên ~40 trang, hệ thống chỉ xử lý được 8.000 ký tự đầu tiên. Hướng cải tiến trong tương lai là áp dụng hybrid approach: tài liệu ngắn dùng Context Injection, tài liệu dài dùng RAG với chunking có overlap để tránh mất ngữ cảnh.

**Tính năng nổi bật:**
- **Nhớ ngữ cảnh hội thoại:** AI hiểu được "giải thích thêm" hay "ý trên là gì" nhờ gửi kèm history
- **Giới hạn an toàn:** contentText cắt 8.000 ký tự đầu tránh tràn context
- **Rate limit:** 5 request/phút/IP

**Điều kiện:** Chỉ khả dụng với tài liệu có `contentText` (đã trích xuất văn bản thành công).

---

### 2.7 Tạo Quiz Tự Động

**Endpoint:** `POST /api/recommendations/quiz`  
**File:** `Backend/services/aiService.js` → `generateQuiz()`

**Prompt engineering:** Yêu cầu gpt-4o-mini sinh đúng 5 câu trắc nghiệm dựa trực tiếp trên nội dung tài liệu, mỗi câu có 4 đáp án (1 đúng, 3 nhiễu hợp lý), trả về JSON chuẩn.

**Cấu trúc output:**
```json
{
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": 0
    }
  ]
}
```

**Chấm điểm:** Hoàn toàn phía client — không lưu vào database, không tốn thêm API call.

---

### 2.8 Nhãn Lý Do Gợi Ý

**File:** `frontend/src/app/ai-suggest/page.js` → `getReasonLabel()`

**Logic (pure frontend, không tốn API):**

| Điều kiện | Hiển thị |
|---|---|
| Cold-start (chưa cá nhân hóa) | "Phổ biến trong cộng đồng" |
| Có `basedOn` + `category` | "Tương tự [tên doc] · [category]" |
| Chỉ có `basedOn` | "Dựa trên [tên doc]" |
| Fallback | "Phù hợp với sở thích của bạn" |

---

### 2.9 Bảo Vệ API và Chi Phí

**Rate Limiting:**
- Chat, Quiz: **5 request/phút/IP** (tốn token nhiều nhất)
- Search AI, For-You: **20 request/phút/IP**

**Ước tính chi phí:**
| Tính năng | Chi phí/lần | $3 dùng được |
|---|---|---|
| Chat | ~$0.0005 | ~6.000 tin nhắn |
| Quiz | ~$0.0008 | ~3.750 lần tạo |
| Semantic Search | ~$0.000002 | ~1.500.000 lần |
| For-You / Embedding | ~$0.000002 | ~1.500.000 lần |

---

### 2.10 Tổng Quan Công Nghệ

| Thành phần | Công nghệ | Mục đích |
|---|---|---|
| Embedding | OpenAI text-embedding-3-small (1536 chiều) | Biểu diễn ngữ nghĩa văn bản |
| Generation | OpenAI gpt-4o-mini | Quiz, Chat, Query expansion |
| Vector DB | MongoDB Atlas Vector Search | Tìm kiếm cosine similarity |
| Backend | Node.js + Express | REST API |
| Frontend | Next.js 14 (App Router) | UI |
| Rate Limiting | express-rate-limit | Bảo vệ chi phí API |

---

### 2.11 Tổng Hợp Thuật Toán Sử Dụng

| Tính năng | Thuật toán | Mô tả ngắn |
|---|---|---|
| **Gợi ý cá nhân hóa** | Weighted Average Embedding | Tính vector sở thích = trung bình có trọng số của embedding các tài liệu đã tương tác |
| **Gợi ý cá nhân hóa** | Cosine Similarity | Đo độ tương đồng giữa vector sở thích và embedding tài liệu trong DB |
| **Tìm kiếm ngữ nghĩa** | Query Expansion | GPT mở rộng từ khóa trước khi embed để tăng recall |
| **Tìm kiếm ngữ nghĩa** | Dense Vector Search | Embed query → tìm tài liệu gần nhất bằng cosine similarity |
| **Tìm kiếm ngữ nghĩa** | Hybrid Filter | Kết hợp vector score + keyword overlap để loại kết quả nhiễu |
| **Tài liệu tương tự** | Cosine Similarity | Dùng embedding tài liệu hiện tại làm query, tìm tài liệu gần nhất |
| **Chat với tài liệu** | Context Injection | Nhúng toàn bộ nội dung tài liệu vào system prompt |
| **Chat với tài liệu** | Sliding Window History | Giữ 3 exchanges (6 messages) gần nhất làm ngữ cảnh hội thoại |
| **Quiz tự động** | Prompt Engineering | Thiết kế prompt buộc GPT sinh đúng cấu trúc JSON 5 câu trắc nghiệm |
| **Nhãn lý do gợi ý** | Rule-based Classification | If/else dựa trên `isColdStart`, `basedOn`, `category` — không dùng ML |

**Thuật toán cốt lõi của hệ thống: Weighted Average Embedding + Cosine Similarity**

Đây là nền tảng của toàn bộ tính năng recommendation. Ý tưởng: thay vì profile người dùng bằng danh sách tag hay category (như hệ thống truyền thống), hệ thống biểu diễn sở thích học tập bằng **một vector trong không gian ngữ nghĩa 1536 chiều** — vector này nắm bắt được ý nghĩa nội dung, không chỉ metadata bề mặt.
