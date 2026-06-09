# Embedding Upgrade — Switch to OpenAI + Query Expansion

**Date:** 2026-06-09  
**Status:** Approved for implementation

---

## Problem

The current embedding pipeline has three compounding issues:

1. **Token limit exceeded silently** — `gemini-embedding-001` has a 2048-token limit. The current `buildEmbeddingText` passes up to 8000 chars of raw content (~3000–5000 tokens), causing the model to silently truncate most of the document content. The extracted text is wasted.

2. **No task type differentiation** — Gemini requires `taskType: RETRIEVAL_DOCUMENT` when indexing and `RETRIEVAL_QUERY` when searching. Neither is set, reducing retrieval quality.

3. **Poor text weighting** — Title and description (the most reliable signals) have the same weight as any random sentence in the raw extracted content. A 10-word title competes equally with 8000 chars of noise.

Additionally, `generateMetadata()` uses Gemini Flash but has not been deployed to the upload flow — keeping a second AI provider with no active use.

---

## Solution Overview

Replace Gemini with OpenAI across all AI tasks:

| Task | Before | After |
|---|---|---|
| Embedding | `gemini-embedding-001` (768 dims, 2048 token limit) | `text-embedding-3-small` (1536 dims, 8191 token limit) |
| Metadata generation | `gemini-flash-latest` (unused in upload flow) | `gpt-4o-mini` |
| Query expansion | none | `gpt-4o-mini` expands query before embedding |
| Provider count | 2 (Gemini + none) | 1 (OpenAI only) |

---

## Part 1 — Embedding Provider

**Model:** `text-embedding-3-small`  
**Dimensions:** 1536  
**Token limit:** 8191  
**Cost:** $0.02 / 1M tokens (~$0.002 to re-embed all 103 documents)

Remove `@google/generative-ai` dependency. Add `openai` package. All calls to `generateEmbedding()` remain unchanged — only `geminiService.js` changes internally.

---

## Part 2 — Text Construction (`buildEmbeddingText`)

**New format:**
```
{title}
{title}
{description}
{first 1500 chars of contentText}
```

Rules:
- Title repeated twice to increase its weight relative to content
- No prefix labels ("Tiêu đề:", "Mô tả:") — OpenAI does not need them
- Content capped at 1500 chars: the intro/abstract is the most representative part of an academic document
- Total: ~2000–2500 chars (~600–750 tokens) — well within the 8191 token limit
- If no content extracted (e.g., image-only PDF): title + description only

---

## Part 3 — Metadata Generation

Replace `gemini-flash-latest` with `gpt-4o-mini` in `generateMetadata()`.

- Same prompt structure, same JSON output schema (`title`, `description`, `categoryId`, `majorId`)
- GPT-4o-mini has better structured JSON output reliability
- Removes the last dependency on Gemini — `GEMINI_API_KEY` can be removed from `.env`

---

## Part 4 — Query Expansion

Before embedding a user's search query, expand it using `gpt-4o-mini`:

**Input:** `"web"`  
**Expanded:** `"web development frontend backend HTML CSS JavaScript HTTP REST API"`

**Input:** `"đại số"`  
**Expanded:** `"đại số tuyến tính ma trận vector không gian tuyến tính định thức"`

Rules:
- Expansion prompt: return a single line of space-separated keywords (no JSON, no explanation)
- Max 20 words in expansion
- If GPT call fails → fall back to original query (non-blocking)
- Applied only to semantic search (`/api/recommendations/search`) — NOT to personalization or similar-docs (those use material embeddings directly)

---

## Architecture After Changes

```
Upload flow:
  extractText() → buildEmbeddingText() → openai.embeddings.create() → save to DB

Search flow:
  user query → gpt-4o-mini expand → openai.embeddings.create() → $vectorSearch → results

Similar docs / For You:
  material embedding → $vectorSearch → results  (no query expansion needed)

Metadata (auto_seed.js):
  contentText → gpt-4o-mini → {title, description, categoryId, majorId}
```

---

## Files Changed

| File | Change |
|---|---|
| `Backend/services/geminiService.js` | Replace Gemini SDK with OpenAI SDK; rewrite `generateEmbedding()` and `generateMetadata()`; add `expandQuery()` |
| `Backend/controllers/materialController.js` | Update import from `geminiService` → `embeddingService` (rename or keep same name) |
| `Backend/services/recommendationService.js` | Call `expandQuery()` before embedding the search query in `semanticSearch()` |
| `Backend/scripts/generate_embeddings.js` | Update import to use new `generateEmbedding()` |
| `Backend/scripts/eval_prep.js` | Update import |
| `Backend/.env` | Add `OPENAI_API_KEY`, remove `GEMINI_API_KEY` |
| `Backend/package.json` | Add `openai`, remove `@google/generative-ai` |

---

## MongoDB Atlas Migration

The vector index must be recreated because dimensions change from 768 → 1536.

Steps (done manually in Atlas UI):
1. Go to Atlas → Search Indexes
2. Delete the existing `vector_index` on the `materials` collection
3. Create new index with this config:
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
4. Run `generate_embeddings.js ALL=1` to re-embed all 103 documents

During migration (between deleting old index and re-embedding), AI search returns empty results. This is expected and temporary (~2–3 minutes).

---

## Environment Variables

```env
# Remove:
# GEMINI_API_KEY=...

# Add:
OPENAI_API_KEY=sk-proj-...
```

---

## Success Criteria

- All 103 documents have `embedding` array of length 1536
- Semantic search returns relevant results for both topic queries ("lập trình web") and content-specific queries ("nodemailer", "SQL JOIN")
- Query expansion visibly broadens narrow queries without breaking broad queries
- No Gemini dependency remains in production code
