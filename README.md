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
