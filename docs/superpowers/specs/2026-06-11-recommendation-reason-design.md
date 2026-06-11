# Recommendation Reason Label — Design Spec

**Goal:** Hiển thị lý do tại sao mỗi tài liệu được AI gợi ý, ngay trên card trong trang `/ai-suggest`.

**Architecture:** Pure frontend — không cần thay đổi backend. Data `basedOn` và `categoryId.name` đã có sẵn trong response `/api/recommendations/for-you`. Thêm helper function + 1 dòng UI trên mỗi card.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS

---

## Logic

```javascript
const getReasonLabel = (doc, basedOn, isColdStart) => {
  if (isColdStart) return "Phổ biến trong cộng đồng";
  const cat = doc.categoryId?.name;
  const base = basedOn ? `"${basedOn.slice(0, 25)}${basedOn.length > 25 ? "…" : ""}"` : null;
  if (base && cat)  return `Tương tự ${base} · ${cat}`;
  if (base)         return `Dựa trên ${base}`;
  return "Phù hợp với sở thích của bạn";
};
```

**4 trường hợp:**

| Điều kiện | Output |
|---|---|
| `isColdStart = true` | "Phổ biến trong cộng đồng" |
| `basedOn` + `category` có | "Tương tự '[basedOn]' · [category]" |
| Chỉ có `basedOn` | "Dựa trên '[basedOn]'" |
| Không có gì | "Phù hợp với sở thích của bạn" |

---

## UI

Thêm vào **cả 2 loại card** trong `/ai-suggest/page.js`:
- Featured card (top 2, `h-[180px]`)
- Regular grid card (3 cột, `h-[140px]`)

**Vị trí:** Dòng ngay sau `<h3>` title, trước phần author/metrics.

**Markup:**
```jsx
<p className="flex items-center gap-1 text-[10px] text-emerald-400/70 font-medium mt-1 truncate">
  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" className="shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
  {getReasonLabel(doc, basedOn, isColdStart)}
</p>
```

**Styling:** `text-[10px]`, `text-emerald-400/70`, `truncate` — nhỏ, nhạt, không lấn át title.

---

## Files Changed

| File | Thay đổi |
|---|---|
| `frontend/src/app/ai-suggest/page.js` | Thêm `getReasonLabel`, thêm dòng UI vào featured card và grid card |

---

## Out of Scope

- Backend thay đổi
- GPT-generated explanation
- Hiển thị nhiều lý do (top 3 basedOn)
- Lý do trên trang `/documents/[id]`
