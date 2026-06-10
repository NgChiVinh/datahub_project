# Quiz Tự Động — Design Spec

**Goal:** Cho phép user tạo quiz trắc nghiệm từ nội dung một tài liệu cụ thể, làm bài ngay trên trang chi tiết, xem điểm và đáp án đúng.

**Architecture:** gpt-4o-mini nhận toàn bộ `contentText` (giống chatWithDocument), sinh 5 câu trắc nghiệm dạng JSON có cấu trúc. Frontend hiển thị modal quiz, chấm điểm client-side. Session-only — không lưu DB.

**Tech Stack:** Node.js/Express, Next.js (App Router), OpenAI gpt-4o-mini, MongoDB/Mongoose

---

## Scope

Một tính năng đơn lẻ:
- Nút "Tạo Quiz" trong sidebar trang chi tiết tài liệu (chỉ hiện khi `hasContentText = true`)
- Modal quiz: loading → 5 câu hỏi → kết quả
- Không lưu lịch sử, không auth, không leaderboard

---

## Backend

### 1. `generateQuiz` (`Backend/services/aiService.js`)

```javascript
const generateQuiz = async (materialId) => {
  const Material = require("../models/Material");

  const doc = await Material.findById(materialId).select("contentText");
  if (!doc) {
    const err = new Error("Tài liệu không tồn tại");
    err.statusCode = 404;
    throw err;
  }
  if (!doc.contentText || doc.contentText.trim().length === 0) {
    const err = new Error("Tài liệu này chưa hỗ trợ quiz");
    err.statusCode = 400;
    throw err;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Dựa vào nội dung tài liệu dưới đây, hãy tạo đúng 5 câu hỏi trắc nghiệm để kiểm tra hiểu biết.

Yêu cầu:
- Mỗi câu có đúng 4 đáp án
- Chỉ 1 đáp án đúng
- Câu hỏi phải dựa trực tiếp vào nội dung, không bịa
- Đáp án nhiễu phải hợp lý, không quá dễ đoán
- Ngôn ngữ: tiếng Việt

Trả về JSON với format sau (không giải thích thêm):
{"questions":[{"question":"...","options":["...","...","...","..."],"answer":0}]}

"answer" là index (0-3) của đáp án đúng trong mảng options.

Nội dung tài liệu:
${doc.contentText}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
    temperature: 0.5,
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    const err = new Error("Không thể tạo quiz từ tài liệu này");
    err.statusCode = 400;
    throw err;
  }
  return parsed.questions;
};
```

Export: thêm `generateQuiz` vào `module.exports`.

### 2. Controller (`Backend/controllers/recommendationController.js`)

```javascript
exports.quizDocument = async (req, res) => {
  try {
    const { materialId } = req.body;

    if (!materialId) {
      return res.status(400).json({ success: false, message: "Thiếu materialId" });
    }
    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return res.status(400).json({ success: false, message: "materialId không hợp lệ" });
    }

    const questions = await generateQuiz(materialId);
    res.json({ success: true, questions });
  } catch (error) {
    const status = error.statusCode || 500;
    const message = status === 500 ? "AI đang bận, vui lòng thử lại sau" : error.message;
    res.status(status).json({ success: false, message });
  }
};
```

Import thêm: `const { chatWithDocument, generateQuiz } = require("../services/aiService");`

### 3. Route (`Backend/routes/recommendationRoutes.js`)

```javascript
// Quiz tự động từ nội dung tài liệu (public, no auth required)
router.post("/quiz", aiLimiter, recommendationController.quizDocument);
```

---

## Frontend

### 4. `DocumentQuiz.js` (`frontend/src/components/DocumentQuiz.js`)

Client component (`"use client"`). Props: `{ materialId, hasContent }`.

Trả về `null` nếu `!hasContent`.

**State:**
```javascript
const [phase, setPhase] = useState("idle"); // "idle" | "loading" | "quiz" | "result"
const [questions, setQuestions] = useState([]);
const [selected, setSelected] = useState({}); // { [questionIndex]: optionIndex }
```

**Phases:**

- **idle**: Chỉ render nút "Tạo Quiz" — component này KHÔNG render nút, nút nằm trong sidebar của page.js. Component chỉ render modal khi `phase !== "idle"`.
- **loading**: Modal mở, hiển thị spinner + "AI đang tạo câu hỏi..."
- **quiz**: 5 câu hỏi, user chọn đáp án. Nút "Nộp bài" (disabled cho đến khi chọn đủ 5 câu).
- **result**: Hiển thị điểm X/5, từng câu highlight xanh (đúng) / đỏ (sai) / xám (không chọn). Nút "Đóng".

**API call:**
```javascript
const res = await fetch(`${API_URL}/api/recommendations/quiz`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ materialId }),
});
```

**Exposed interface:** Component nhận thêm prop `open` và `onClose` từ page.js để page.js control khi nào mở modal.

Hoặc đơn giản hơn: component tự quản lý `isOpen` state, nhưng nút bấm nằm trong page.js và gọi một `ref` function. 

**Cách đơn giản nhất:** Dùng `forwardRef` + `useImperativeHandle` để expose `openQuiz()` function cho page.js gọi, hoặc đơn giản hơn nữa: truyền `isOpen` và `onClose` như props từ page.js.

**Chọn cách đơn giản: truyền `isOpen` + `onClose` props:**

```javascript
// DocumentQuiz.js
export default function DocumentQuiz({ materialId, hasContent, isOpen, onClose }) { ... }

// page.js
const [quizOpen, setQuizOpen] = useState(false);
<DocumentQuiz materialId={doc._id} hasContent={doc.hasContentText} isOpen={quizOpen} onClose={() => setQuizOpen(false)} />
```

Nút "Tạo Quiz" trong sidebar của page.js gọi `setQuizOpen(true)`.

**Scoring:** `score = questions.filter((q, i) => selected[i] === q.answer).length`

**Error handling:** 429 → "Bạn tạo quiz quá nhanh, chờ chút nhé." | khác → "AI đang bận, thử lại sau."

### 5. Trang chi tiết (`frontend/src/app/documents/[id]/page.js`)

Thêm:
- `import DocumentQuiz from "@/components/DocumentQuiz";`
- State: `const [quizOpen, setQuizOpen] = useState(false);`
- Nút "Tạo Quiz" trong sidebar (ngay sau Download card, khoảng dòng 965), chỉ render khi `doc.hasContentText`:

```jsx
{doc?.hasContentText && (
  <button
    onClick={() => setQuizOpen(true)}
    className="w-full py-4 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95"
  >
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
    Tạo Quiz
  </button>
)}
```

- Render `<DocumentQuiz>` ở cuối JSX (trước closing tag):

```jsx
<DocumentQuiz
  materialId={doc?._id}
  hasContent={doc?.hasContentText}
  isOpen={quizOpen}
  onClose={() => setQuizOpen(false)}
/>
```

---

## Error Handling

| Tình huống | Backend | Frontend |
|---|---|---|
| Không có `contentText` | 400 "chưa hỗ trợ quiz" | Nút không hiển thị |
| Document không tồn tại | 404 | Nút không hiển thị |
| GPT lỗi / parse fail | 500 | "AI đang bận..." |
| Rate limit | 429 | "Bạn tạo quiz quá nhanh..." |

---

## Files Changed

| File | Thay đổi |
|---|---|
| `Backend/services/aiService.js` | Thêm `generateQuiz` |
| `Backend/controllers/recommendationController.js` | Thêm `quizDocument`, import `generateQuiz` |
| `Backend/routes/recommendationRoutes.js` | Thêm `POST /quiz` |
| `frontend/src/components/DocumentQuiz.js` | Component mới |
| `frontend/src/app/documents/[id]/page.js` | Thêm nút + state + import DocumentQuiz |

---

## Out of Scope

- Lưu lịch sử quiz vào DB
- Leaderboard / điểm cao nhất
- Chọn số lượng câu hỏi
- Quiz cho video
- Auth cho quiz endpoint
