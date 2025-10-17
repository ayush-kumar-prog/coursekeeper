# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CourseKeeper** (Syllabus Patch Notes) is a continuing education web app for an Intercom Hackathon. Users upload old course syllabi (e.g., "Computer Vision 2010.pdf"), and the system generates year-by-year "Patch Notes" showing what changed in the field from their baseline year to present, with citations and learning paths.

**Key Insight**: Think of it like software patch notes, but for knowledge domains. Each year gets patch notes with sections: 🔥 Major shifts, 🛠️ Tools, 📚 Resources, 🎯 Corrections, 🔮 Emerging.

## Primary Reference Document

**Syllabus-Patch-Notes-Spec.md** is the single source of truth for the MVP. It contains:
- Complete data model (Prisma schema)
- API routes and flows
- Step-by-step pipelines
- LLM prompt contracts
- Source policies
- Implementation order

Always consult this file for implementation details.

## Data Model (Prisma)

User → Subject (e.g., "Computer Vision", baselineYear: 2010)
  ├── Upload[] (PDF syllabi)
  ├── BaselineTopic[] (extracted: "SIFT", "Epipolar geometry", etc.)
  └── YearRun[] (patch notes for 2011, 2012, ..., 2025)
      └── YearDiff[] (individual changes: ADD/RENAME/DEPRECATE/CORRECT/EMERGE)

**Key Models**:
- `User` - email, id
- `Subject` - title, discipline, baselineYear
- `BaselineTopic` - name, type (concept|method|system|paper), section, summary, sourcePage
- `YearRun` - year, status (pending|ok|failed), pdfUrl, tlDr
- `YearDiff` - changeType, fromTitle, toTitle, rationale, confidence, evidence (JSON)

See Syllabus-Patch-Notes-Spec.md section 5 for full schema.

## API Routes (Next.js App Router)

- `POST /api/subjects` - Upload PDF → extract baseline topics → create Subject
- `GET /api/subjects` - List subject cards
- `GET /api/subjects/[id]/timeline` - Year tiles (2011→current)
- `POST /api/run` - Generate patch notes for a specific {subjectId, year}
- `GET /api/runs/[runId]` - Retrieve patch notes (status, pdfUrl, tlDr, sections, bibliography)
- `GET /api/cron/generate?secret=CRON_SECRET` - Scheduled generation for due subjects

## Core Pipelines

### A) Baseline Extraction (Upload → Topics)

1. Parse PDF (pdf.js or OCR)
2. OpenAI function-call: `extract_topics(sections[], discipline)`
3. Returns: `[{name, type, section, summary, sourcePage}]`
4. Persist as `BaselineTopic[]`

**Hard Rules**:
- No citation requirement for baseline (user-provided)
- Persist partial baseline if confidence is low (autonomy)

### B) Canon Build (Apify → Knowledge Base)

1. Apify actors fetch discipline-specific sources:
   - CS/CV: arXiv cs.CV, CVPR/ICCV/ECCV, NeurIPS, CMU/Stanford courses, OpenCV/PyTorch docs, GitHub trending
2. Normalize to: `{title, url, venue, year, type, summary}`
3. Push to knowledge base for indexing (returns provenance IDs + confidence)

**Hard Rules**:
- Maintain allow-list of high-trust domains
- Set minimum authority threshold (peer-review, venue, year)

### C) Year Diff & Write (Per Year)

1. **Map** baseline topics ↔ canon items (aliases + OpenAI embeddings + type matching)
2. **Classify** changes:
   - `ADD` - New authoritative items not in baseline
   - `RENAME` - Naming shift via alias clusters
   - `DEPRECATE` - Usage dropped, superseded
   - `CORRECT` - Baseline misconception vs modern consensus
   - `EMERGE` - High momentum, lower authority (badge as exploratory)
3. **Fetch citations** from knowledge base (≥2 sources per claim; else mark "Low evidence")
4. **Write patch notes** (OpenAI structured output):
   ```json
   {
     "tldr": ["Major shift ...", "Rise of ..."],
     "sections": {"major": [...], "tools": [...], "resources": [...], "corrections": [...], "emerging": [...]},
     "delta_path": [{"title":"...", "hours":2, "link":"...", "type":"paper|video|doc"}],
     "bibliography": [{"key":"src_1", "title":"...", "url":"...", "venue":"CVPR", "year":2014}]
   }
   ```
5. **Render** HTML → PDF (Playwright or @react-pdf/renderer)
6. **Email** user (Resend/SMTP)
7. Persist `YearRun` + `YearDiff[]`

**Hard Rules**:
- **No claim without a citation key** (except brief narrative glue)
- Prefer peer-reviewed > textbooks > canonical docs > blogs
- Badge vendor docs appropriately
- Optional "peer-review only" mode per subject

## LLM Prompt Contracts

### `extract_topics` (Baseline)
- **System**: "You are extracting a topic map from course slides. Return only structured JSON via the function."
- **Input**: `{sections: [{title, text}], target_discipline}`
- **Output**: `[{name, type, section, summary, sourcePage}]`

### `classify_diff` (Mapping & Changes)
- **System**: "Given baseline topics and canon items (with years/venues), classify for year {y} into ADD/RENAME/DEPRECATE/CORRECT/EMERGE."
- **Input**: `{baseline_topics, canon_items_filtered_to_year_y, alias_map?}`
- **Output**: Strictly typed JSON with rationale + confidence

### `write_patch_notes` (Final Narrative)
- **System**: "Write Patch Notes for year {y} for a learner whose baseline was {baseline_year}. Every claim must include [src_key]. If <2 sources, append '(Low evidence)'. Include TL;DR, sections (major/tools/resources/corrections/emerging), a 4–8 hour delta_path, and a bibliography."
- **Input**: `{classified_changes, retrieved_citations_by_change}`
- **Output**: Schema from pipeline C step 4

## Source Policy

- **Allow-list** per discipline (CS/CV example): CVPR/ICCV/ECCV, arXiv cs.CV, NeurIPS, CMU/Stanford courses, OpenCV/PyTorch docs, select blogs (labeled)
- **Authority ranking**: Peer-reviewed (top-tier) > textbooks > canonical docs > reputable blogs
- **Evidence requirement**: Default ≥2 citations; single source OK if "textbook-level" (label as such)
- **Freshness**: Prefer recent for change claims; cite historical origin when appropriate

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind (optional)
- **Backend**: Next.js API routes
- **Database**: Vercel Postgres (Neon) or Supabase Postgres + Prisma ORM
- **Storage**: Vercel Blob or S3 (for PDFs with signed URLs)
- **Email**: Resend or SMTP
- **PDF Rendering**: Playwright or @react-pdf/renderer
- **LLM**: OpenAI (function calling + embeddings)
- **Knowledge Base**: TBD (indexing + retrieval with provenance)
- **Data Collection**: Apify actors

## Development Commands

```bash
# Install dependencies (once package.json exists)
npm install

# Run development server
npm run dev

# Database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Implementation Order (Hackathon Priority)

1. **Prisma schema + migrations** → Vercel Postgres
2. **`POST /api/subjects`** upload → OpenAI `extract_topics` → save baseline
3. **Basic UI**: Dashboard, Subject timeline, Year Page
4. **Apify actor** → push to knowledge base → confirm retrieval
5. **`POST /api/run`** → map/diff → retrieve citations → OpenAI write → render PDF → email
6. **Cron endpoint** → generate pending years
7. **Polish**: Evidence badges, "Low evidence" labels, loading states

## Acceptance Criteria (Demo)

1. Upload "Computer Vision 2010.pdf" → Subject card appears
2. Open Subject → timeline shows year tiles (2011–2025)
3. Click year (e.g., 2014) → Year Page shows:
   - TL;DR (3–5 bullets)
   - Sections (🔥/🛠️/📚/🎯/🔮)
   - Each bullet has ≥1 [src_key]; most have ≥2
   - Delta learning path (4–8 hours total)
   - Download PDF button (renders identical content)
4. Email sent with TL;DR + links
5. If citations fail → label "(Low evidence)" or omit (no naked claims)

## Security & Privacy

- Store PDFs in private bucket (signed URLs)
- PII: email only
- Logs: never log full syllabus content; redact email & secrets
- PDF links: short-lived signed URLs

## Required Integrations

- **OpenAI**: Baseline extraction, diff reasoning, patch writing
- **Knowledge Base**: Citation retrieval with provenance (enforce "no citation → no claim") - TBD
- **Apify**: Multi-source collection (arXiv, conferences, GitHub, docs)
- **Email**: Resend or SMTP (not a sponsor)

## Non-Goals (For Clarity)

- No WhatsApp/Intercom delivery (email + web/PDF only)
- No heavy event bus (Vercel Scheduled Functions for cron)
- No AR/voice features
- No interactive graph UI

## Future Extensions (Post-Hackathon)

- Per-subject settings (evidence threshold, peer-review only mode, focus areas)
- Hotfixes (out-of-band major releases)
- User auth (Supabase) + Row-Level Security
- Admin console for source policies
- Scale/observability (Redpanda, Sentry, TrueFoundry)

## Additional Context

The `assets/Framework and Technical Architecture...md` provides detailed background on:
- Multi-agent system architecture (6 specialized agents)
- Temporal knowledge graph concepts (Neo4j)
- Self-improvement mechanisms
- 20-week implementation roadmap

This is supplementary reading. For implementation, always prioritize **Syllabus-Patch-Notes-Spec.md**.
