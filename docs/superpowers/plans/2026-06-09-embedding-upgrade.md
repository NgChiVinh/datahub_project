# Embedding Upgrade — Switch to OpenAI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Gemini embedding with OpenAI `text-embedding-3-small`, add query expansion via `gpt-4o-mini`, and fix text construction so title/description are properly weighted.

**Architecture:** Create `aiService.js` as the single AI provider file (replaces `geminiService.js`). All embedding callers import from this one file — `materialController.js`, `recommendationService.js`, and all scripts. MongoDB Atlas vector index must be recreated (dims 768 → 1536) before re-embedding the full DB.

**Tech Stack:** `openai` npm package (v4), `text-embedding-3-small` for embeddings, `gpt-4o-mini` for metadata and query expansion, MongoDB Atlas Vector Search.

---

## File Map

| Action | File |
|---|---|
| **Create** | `Backend/services/aiService.js` |
| **Modify** | `Backend/controllers/materialController.js` |
| **Modify** | `Backend/services/recommendationService.js` |
| **Modify** | `Backend/scripts/generate_embeddings.js` |
| **Modify** | `Backend/scripts/eval_prep.js` |
| **Modify** | `Backend/scripts/evaluate.js` |
| **Modify** | `Backend/scripts/evaluate_content.js` |
| **Modify** | `Backend/scripts/auto_seed.js` |
| **Delete** | `Backend/services/geminiService.js` |
| **Modify** | `Backend/.env` (add OPENAI_API_KEY, remove GEMINI_API_KEY) |
| **Modify** | `Backend/package.json` (add openai, remove @google/generative-ai) |
| **Create** | `Backend/scripts/test_ai_service.js` (quick verification script) |

---

## Task 1: Install `openai` package

**Files:**
- Modify: `Backend/package.json`

- [ ] **Step 1: Install the package**

```bash
cd Backend
npm install openai
```

Expected output: `added X packages` with `openai` listed.

- [ ] **Step 2: Verify installation**

```bash
node -e "require('openai'); console.log('openai OK')"
```

Expected: `openai OK`

- [ ] **Step 3: Add OPENAI_API_KEY to .env**

Open `Backend/.env` and add this line (replace with your actual key):
```
OPENAI_API_KEY=sk-proj-your-key-here
```

Also remove or comment out `GEMINI_API_KEY` if it exists:
```
# GEMINI_API_KEY=...
```

- [ ] **Step 4: Commit**

```bash
git add Backend/package.json Backend/package-lock.json
git commit -m "chore: add openai package"
```

---

## Task 2: Create `aiService.js`

**Files:**
- Create: `Backend/services/aiService.js`
- Delete: `Backend/services/geminiService.js` (after this task)

- [ ] **Step 1: Create the file**

Create `Backend/services/aiService.js` with this exact content:

```javascript
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Dựng text để embed: lặp title 2x để tăng trọng số,
// chỉ lấy 1500 chars đầu content (phần intro đại diện nhất).
const buildEmbeddingText = (title, description, content) => {
  const t = title || "";
  const d = description || "";
  const header = `${t}\n${t}\n${d}`;
  if (!content) return header;
  return `${header}\n${content.slice(0, 1500)}`;
};

const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    return [];
  }
};

const generateMetadata = async (contentText, categories = [], majors = []) => {
  try {
    const categoriesList = categories
      .map((c) => `- ${c.name} (ID: ${c._id})`)
      .join("\n");
    const majorsList = majors
      .map((m) => `- ${m.name} (ID: ${m._id})`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Dựa trên nội dung tài liệu học tập dưới đây, hãy:
1. Tạo tiêu đề ngắn gọn, chuyên nghiệp.
2. Viết mô tả tóm tắt hấp dẫn.
3. Chọn 1 Danh mục và 1 Chuyên ngành phù hợp nhất.

DANH SÁCH DANH MỤC:
${categoriesList}

DANH SÁCH CHUYÊN NGÀNH:
${majorsList}

Trả về JSON: {"title":"...","description":"...","categoryId":"...","majorId":"..."}
Chỉ trả về duy nhất chuỗi JSON.

Nội dung: ${contentText.slice(0, 3000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating metadata:", error.message);
    return {
      title: "Tài liệu chưa đặt tên",
      description: "Chưa có mô tả",
      categoryId: null,
      majorId: null,
    };
  }
};

// Mở rộng query trước khi embed để cải thiện recall.
// Fallback về query gốc nếu API lỗi — không bao giờ block luồng search.
const expandQuery = async (query) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Mở rộng từ khóa tìm kiếm sau thành các từ liên quan (tối đa 20 từ, cách nhau bằng dấu cách, không giải thích, không xuống dòng):
"${query}"`,
        },
      ],
      max_tokens: 60,
    });
    const expanded = response.choices[0].message.content.trim();
    return expanded || query;
  } catch (error) {
    console.error("Error expanding query, using original:", error.message);
    return query;
  }
};

module.exports = { generateEmbedding, generateMetadata, expandQuery, buildEmbeddingText };
```

- [ ] **Step 2: Write a quick verification script**

Create `Backend/scripts/test_ai_service.js`:

```javascript
const assert = require("assert");
const { buildEmbeddingText, generateEmbedding, expandQuery } = require("../services/aiService");
require("dotenv").config();

async function run() {
  // Test 1: buildEmbeddingText repeats title
  const text = buildEmbeddingText("React Hooks", "Hướng dẫn React", "useState useEffect");
  assert(text.startsWith("React Hooks\nReact Hooks"), "title phải lặp 2 lần");
  assert(text.includes("useState"), "content phải có mặt");
  console.log("✓ buildEmbeddingText đúng format");

  // Test 2: buildEmbeddingText không có content
  const noContent = buildEmbeddingText("Title", "Desc", "");
  assert(!noContent.includes("\n\n"), "không có content thừa");
  console.log("✓ buildEmbeddingText không content: OK");

  // Test 3: content bị cắt tại 1500 chars
  const longContent = "x".repeat(3000);
  const trimmed = buildEmbeddingText("T", "D", longContent);
  assert(trimmed.length < 1600 + 10, "content phải bị cắt ở 1500");
  console.log("✓ buildEmbeddingText cắt content tại 1500: OK");

  // Test 4: generateEmbedding trả vector 1536 chiều
  console.log("Đang gọi OpenAI embedding API...");
  const vector = await generateEmbedding("test embedding vector");
  assert(Array.isArray(vector), "kết quả phải là mảng");
  assert(vector.length === 1536, `dims phải là 1536, nhận được ${vector.length}`);
  console.log(`✓ generateEmbedding trả ${vector.length} dims`);

  // Test 5: expandQuery trả chuỗi
  console.log("Đang gọi expandQuery...");
  const expanded = await expandQuery("web");
  assert(typeof expanded === "string" && expanded.length > 0, "expandQuery phải trả chuỗi");
  console.log(`✓ expandQuery("web") → "${expanded}"`);

  console.log("\nTất cả tests PASS ✓");
}

run().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Run the verification script**

```bash
cd Backend
node scripts/test_ai_service.js
```

Expected output:
```
✓ buildEmbeddingText đúng format
✓ buildEmbeddingText không content: OK
✓ buildEmbeddingText cắt content tại 1500: OK
Đang gọi OpenAI embedding API...
✓ generateEmbedding trả 1536 dims
Đang gọi expandQuery...
✓ expandQuery("web") → "web development frontend backend HTML CSS..."
Tất cả tests PASS ✓
```

- [ ] **Step 4: Delete geminiService.js**

```bash
del Backend\services\geminiService.js
```

- [ ] **Step 5: Commit**

```bash
git add Backend/services/aiService.js Backend/scripts/test_ai_service.js
git commit -m "feat: add aiService.js with OpenAI embedding, metadata, query expansion"
```

---

## Task 3: Update `materialController.js`

**Files:**
- Modify: `Backend/controllers/materialController.js:17-34`

- [ ] **Step 1: Replace import + remove local functions**

Find and replace lines 17–34 in `materialController.js`:

**Remove these lines (17–34):**
```javascript
const { generateEmbedding } = require("../services/geminiService");

// Dựng chuỗi văn bản để sinh embedding từ tiêu đề + mô tả + nội dung trích từ file.
// Nội dung file là tín hiệu ngữ nghĩa quan trọng nhất; tiêu đề/mô tả bổ trợ.
const buildEmbeddingText = (title, description, content) => {
  let text = "Tiêu đề: " + (title || "") + ". Mô tả: " + (description || "");
  if (content) text += ". Nội dung: " + content;
  return text;
};

// Sinh embedding an toàn: trả mảng rỗng nếu lỗi (đã log bên trong generateEmbedding).
const safeGenerateEmbedding = async (title, description, content) => {
  try {
    return await generateEmbedding(buildEmbeddingText(title, description, content));
  } catch (aiError) {
    console.error("AI Embedding error:", aiError.message);
    return [];
  }
};
```

**Replace with:**
```javascript
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");

const safeGenerateEmbedding = async (title, description, content) => {
  try {
    return await generateEmbedding(buildEmbeddingText(title, description, content));
  } catch (aiError) {
    console.error("AI Embedding error:", aiError.message);
    return [];
  }
};
```

- [ ] **Step 2: Verify no syntax errors**

```bash
cd Backend
node -e "require('./controllers/materialController.js'); console.log('OK')"
```

Expected: `OK` (no error)

- [ ] **Step 3: Commit**

```bash
git add Backend/controllers/materialController.js
git commit -m "refactor: materialController uses aiService for embedding"
```

---

## Task 4: Update `recommendationService.js`

**Files:**
- Modify: `Backend/services/recommendationService.js:1-3` (import)
- Modify: `Backend/services/recommendationService.js:98-103` (semanticSearch)

- [ ] **Step 1: Update import (line 3)**

**From:**
```javascript
const { generateEmbedding } = require("./geminiService");
```

**To:**
```javascript
const { generateEmbedding, expandQuery } = require("./aiService");
```

- [ ] **Step 2: Add query expansion in `semanticSearch` (line 100)**

**From:**
```javascript
const semanticSearch = async (query, limit = 10) => {
  try {
    const queryVector = await generateEmbedding(query);
```

**To:**
```javascript
const semanticSearch = async (query, limit = 10) => {
  try {
    const expandedQuery = await expandQuery(query);
    const queryVector = await generateEmbedding(expandedQuery);
```

- [ ] **Step 3: Verify no syntax errors**

```bash
cd Backend
node -e "require('./services/recommendationService.js'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add Backend/services/recommendationService.js
git commit -m "feat: add query expansion to semanticSearch via aiService"
```

---

## Task 5: Update all scripts

**Files:**
- Modify: `Backend/scripts/generate_embeddings.js`
- Modify: `Backend/scripts/eval_prep.js`
- Modify: `Backend/scripts/evaluate.js`
- Modify: `Backend/scripts/evaluate_content.js`
- Modify: `Backend/scripts/auto_seed.js`

- [ ] **Step 1: Update `generate_embeddings.js`**

Line 5 — change import:
```javascript
// From:
const { generateEmbedding } = require("../services/geminiService");
// To:
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");
```

Lines 41–45 — remove local `buildText` function entirely:
```javascript
// Delete these lines:
const buildText = (title, description, content) => {
  let t = "Tiêu đề: " + (title || "") + ". Mô tả: " + (description || "");
  if (content) t += ". Nội dung: " + content;
  return t;
};
```

Find the call site (around line 139–141):
```javascript
// From:
const vector = await generateEmbedding(
  buildText(m.title, m.description, content),
);
// To:
const vector = await generateEmbedding(
  buildEmbeddingText(m.title, m.description, content),
);
```

Also update the comment on line 15 — remove "CONTENT_ONLY: chỉ trích + lưu contentText, KHÔNG gọi Gemini":
```javascript
// From:
// CONTENT_ONLY: chỉ trích + lưu contentText, KHÔNG gọi Gemini (không tốn quota).
// To:
// CONTENT_ONLY: chỉ trích + lưu contentText, không gọi embedding API.
```

- [ ] **Step 2: Update `eval_prep.js`**

Change import line:
```javascript
// From:
const { generateEmbedding } = require("../services/geminiService");
// To:
const { generateEmbedding, buildEmbeddingText } = require("../services/aiService");
```

If `eval_prep.js` has a local `buildText` function, delete it and use imported `buildEmbeddingText` instead.

- [ ] **Step 3: Update `evaluate.js`**

```javascript
// From:
const { generateEmbedding } = require("../services/geminiService");
// To:
const { generateEmbedding } = require("../services/aiService");
```

- [ ] **Step 4: Update `evaluate_content.js`**

```javascript
// From:
const { generateEmbedding } = require("../services/geminiService");
// To:
const { generateEmbedding } = require("../services/aiService");
```

- [ ] **Step 5: Update `auto_seed.js`**

```javascript
// From:
const { generateMetadata, generateEmbedding } = require("../services/geminiService");
// To:
const { generateMetadata, generateEmbedding, buildEmbeddingText } = require("../services/aiService");
```

If `auto_seed.js` builds embedding text inline, update to use `buildEmbeddingText`.

- [ ] **Step 6: Remove `@google/generative-ai` package**

```bash
cd Backend
npm uninstall @google/generative-ai
```

Expected: package removed from `node_modules` and `package.json`.

- [ ] **Step 7: Verify all scripts load without error**

```bash
cd Backend
node -e "require('./scripts/generate_embeddings.js')" 2>&1 | head -5
node -e "require('./services/recommendationService.js'); console.log('rec OK')"
```

Expected: no `Cannot find module` errors.

- [ ] **Step 8: Commit**

```bash
git add Backend/scripts/ Backend/package.json Backend/package-lock.json
git commit -m "refactor: all scripts migrated from geminiService to aiService"
```

---

## Task 6: Recreate MongoDB Atlas vector index

**This step is done manually in the Atlas web UI — no code changes.**

- [ ] **Step 1: Open Atlas Search Indexes**

Go to: `cloud.mongodb.com` → your cluster → **Search** tab → **Atlas Search** → find index named `vector_index` on the `materials` collection.

- [ ] **Step 2: Delete the existing index**

Click the `vector_index` index → **Delete** → confirm. The index is now gone. AI search will return empty results until Step 4 is complete — this is expected.

- [ ] **Step 3: Create new index with 1536 dimensions**

Click **Create Index** → choose **JSON Editor** → paste this config:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

Set index name to `vector_index` (same name as before). Click **Create**.

Wait for status to show **Active** (usually ~30 seconds).

- [ ] **Step 4: Verify index is active**

In Atlas UI, the index status should be **Active**. No code step needed.

---

## Task 7: Re-embed all documents + verify

**Files:**
- Run: `Backend/scripts/generate_embeddings.js`

- [ ] **Step 1: Run the re-embed script**

```bash
cd Backend
ALL=1 node scripts/generate_embeddings.js
```

Expected output: progress dots (`.`) for each document. Final summary showing ~103 successes, 0 failures.

If any files fail (network timeout from Cloudinary/R2), re-run — the script skips docs that already have embeddings unless `ALL=1`.

- [ ] **Step 2: Verify embedding dimensions in MongoDB**

```bash
cd Backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const Material = require('./models/Material');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const sample = await Material.findOne({ embedding: { \$exists: true, \$not: { \$size: 0 } } });
  console.log('dims:', sample.embedding.length);
  const total = await Material.countDocuments({ embedding: { \$exists: true } });
  const missing = await Material.countDocuments({ \$or: [{ embedding: { \$exists: false } }, { embedding: { \$size: 0 } }] });
  console.log('total embedded:', total, '| missing:', missing);
  mongoose.disconnect();
});
"
```

Expected:
```
dims: 1536
total embedded: 103 | missing: 0
```

- [ ] **Step 3: Test semantic search end-to-end**

Start the backend server, then run:

```bash
curl "http://localhost:5000/api/recommendations/search?q=react&limit=3"
```

Expected: JSON array with 1–3 documents. If empty, check that Atlas index is **Active** and embeddings are 1536 dims.

- [ ] **Step 4: Test query expansion is working**

Add a temporary `console.log` in `recommendationService.js` line 100:

```javascript
const expandedQuery = await expandQuery(query);
console.log(`[search] "${query}" → "${expandedQuery}"`);
const queryVector = await generateEmbedding(expandedQuery);
```

Run the curl from Step 3 and check server logs. Expected log:
```
[search] "react" → "React JavaScript library frontend UI components hooks state management..."
```

Remove the `console.log` after verification.

- [ ] **Step 5: Commit**

```bash
git add Backend/services/recommendationService.js
git commit -m "feat: embedding upgrade complete — OpenAI text-embedding-3-small + query expansion"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✓ Task 2: Replace Gemini embedding with `text-embedding-3-small`
- ✓ Task 2: Fix `buildEmbeddingText` (title×2 + 1500 chars)
- ✓ Task 2: `generateMetadata` moved to `gpt-4o-mini`
- ✓ Task 4: Query expansion in `semanticSearch`
- ✓ Task 6: MongoDB Atlas index recreated (1536 dims)
- ✓ Task 7: Re-embed 103 documents
- ✓ Task 1: `OPENAI_API_KEY` in `.env`, `GEMINI_API_KEY` removed

**All function names consistent:**
- `buildEmbeddingText` — defined in Task 2, imported in Tasks 3 and 5
- `generateEmbedding` — defined in Task 2, used in Tasks 3, 4, 5
- `expandQuery` — defined in Task 2, imported in Task 4
- `generateMetadata` — defined in Task 2, imported in Task 5 (auto_seed.js)

**No placeholders:** All steps have exact code or exact commands.
