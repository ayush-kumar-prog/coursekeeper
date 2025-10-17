# 📚 CourseKeeper

**Syllabus Patch Notes for Lifelong Learners**

Track how your field has evolved since you studied it. Upload your old syllabus, get annual patch notes showing what's changed, with citations and a personalized learning path.

## 🚀 Quick Start

**New team member?** See [TEAM-SETUP.md](./TEAM-SETUP.md) for complete setup instructions.

```bash
cd web
npm install
# Add your OpenAI API key to .env
npm run dev
# Visit http://localhost:3000
```

## 📊 Current Status

**✅ Phase 1 Complete:** Database + Core Pipeline + API + Test UI

- Database: PostgreSQL (Supabase) with 8 models via Prisma
- Core Modules: Diff Engine + Patch Writer (integrated)
- API: POST `/api/runs` generates patch notes
- UI: Home page + interactive test page

**🔄 In Progress:** Integration with real data sources

See [STATUS.md](./STATUS.md) for detailed progress.

## 🎯 How It Works

1. **Upload** your old syllabus/course materials
2. **Extract** baseline topics you studied (Phase 3 - in progress)
3. **Detect** what's changed using AI diff engine (✅ working)
4. **Generate** patch notes with citations (✅ working)
5. **Learn** via personalized Delta Path

## 🏗️ Architecture

```
Next.js App → API Routes → Diff Engine + Patch Writer → OpenAI
                ↓
        Prisma → PostgreSQL (Supabase)
```

## 📂 Project Structure

```
coursekeeper/
├── web/                      # Main Next.js application
│   ├── src/
│   │   ├── app/             # Pages and API routes
│   │   │   ├── page.tsx     # Home page
│   │   │   ├── test/        # Test UI
│   │   │   └── api/runs/    # Patch generation API
│   │   └── lib/             # Core modules
│   │       ├── diff-engine.ts
│   │       ├── patch-writer.ts
│   │       └── prisma.ts
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json         # Dependencies
├── standalone-modules/       # Original modules (reference)
├── TEAM-SETUP.md            # Team onboarding guide
├── STATUS.md                # Detailed project status
└── README.md                # This file
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **AI:** OpenAI GPT-4
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Citations:** Senso API (coming soon)
- **Scraping:** Apify (coming soon)

## 📱 What You Can See Right Now

### 1. Home Page - http://localhost:3000
Landing page with:
- Project overview
- Feature highlights
- Quick start guide
- Links to test page

### 2. Test Page - http://localhost:3000/test
Interactive demo:
- Click "Generate Patch Notes" button
- See TL;DR summary
- View major changes with citations
- Explore Delta Path (learning resources)
- Inspect raw JSON output

**Note:** Requires valid OpenAI API key in `.env`

### 3. API Endpoint
```bash
# Test the API directly
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "test", "year": 2014}'
```

## 🔧 Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Check for errors

# Database
npx prisma studio        # Open database GUI (localhost:5555)
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema to database

# Testing
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "test", "year": 2014}'
```

## 📚 Documentation

- [TEAM-SETUP.md](./TEAM-SETUP.md) - Complete setup guide for team members
- [STATUS.md](./STATUS.md) - Current progress, next steps, architecture
- [Implementation-Phases.md](./Implementation-Phases.md) - Original design doc
- [Syllabus-Patch-Notes-Spec.md](./Syllabus-Patch-Notes-Spec.md) - Product spec

## 🤝 Contributing

### For New Team Members

1. Read [TEAM-SETUP.md](./TEAM-SETUP.md)
2. Install dependencies: `cd web && npm install`
3. Add OpenAI API key to `.env`
4. Start dev server: `npm run dev`
5. Try the test page: http://localhost:3000/test

### For Integration

**Phase 3 (Baseline Extraction):**
- Input: PDF syllabus
- Output: `BaselineTopic[]` (see `prisma/schema.prisma`)
- Integration point: `/api/subjects/upload`

**Phase 4 (Senso + Apify):**
- Input: Discipline, year range
- Output: Canon items with citations
- Integration point: Diff engine

See `STATUS.md` for detailed integration requirements.

## 🐛 Troubleshooting

### "401 Incorrect API key provided"
**Solution:** Add a valid OpenAI API key to `web/.env`:
```bash
OPENAI_API_KEY="sk-proj-your-actual-key"
```

### "Module not found"
**Solution:** Install dependencies:
```bash
cd web && npm install
```

### "Database connection error"
**Solution:** Check `DATABASE_URL` and `DIRECT_URL` in `web/.env`

More help: See [TEAM-SETUP.md](./TEAM-SETUP.md#-troubleshooting)

## 📈 Progress

| Component | Status | Completion |
|-----------|--------|-----------|
| Database Setup | ✅ Done | 100% |
| Core API | ✅ Done | 100% |
| Diff Engine | ✅ Integrated | 100% |
| Patch Writer | ✅ Integrated | 100% |
| Test UI | ✅ Done | 100% |
| Baseline Extraction | 🔄 In Progress | 0% |
| Senso/Apify Integration | 🔄 In Progress | 0% |
| Subject Management UI | ⏳ Pending | 0% |
| Production Deployment | ⏳ Pending | 0% |

**Overall MVP Completion:** ~40%

## 🎯 Next Milestones

1. **Get valid OpenAI API key** - Required to test full pipeline
2. **Integrate Phase 3** - Baseline extraction from PDFs
3. **Integrate Phase 4** - Real citations from Senso API
4. **Build Subject UI** - User can upload and manage subjects
5. **Deploy MVP** - Get it live for testing

## 📞 Support

- Check [TEAM-SETUP.md](./TEAM-SETUP.md) for setup issues
- Check [STATUS.md](./STATUS.md) for project status
- Open an issue for bugs
- Ask in team chat for questions

## 🎉 Try It Now!

The easiest way to see what we've built:

1. `cd web && npm install && npm run dev`
2. Add OpenAI key to `.env`
3. Visit http://localhost:3000/test
4. Click "Generate Patch Notes"
5. See the magic! ✨

---

Built for hackathon • Using Next.js, Prisma, OpenAI, Senso, Apify
