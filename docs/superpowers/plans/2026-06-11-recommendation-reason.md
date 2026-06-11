# Recommendation Reason Label — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị lý do tại sao mỗi tài liệu được gợi ý ngay trên card trong trang `/ai-suggest`.

**Architecture:** Pure frontend — thêm helper function `getReasonLabel` và 1 dòng JSX vào mỗi card. Không cần thay đổi backend vì `basedOn` và `categoryId.name` đã có trong response hiện tại.

**Tech Stack:** Next.js App Router, React, Tailwind CSS

---

## Files Changed

| File | Thay đổi |
|---|---|
| `frontend/src/app/ai-suggest/page.js` | Thêm `getReasonLabel` helper + dòng reason label vào featured card (lines ~397-399) và grid card (lines ~479-481) |

---

## Task 1: Thêm reason label vào cả hai loại card

**Files:**
- Modify: `frontend/src/app/ai-suggest/page.js`

### Context để hiểu file

File `page.js` có 2 loại card:
- **Featured card** (top 2): vòng lặp ở `filteredItems.slice(0, 2).map(...)`, `<h3>` title ở khoảng dòng 397-399
- **Grid card** (còn lại): vòng lặp ở `filteredItems.slice(2).map(...)`, `<h3>` title ở khoảng dòng 479-481

Data `basedOn` và `isColdStart` đã có trong component state (`const [basedOn, setBasedOn] = useState(null)` và `const [isColdStart, setIsColdStart] = useState(false)`).

---

- [ ] **Step 1: Thêm helper function `getReasonLabel`**

Thêm vào sau `getScoreInfo` (sau dòng `const FILTERS = [...]` là không đúng, phải thêm vào khu vực helper functions ở đầu file, sau `getScoreInfo`):

```javascript
const getReasonLabel = (doc, basedOn, isColdStart) => {
  if (isColdStart) return "Phổ biến trong cộng đồng";
  const cat = doc.categoryId?.name;
  const base = basedOn
    ? `"${basedOn.slice(0, 25)}${basedOn.length > 25 ? "…" : ""}"`
    : null;
  if (base && cat) return `Tương tự ${base} · ${cat}`;
  if (base)        return `Dựa trên ${base}`;
  return "Phù hợp với sở thích của bạn";
};
```

Vị trí chính xác — thêm sau khối `const FILTERS`:

```javascript
// ... (FILTERS array kết thúc)
];

const getReasonLabel = (doc, basedOn, isColdStart) => {
  // ... (code trên)
};

function FileIcon({ type, color, size = 40 }) {
// ...
```

- [ ] **Step 2: Thêm reason label vào featured card**

Tìm đoạn này trong **featured card** (vòng lặp `filteredItems.slice(0, 2).map`):

```jsx
                            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                              {doc.title}
                            </h3>
                            {doc.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                            )}
```

Thay bằng:

```jsx
                            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                              {doc.title}
                            </h3>
                            <p className="flex items-center gap-1 text-[10px] text-emerald-500/70 font-medium mb-2 truncate">
                              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                              </svg>
                              {getReasonLabel(doc, basedOn, isColdStart)}
                            </p>
                            {doc.description && (
                              <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                            )}
```

> **Lưu ý:** `mb-2` trên `<h3>` đổi thành `mb-1` để tránh khoảng cách quá lớn.

- [ ] **Step 3: Thêm reason label vào grid card**

Tìm đoạn này trong **grid card** (vòng lặp `filteredItems.slice(2).map`):

```jsx
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors duration-200">
                            {doc.title}
                          </h3>
                          {doc.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                          )}
```

Thay bằng:

```jsx
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors duration-200">
                            {doc.title}
                          </h3>
                          <p className="flex items-center gap-1 text-[10px] text-emerald-500/70 font-medium mb-2 truncate">
                            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                            </svg>
                            {getReasonLabel(doc, basedOn, isColdStart)}
                          </p>
                          {doc.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1">{doc.description}</p>
                          )}
```

- [ ] **Step 4: Kiểm tra visual**

Mở trình duyệt tại `http://localhost:3000/ai-suggest` (cần đăng nhập).

Kiểm tra:
- Mỗi card hiển thị 1 dòng nhỏ bên dưới title với icon sparkle + text lý do
- Cold-start user: tất cả card hiện "Phổ biến trong cộng đồng"
- Personalized user: card hiện "Tương tự '[tên doc]' · [category]" hoặc "Dựa trên '[tên doc]'"
- Text truncate đúng nếu `basedOn` dài (không bị overflow)
- Layout card không bị vỡ (chiều cao card vẫn ổn định)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/ai-suggest/page.js
git commit -m "feat: add AI recommendation reason label to each card"
```

---

## Self-Review Checklist

- [x] Spec coverage: `getReasonLabel` 4 cases ✅, cả 2 loại card ✅, `truncate` ✅
- [x] Placeholder scan: không có TBD/TODO
- [x] Type consistency: `getReasonLabel(doc, basedOn, isColdStart)` — signature nhất quán ở cả 2 nơi gọi
