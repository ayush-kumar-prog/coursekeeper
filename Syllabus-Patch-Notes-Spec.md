# Syllabus Patch Notes — Project Context & Build Spec (LLM-Optimized)

This document gives an LLM everything needed to understand the **end goal**, **scope**, and **architecture** of our project. It is written to be precise, structured, and implementation-ready.

---

## 1) Problem & Goal

**Problem**: People have old university course materials (e.g., “Computer Vision 2010”) that become outdated. They want to **stay current year-by-year** without redoing an entire degree.

**Goal**: A web app where users upload a **slides/text PDF** of an old syllabus. The app creates a **Subject** (e.g., *Computer Vision*) with **year tiles** (2011…present). Clicking any year shows **“Patch Notes”** (web + PDF) summarizing what changed since the baseline (🔥 Major shifts, 🛠️ Tools, 📚 Resources, 🎯 Corrections, 🔮 Emerging), with **citations** and a short **delta learning path**.

---

## 2) UX Summary (No Graph UI)

- **Dashboard**: Subject cards (e.g., Computer Vision).  
- **Subject Timeline**: Year tiles from `baseline_year+1` → current.  
- **Year Page**: TL;DR bullets, sections (🔥/🛠️/📚/🎯/🔮), citations, **Download PDF**, **Email sent** confirmation.  
- **Upload Flow**: Upload PDF → baseline topics extracted → Subject card appears.  
- **Notifications**: Email with patch summary + PDF link on each generated year (manual or scheduled).

---

## 3) Minimal Sponsor Set (Required Integrations)

- **OpenAI** — LLM for:
  - Baseline extraction from syllabus (topics, methods, systems, readings, slide anchors).
  - Yearly **diff reasoning** (ADD/RENAME/DEPRECATE/CORRECT/EMERGE).
  - Writing Patch Notes content (TL;DR, sections, delta learning path).
- **Knowledge Base** — Trusted knowledge base (TBD):
  - Index & retrieve sources with **provenance** / confidence.
  - Enforce **"no citation → no claim"** (every claim must have ≥1–2 citations).
- **Apify** — Multi-source collection:
  - Fetch curated domain sources (e.g., arXiv, conference pages, top course pages, GitHub trending, vendor docs that we allow).
  - Normalize feeds into a standard schema and push to knowledge base.

**Email**: Resend or SMTP (not a sponsor).

*Everything runs on localhost or Vercel; DB is Vercel Postgres (Neon) or Supabase Postgres; local dev can use SQLite.*

---

## 4) Non-Goals (For Clarity)

- No WhatsApp/Intercom; delivery is via **email** and in-app web/PDF.
- No heavy event bus; cron can be a simple **Vercel Scheduled Function**.
- No AR/voice features.  
- No interactive graph UI.

---

## 5) Entities & Data Model (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  Subjects  Subject[]
}

model Subject {
  id           String   @id @default(cuid())
  userId       String
  title        String           // e.g., "Computer Vision"
  discipline   String           // "CS"|"BIO"|"ECON"|...
  baselineYear Int              // e.g., 2010
  createdAt    DateTime @default(now())
  uploads      Upload[]
  baseline     BaselineTopic[]
  runs         YearRun[]
  User         User     @relation(fields: [userId], references: [id])
}

model Upload {
  id        String   @id @default(cuid())
  subjectId String
  fileUrl   String
  pages     Int?
  createdAt DateTime @default(now())
  Subject   Subject  @relation(fields: [subjectId], references: [id])
}

model BaselineTopic {
  id         String  @id @default(cuid())
  subjectId  String
  name       String         // "SIFT", "Epipolar geometry"
  type       String         // "concept"|"method"|"system"|"paper"
  section    String?
  summary    String?
  sourcePage String?        // slide/page anchor
  Subject    Subject @relation(fields: [subjectId], references: [id])
  @@index([subjectId])
}

model YearRun {
  id         String   @id @default(cuid())
  subjectId  String
  year       Int              // 2011..Now
  status     String           // "pending"|"ok"|"failed"
  pdfUrl     String?
  webJsonUrl String?          // optional cache of rendered JSON
  tlDr       String?
  createdAt  DateTime @default(now())
  finishedAt DateTime?
  diffs      YearDiff[]
  Subject    Subject  @relation(fields: [subjectId], references: [id])
  @@index([subjectId, year])
}

model YearDiff {
  id         String   @id @default(cuid())
  runId      String
  changeType String   // "ADD"|"RENAME"|"DEPRECATE"|"CORRECT"|"EMERGE"|"HOTFIX"
  fromTitle  String?
  toTitle    String?
  rationale  String   // short "why"
  confidence Float
  evidence   Json     // [{canonId,title,url,venue,year}]
  YearRun    YearRun  @relation(fields: [runId], references: [id])
  @@index([runId])
}
```

---

## 6) API Surface (Next.js App Router)

- `POST /api/subjects` (multipart)  
  **Input**: `{file, title, baselineYear, discipline?}`  
  **Flow**: store file → OpenAI.extract_topics → save `BaselineTopic[]` → create Subject → return `{subjectId}`

- `GET /api/subjects`  
  **Output**: subject cards

- `GET /api/subjects/[id]/timeline`  
  **Output**: `[{year, status, tlDr}]`

- `POST /api/run`
  **Input**: `{subjectId, year}`
  **Flow**: map baseline→canon (KB+OpenAI) → classify changes → fetch citations (KB) → write Patch Notes (OpenAI) → render PDF → email → save `YearRun`

- `GET /api/runs/[runId]`  
  **Output**: `{status, pdfUrl, tlDr, sections, bibliography}`

- `GET /api/cron/generate?secret=CRON_SECRET`  
  **Flow**: find due subjects/years → call internal runner (same logic as `/api/run`)

---

## 7) Pipelines (Deterministic, Step-by-Step)

### A) Baseline Extraction (Upload → Baseline Topics)
1. Parse PDF (pdf.js; OCR if needed).  
2. **OpenAI** function-call `extract_topics(sections[], discipline)` → returns array:
   ```json
   [
     {"name":"SIFT","type":"method","section":"Feature Descriptors","summary":"...", "sourcePage":"p12"},
     {"name":"Epipolar geometry","type":"concept","section":"Geometry","summary":"...", "sourcePage":"p30"}
   ]
   ```
3. Persist `BaselineTopic[]`. Subject appears on dashboard.

**Hard rules**:
- If confidence < threshold, still persist partial baseline (autonomy).
- No citation requirement for baseline (it’s user-provided).

---

### B) Canon Build (Apify → Knowledge Base)
1. **Apify** discipline-specific actors fetch sources (example: CS/CV):
   - arXiv (cs.CV), CVPR/ICCV/ECCV proceedings pages, NeurIPS, top university course pages (CMU/Stanford), OpenCV/PyTorch docs, GitHub trending topics.
2. Normalize into:
   ```json
   { "title": "...", "url": "...", "venue": "CVPR", "year": 2014, "type": "paper|tool|course|concept", "summary": "..." }
   ```
3. Push to **Knowledge Base** for indexing; returns provenance IDs & confidences.
4. Optional: mirror metadata to our DB for analytics.

**Hard rules**:
- Maintain an **allow-list** of high-trust domains to reduce noise.
- Set a minimum authority threshold for inclusion (venue/year/peer-review).

---

### C) Year Diff & Write (Per Year y)
1. **Map** baseline topics ↔ canon items (`first_seen ≤ y` & active in year y):  
   - Alias rules + semantic similarity (OpenAI embeddings) + type matching.
2. **Classify** changes:
   - `ADD`: authoritative canon items not in baseline neighborhood (e.g., ViT in 2014).  
   - `RENAME`: strong alias cluster shows naming shift.  
   - `DEPRECATE`: usage drops, superseded by new practice.  
   - `CORRECT`: baseline misconception vs modern consensus.  
   - `EMERGE`: high momentum but lower authority (badge as exploratory).
3. **Citations via Knowledge Base**: retrieve ≥2 sources per claim; else mark `(Low evidence)` and still include with badge.  
4. **Write** Patch Notes (OpenAI function output strictly structured):
   ```json
   {
     "tldr": ["Major shift ...", "Rise of ...", "..."],
     "sections": {
       "major": [...],
       "tools": [...],
       "resources": [...],
       "corrections": [...],
       "emerging": [...]
     },
     "delta_path": [
       {"title":"Start here: ...", "hours":2, "link":"...", "type":"paper|video|doc"}
     ],
     "bibliography": [
       {"key":"src_1","title":"...", "url":"...", "venue":"CVPR", "year":2014}
     ]
   }
   ```
5. **Render** HTML → PDF (Playwright or @react-pdf/renderer).  
6. **Email** user (Resend/SMTP) with TL;DR + links (Year Page & PDF).  
7. Persist `YearRun`, `YearDiff[]`.

**Hard rules**:
- **No claim without a citation key** (except brief narrative glue).  
- Prefer peer-reviewed / textbooks; vendor docs okay but badge as such.  
- Respect an optional “peer-review only” mode per subject.

---

## 8) Prompts (LLM Contracts)

### `extract_topics` (Baseline)
- **System**: “You are extracting a topic map from course slides. Return only structured JSON via the function.”
- **User**: `{sections: [{title, text}], target_discipline}`
- **Function output schema**:
  ```json
  [{"name": "string", "type": "concept|method|system|paper", "section": "string", "summary":"string", "sourcePage":"string"}]
  ```

### `classify_diff` (Mapping & Change Types)
- **System**: “Given baseline topics and canon items (with years/venues), classify for year {y} into ADD/RENAME/DEPRECATE/CORRECT/EMERGE.”
- **User**: `{baseline_topics, canon_items_filtered_to_year_y, alias_map?}`
- **Output**: strictly typed JSON array of changes with rationale+confidence.

### `write_patch_notes` (Final Narrative)
- **System**: “Write Patch Notes for year {y} for a learner whose baseline was {baseline_year}. Every claim must include [src_key]. If <2 sources, append ‘(Low evidence)’. Include TL;DR, sections (major/tools/resources/corrections/emerging), a 4–8 hour delta_path, and a bibliography.”
- **User**: `{classified_changes, retrieved_citations_by_change}`
- **Output**: schema shown in **7.C step 4**.

---

## 9) Source Policy (Deterministic)

- **Allow-list** per discipline (seeded):
  - **CS/CV**: CVPR/ICCV/ECCV proceedings, arXiv cs.CV, NeurIPS, CMU/Stanford course pages, OpenCV/PyTorch docs, ImageNet pages, select respected blogs (label as “blog”).  
- **Authority ranking**: peer-reviewed (top-tier) > textbooks > canonical docs > reputable blogs.
- **Evidence requirement**: default ≥2 citations; allow single-source if “textbook-level” or “standard” and label as such.
- **Freshness**: prefer recent years when supporting a change claim; still cite historical origin when appropriate.

---

## 10) Email Notification (Resend)

**Trigger**: after `YearRun.status = "ok"`  
**Subject**: `Your {Subject} {Year} Patch Notes are ready`  
**Body**: TL;DR bullets → **Open Year Page** / **Download PDF**.

---

## 11) Scheduling

- **Manual**: `POST /api/run` for any year.  
- **Scheduled**: Vercel Cron → `/api/cron/generate?secret=...`:
  - Find subjects due for generation (e.g., annual at Jan 1).  
  - Generate missing years up to current year.

---

## 12) Security & Privacy

- Store uploads (PDFs) in private bucket (signed URLs).  
- PII: email only; no unnecessary user data.  
- Logs: never log full syllabus content; redact email & secrets.  
- PDF links: short-lived signed URLs.

---

## 13) Acceptance Criteria (Deterministic)

- Uploading “Computer Vision 2010.pdf” yields a Subject with baseline extracted topics.  
- Subject timeline renders year tiles from 2011 to current.  
- Clicking a year loads a Year Page with:  
  - TL;DR (3–5 bullets)  
  - Sections (🔥/🛠️/📚/🎯/🔮)  
  - Each bullet has **at least one [src_key]**; most have ≥2.  
  - **Delta path** totaling 4–8 hours with links.  
  - **Download PDF** renders identical content.  
- Email is sent after generation with TL;DR + links.  
- If citations fail, the item is either labeled “(Low evidence)” or omitted—no naked claims.

---

## 14) Demo Script (3 Minutes)

1) Upload *Computer Vision 2010.pdf* → Subject card appears.  
2) Open **Computer Vision** → timeline (2011…2025).  
3) Click **2014** → Year Page shows DL shift (CVPR’12–’14, ImageNet), 6-hour delta plan.  
4) Click **Download PDF** → open rendered doc.  
5) Show **email** with same TL;DR + links.  
6) Trigger `/api/run` for another year → refresh → email arrives.

---

## 15) Minimal Tech Choices

- **Frontend**: Next.js (App Router), Tailwind (optional).  
- **Backend APIs**: Next.js API routes.  
- **DB**: Supabase Postgres.  
- **Storage**: Vercel Blob.  
- **Email**: Resend (or SMTP).  
- **PDF**: Playwright or @react-pdf/renderer.  
- **LLM**: OpenAI (function calling + embeddings).  
- **KB**: Knowledge base solution TBD (index & retrieve with provenance).  
- **Collection**: Apify actors.

---

## 16) Implementation Order (Hackathon-Ready)

1. Prisma schema + migrations → Vercel Postgres.  
2. `/api/subjects` upload → OpenAI `extract_topics` → save baseline.  
3. Basic UI: Dashboard, Subject timeline, Year Page.  
4. Apify actor → push to knowledge base → confirm retrieval works.
5. `/api/run` → map/diff → KB citations → OpenAI write → render PDF → email.  
6. Cron endpoint → generate pending years.  
7. Polish: evidence badges, “Low evidence” labels, loading states.

---

## 17) Future Extensions (Post-hackathon)

- Per-subject **settings**: evidence threshold (peer-review only), focus areas.  
- **Hotfixes** (out-of-band major releases).  
- **User auth** (Supabase), **Row-Level Security**.  
- **Admin console** for source policies (StackAI-like).  
- **Redpanda/Sentry/TrueFoundry** for scale & observability (optional later).

---

**End of Spec.** This file is the single source of truth for the LLM to build the MVP: data model, routes, pipelines, prompts, source policy, and acceptance criteria—optimized for deterministic outputs and minimal ambiguity.
