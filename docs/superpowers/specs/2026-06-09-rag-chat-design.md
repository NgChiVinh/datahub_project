# RAG Chat — Document Q&A Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cho phép user đặt câu hỏi về nội dung của một tài liệu cụ thể, AI trả lời dựa trên nội dung thực của tài liệu đó (RAG — Retrieval-Augmented Generation).

**Architecture:** Naive RAG — lấy `contentText` từ MongoDB, chunk in-memory, embed câu hỏi + chunks bằng OpenAI, cosine similarity để chọn top-4 chunks liên quan, gửi lên gpt-4o-mini để sinh câu trả lời. Chunk embeddings được cache trong memory theo `materialId` để tránh re-embed khi cùng tài liệu được hỏi nhiều lần.

**Tech Stack:** Node.js/Express (backend), Next.js (frontend), OpenAI API (text-embedding-3-small + gpt-4o-mini), MongoDB Atlas, officeparser (PPTX extraction)

---

## Scope

Hai việc trong một spec:

1. **PPTX text extraction** — prerequisite cho RAG, fix `extractText.js` để trích text từ .pptx
2. **RAG Chat** — UI + backend cho phép hỏi về nội dung tài liệu (PDF, DOCX, PPTX)

---

## Backend

### 1. PPTX Extraction (`Backend/utils/extractText.js`)

Thêm `officeparser` vào `extractText()`:

```javascript
// npm install officeparser
const officeParser = require("officeparser");

// Trong extractText(buffer, fileName):
if (ext === ".pptx") {
  const text = await officeParser.parseOfficeAsync(buffer);
  return (text || "").slice(0, 50000);
}
```

Sau khi deploy: chạy `generate_embeddings.js` để re-embed các PPTX cũ (script đã có).

### 2. Chunking & Retrieval (`Backend/services/aiService.js`)

Thêm 3 functions:

**`chunkText(text, chunkSize=400, overlap=50)`**
- Cắt `text` thành mảng string, mỗi chunk ~400 ký tự, overlap 50 ký tự giữa 2 chunk liền kề.

**`cosineSimilarity(vecA, vecB)`**
- Tính cosine similarity giữa 2 vector: `dot(A,B) / (|A| * |B|)`.

**`chatWithDocument(materialId, question)`**
```
1. Tìm document trong DB, lấy contentText
2. Nếu không có contentText → throw error "Tài liệu này chưa hỗ trợ chat"
3. Kiểm tra chunkCache (Map): nếu đã có chunks+vectors cho materialId → dùng cache
4. Nếu chưa có: chunkText(contentText) → embed từng chunk → lưu vào cache
5. Embed câu hỏi
6. Cosine similarity → top 4 chunks
7. Build prompt (xem bên dưới) → gpt-4o-mini
8. Trả về { answer }
```

**Prompt template:**
```
System: Bạn là trợ lý học tập. Dựa vào các đoạn trích dưới đây từ tài liệu,
hãy trả lời câu hỏi một cách chính xác và súc tích bằng tiếng Việt.
Nếu thông tin không có trong các đoạn trích, hãy nói rõ là không tìm thấy trong tài liệu.

Context:
[chunk 1]
---
[chunk 2]
---
[chunk 3]
---
[chunk 4]

Câu hỏi: {question}
```

**In-memory cache:**
```javascript
const chunkCache = new Map();
// Key: materialId (string)
// Value: [{ chunk: string, vector: number[] }]
// TTL: không có — cache tồn tại suốt phiên server, mất khi restart
```

### 3. Controller (`Backend/controllers/recommendationController.js`)

Thêm `exports.chatDocument`:
```javascript
exports.chatDocument = async (req, res) => {
  const { materialId, question } = req.body;
  if (!materialId || !question?.trim()) {
    return res.status(400).json({ success: false, message: "Thiếu materialId hoặc question" });
  }
  const result = await chatWithDocument(materialId, question.trim());
  res.json({ success: true, answer: result.answer });
};
```

Error handling:
- `contentText` không có → 400 "Tài liệu này chưa hỗ trợ chat"
- Document không tồn tại → 404
- OpenAI lỗi → 500 "AI đang bận, thử lại sau"

### 4. Route (`Backend/routes/recommendationRoutes.js`)

```javascript
router.post("/chat", aiLimiter, recommendationController.chatDocument);
```

Dùng lại `aiLimiter` đã có (20 req/min/IP). Không yêu cầu auth — chat là public feature.

---

## Frontend

### 5. DocumentChat Component (`frontend/src/components/DocumentChat.js`)

Client component (`"use client"`).

**Props:** `{ materialId, hasContent }` — `hasContent` là `!!material.contentText` được truyền từ trang cha.

**Render logic:**
- `hasContent === false` → return null (ẩn hoàn toàn, không hiện disabled state)
- `hasContent === true` → hiện chat panel

**State:**
```javascript
const [messages, setMessages] = useState([]); // [{ role: 'user'|'assistant', content }]
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
```

**UX:**
- Enter gửi câu hỏi, Shift+Enter xuống dòng
- Disable input + nút Hỏi khi `isLoading`
- Auto-scroll xuống message mới nhất (useRef + scrollIntoView)
- Hiển thị tối đa 20 cặp Q&A (slice(-40) messages)
- Loading state: hiện skeleton/spinner thay vì câu trả lời

**API call:**
```javascript
const res = await fetch(`${API_URL}/api/recommendations/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ materialId, question: input.trim() })
});
```

### 6. Trang chi tiết tài liệu (`frontend/src/app/documents/[id]/page.js`)

Nhúng `<DocumentChat>` sau phần thông tin tài liệu:
```jsx
<DocumentChat
  materialId={material._id}
  hasContent={!!material.contentText}
/>
```

Backend cần trả về `contentText` (hoặc ít nhất boolean `hasContentText`) trong response `/api/materials/:id` — chỉ cần biết có hay không, không cần gửi full text về client.

---

## Error Handling Summary

| Tình huống | Backend | Frontend |
|---|---|---|
| Không có `contentText` | 400 | Ẩn chat panel (hasContent=false) |
| Câu hỏi rỗng | 400 | Disable nút Hỏi |
| Document không tồn tại | 404 | Ẩn chat panel |
| GPT lỗi / timeout | 500 | "AI đang bận, thử lại sau" |
| Rate limit | 429 | "Bạn hỏi quá nhanh, chờ chút" |

---

## Chi phí API (ước tính)

| Thao tác | Token | Chi phí |
|---|---|---|
| Embed câu hỏi | ~10 | $0.0000002 |
| Embed 14 chunks (lần đầu) | ~1400 | $0.000028 |
| GPT input (4 chunks + câu hỏi) | ~600 | $0.00009 |
| GPT output (câu trả lời) | ~200 | $0.00012 |
| **Tổng lần đầu** | | **~$0.00024** |
| **Tổng lần sau (cache hit)** | | **~$0.00021** |

---

## Files Changed

| File | Thay đổi |
|---|---|
| `Backend/utils/extractText.js` | Thêm PPTX support (officeparser) |
| `Backend/services/aiService.js` | Thêm chunkText, cosineSimilarity, chatWithDocument, chunkCache |
| `Backend/controllers/recommendationController.js` | Thêm chatDocument handler |
| `Backend/routes/recommendationRoutes.js` | Thêm POST /chat route |
| `frontend/src/components/DocumentChat.js` | Component mới |
| `frontend/src/app/documents/[id]/page.js` | Nhúng DocumentChat |
| `Backend/package.json` | Thêm officeparser |

---

## Out of Scope

- Lưu lịch sử chat vào DB (session-only là đủ)
- Chat trên trang videos (không có contentText)
- Multi-document RAG (hỏi toàn thư viện)
- Streaming response (gpt-4o-mini trả về một lần là đủ nhanh)
- Auth cho chat endpoint (public feature)
