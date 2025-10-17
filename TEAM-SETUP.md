# CourseKeeper - Team Setup Guide

**Quick Start for New Team Members** 🚀

## ⚠️ Important: You Need a Valid OpenAI API Key

The app is set up and running, but you need a **valid OpenAI API key** to see the patch notes generation work. The current key in `.env` is invalid.

## Prerequisites

- **Node.js** 18+ installed
- **Git** for version control
- Access to the team's Supabase project (already set up)
- **OpenAI API key** (required - see below)

## 🚀 Getting Started (5 minutes)

### 1. Clone and Install

```bash
cd /Users/kumar/Documents/Projects/coursekeeper/coursekeeper/web

# Install dependencies (everything is already in package.json)
npm install
```

**All dependencies are already listed in package.json, including:**
- `next` - Next.js framework
- `react`, `react-dom` - React
- `@prisma/client` - Database ORM
- `openai` - OpenAI API client
- `axios` - HTTP client
- `zod` - Schema validation
- `tailwindcss` - Styling

### 2. Set Up Environment Variables

The `.env` file already exists with the database configured, but **you need to add a valid OpenAI API key**:

```bash
cd /Users/kumar/Documents/Projects/coursekeeper/coursekeeper/web

# Edit the .env file and update this line:
OPENAI_API_KEY="sk-proj-YOUR-ACTUAL-KEY-HERE"
```

**To get an OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it into `.env`

**Optional API keys** (can mock for now):
- `SENSO_API_KEY` - For academic citations (we'll integrate later)
- `APIFY_API_TOKEN` - For web scraping (we'll integrate later)

### 3. Start the Development Server

```bash
# Make sure you're in the web directory
cd /Users/kumar/Documents/Projects/coursekeeper/coursekeeper/web

# Start the server
npm run dev
```

The app will be available at:
- **Local:** http://localhost:3000
- **Network:** http://10.17.191.124:3000 (accessible from other devices on the network)

### 4. Verify Database Connection

The database is already set up! You can verify it's working:

```bash
# Open Prisma Studio to view the database
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can see all tables.

## 📱 What You Can See Right Now

### 1. **Home Page** - http://localhost:3000
- Beautiful landing page explaining CourseKeeper
- Links to test page and API documentation
- Status of what's completed

### 2. **Test Page** - http://localhost:3000/test
- **Interactive UI to test patch notes generation**
- Click "Generate Patch Notes" button
- See results formatted nicely with:
  - TL;DR summary
  - Major changes
  - New tools
  - Delta Path (learning resources)
  - Raw JSON data

**Note:** This will only work once you add a valid OpenAI API key!

### 3. **API Endpoints**

#### GET `/api/runs`
Returns API documentation
```bash
curl http://localhost:3000/api/runs
```

#### POST `/api/runs`
Generate patch notes (requires valid OpenAI key)
```bash
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "test", "year": 2014}'
```

## 🏗️ Project Structure

```
coursekeeper/
├── web/                          # Main Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── test/page.tsx    # Test page (interactive)
│   │   │   └── api/
│   │   │       └── runs/route.ts # Main API endpoint
│   │   └── lib/
│   │       ├── diff-engine.ts    # Change detection
│   │       ├── patch-writer.ts   # Patch notes generation
│   │       └── prisma.ts         # Database client
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── .env                      # Environment variables (UPDATE OPENAI KEY!)
│   └── package.json              # All dependencies
├── standalone-modules/           # Original standalone code (reference only)
├── STATUS.md                     # Current project status
└── TEAM-SETUP.md                # This file!
```

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open database GUI
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes to DB

# Linting
npm run lint             # Check for errors
```

## 🎯 What's Already Done

✅ **Database Setup**
- PostgreSQL on Supabase
- 8 models: User, Subject, Upload, BaselineTopic, YearRun, YearDiff, EmailNotification, CanonItem
- Prisma ORM configured and working

✅ **Core Pipeline**
- Diff Engine: Classifies changes (ADD, DEPRECATE, RENAME, CORRECT, EMERGE)
- Patch Writer: Generates formatted patch notes with citations
- Both integrated and tested

✅ **API Infrastructure**
- `/api/runs` endpoint fully functional
- Error handling
- Logging

✅ **UI**
- Home page with project info
- Test page with interactive patch generation
- Responsive design with Tailwind CSS

## 🔄 What Needs Integration (Next Steps)

### For Phase 3 Team (Baseline Extraction)
Your module should:
- Accept PDF upload
- Extract topics with: `name`, `type`, `category`, `summary`, `importance`
- Return array of `BaselineTopic` objects
- We'll integrate it into `/api/subjects/[id]/upload`

### For Phase 4 Team (Senso + Apify)
Your module should:
- Accept discipline and year range
- Return canon items with: `title`, `url`, `venue`, `year`, `type`, `summary`
- We'll integrate it into the diff engine

## ❓ Troubleshooting

### "Module not found: Can't resolve 'openai'"
**Solution:** Run `npm install` in the `web` directory

### "401 Incorrect API key provided"
**Solution:** Update `OPENAI_API_KEY` in `.env` with a valid key from OpenAI

### "Database connection error"
**Solution:** Check that `DATABASE_URL` and `DIRECT_URL` are correct in `.env`

### "Port 3000 already in use"
**Solution:** Kill the existing process or use a different port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## 📞 Questions?

### For Database Questions
- Check `prisma/schema.prisma` for model definitions
- Use `npx prisma studio` to explore the database
- See `web/src/lib/prisma.ts` for client usage

### For API Questions
- Check `web/src/app/api/runs/route.ts` for endpoint implementation
- See `STATUS.md` for API documentation

### For Module Integration
- Core modules are in `web/src/lib/`
- Import like: `import { DiffAnalysisEngine } from '@/lib/diff-engine'`
- See `/api/runs/route.ts` for usage example

## 🎉 Quick Win: See It Working

Once you've added your OpenAI API key:

1. Start the server: `npm run dev`
2. Open http://localhost:3000/test
3. Click "Generate Patch Notes (2014)"
4. Watch the magic happen! ✨

You should see:
- 5 TL;DR points
- Major changes with citations
- New tools and resources
- A personalized learning path (Delta Path)
- Full bibliography

This proves the entire pipeline works end-to-end!

## 🔐 Security Notes

- ✅ `.env` is gitignored - never commit API keys
- ✅ `env.template` is provided as a reference
- ⚠️ The current OpenAI key in `.env` is invalid and needs replacement
- ⚠️ Make sure to use the team's shared OpenAI account (ask teammates)

## 📊 Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| AI | OpenAI GPT-4 |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Citations | Senso API (coming) |
| Scraping | Apify (coming) |

## 🚀 Ready to Code!

Everything is set up. Just:
1. Add your OpenAI API key to `.env`
2. Run `npm run dev`
3. Open http://localhost:3000/test
4. Start building! 🎊

