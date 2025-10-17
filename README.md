# CourseKeeper 🎓

**Continuing Education Platform with Self-Improving AI Agents**

*Intercom Hackathon 10/17 - Team Life Learn*

Bridge the gap between your historical learning and the current state of knowledge in your field through autonomous AI agents that track how knowledge evolves over time.

## 🚀 Quick Start

Get started in 5 minutes:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Test the ArXiv Agent
node agents/test-arxiv-agent.js

# 4. Start development server
npm run dev
```

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

## 📖 What is CourseKeeper?

CourseKeeper generates personalized "knowledge patches" that show what's changed in your field since you last studied. Upload an old syllabus from 2010, and we'll show you year-by-year what's new, what's evolved, and what's been deprecated.

**Example**: Computer Vision 2010 → 2024
- 🔥 Major shifts: Deep learning revolution, transformer architectures
- 🛠️ New tools: PyTorch, TensorFlow, Vision Transformers
- 📚 Key papers: ImageNet, ResNet, ViT
- 🎯 Deprecated: Hand-crafted features, SIFT, HOG
- 🔮 Emerging: Diffusion models, multimodal learning

## 🏗️ Architecture

### Multi-Agent System

- **ArXiv Agent** ✅ - Scrapes research papers from arXiv (IMPLEMENTED)
- **Curriculum Ingestion Agent** - Extracts topics from syllabi
- **Temporal Knowledge Graph Agent** - Models knowledge evolution
- **Knowledge Gap Analyst Agent** - Identifies what's changed
- **Patch Generation Agent** - Creates personalized summaries
- **Self-Improvement Agent** - Learns from feedback

### Tech Stack

- **Frontend**: Next.js 14 + React
- **Backend**: Next.js API Routes
- **Agents**: Custom Node.js + LangGraph
- **Data Sources**: Apify (web scraping) + MCP servers
- **Knowledge Base**: TBD
- **LLM**: OpenAI GPT-4
- **Database**: PostgreSQL + Prisma

## 🤖 ArXiv Agent (Implemented)

The first agent is complete and ready to use!

### Features
- 🔍 Search arXiv papers by keyword, category, date range
- 📄 Fetch paper metadata and content
- 🔄 Dual integration: Apify scrapers + MCP server
- 📊 Normalize data for knowledge base ingestion
- ⚡ Built-in caching and rate limiting

### API Endpoints

```bash
# Search papers
POST /api/agents/arxiv/search
{
  "query": "transformer",
  "maxResults": 50,
  "categories": ["cs.AI"]
}

# Get paper details
GET /api/agents/arxiv/papers/1706.03762

# Sync to knowledge base
POST /api/agents/arxiv/sync

# Check health
GET /api/agents/arxiv/status
```

### Usage Example

```javascript
const { ArXivAgent } = require('./agents/arxivagent');

const agent = new ArXivAgent();
const papers = await agent.searchPapers('deep learning', {
  maxResults: 100,
  dateFrom: '2020-01-01',
  categories: ['cs.LG']
});

// Ready for knowledge base ingestion
```

See [agents/README.md](agents/README.md) for full documentation.

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
├── agents/
│   ├── arxivagent.js          # ✅ ArXiv research paper agent
│   ├── test-arxiv-agent.js    # Examples and tests
│   └── README.md              # Agent documentation
├── app/
│   └── api/
│       └── agents/
│           └── arxiv/         # ✅ ArXiv API endpoints
├── assets/
│   └── Framework and Technical Architecture.md
├── sponsors/                   # Sponsor integration docs
├── package.json
├── QUICKSTART.md              # Quick start guide
├── IMPLEMENTATION_SUMMARY.md  # What we built
└── Syllabus-Patch-Notes-Spec.md

```

## 🎯 Current Status

### ✅ Completed
- **ArXiv Agent** - Full implementation with Apify + MCP
- **REST API endpoints** - Search, sync, status
- **Data normalization pipeline**
- **Comprehensive documentation**
- **Test suite and examples** - Full coverage

### 🚧 In Progress
- Frontend UI components
- Database schema and migrations

### 📋 Planned
- Curriculum Ingestion Agent
- Temporal Knowledge Graph
- Knowledge Gap Analyst
- Patch Generation Agent
- Self-Improvement Agent

## 🔧 Development

### Prerequisites
- Node.js 18+
- Apify account + API token
- PostgreSQL (for full app)

### Environment Variables

```env
# Required
APIFY_API_TOKEN=your_token

# Optional
ARXIV_MCP_SERVER_URL=https://jakub-kopecky--arxiv-mcp-server.apify.actor/sse
OPENAI_API_KEY=your_openai_key
```

### Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm test           # Run tests
npm run lint       # Lint code
```

## 📚 Documentation

### Getting Started
- [Quick Start Guide](QUICKSTART.md) - Get running in 5 minutes
- [ArXiv Agent Docs](agents/README.md) - Full agent documentation

### Implementation Guides
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - ArXiv agent details

### Architecture & Specs
- [Framework Architecture](assets/Framework%20and%20Technical%20Architecture_%20Continuing%20Education%20Platform%20with%20Self-Improving%20AI%20Agents.md) - System design
- [Build Specification](Syllabus-Patch-Notes-Spec.md) - Product requirements

## 🎓 Use Cases

### For Students
Track how your field has evolved since graduation. Get targeted learning paths for new concepts.

### For Professionals
Stay current without retaking courses. Focus on what's actually changed.

### For Educators
Understand knowledge evolution. Update curricula based on real changes.

### For Researchers
Discover emerging trends. Track how concepts evolve over time.

## 🤝 Contributing

We're building this for the Intercom Hackathon! Contributions welcome.

### Priority Areas
1. UI components for knowledge patch display
2. Additional data source integrations
3. Knowledge graph visualization
4. Self-improvement algorithms

## 📄 License

Proprietary - For Hackathon Use

## 🙏 Acknowledgments

Built with:
- [Apify](https://apify.com) - Web scraping infrastructure
- [jakub.kopecky/arxiv-mcp-server](https://apify.com/jakub.kopecky/arxiv-mcp-server) - MCP integration
- OpenAI - LLM capabilities
- Intercom - Hackathon sponsor

## 📞 Contact

**Team Life Learn** - Intercom Hackathon 2024

---

**Status**: ArXiv Agent ✅ | Ready for development 🚀
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
