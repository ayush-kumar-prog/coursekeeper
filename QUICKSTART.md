# CourseKeeper - ArXiv Agent Quick Start Guide

This guide will help you get started with the ArXiv Agent in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Apify account ([sign up here](https://apify.com))
- API credentials ready

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Required: Get from https://console.apify.com/account/integrations
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxx

# Optional: For MCP server access
ARXIV_MCP_SERVER_URL=https://jakub-kopecky--arxiv-mcp-server.apify.actor/sse
ARXIV_MCP_SERVER_TOKEN=apify_api_xxxxxxxxxxxxx
```

### 3. Start Development Server

```bash
npm run dev
```

Your server will start at: http://localhost:3000

## Quick Test

### Option 1: Using the Test Script

Run the example script to verify everything works:

```bash
node agents/test-arxiv-agent.js
```

Expected output:
```
=== Example 1: Basic Paper Search ===

Found 5 papers:

1. Attention Is All You Need
   Authors: Vaswani, Ashish, Shazeer, Noam, ...
   Year: 2017
   arXiv: 1706.03762
   ...
```

### Option 2: Using the REST API

Test the search endpoint:

```bash
curl -X POST http://localhost:3000/api/agents/arxiv/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "transformer",
    "maxResults": 5,
    "categories": ["cs.AI"]
  }'
```

Expected response:
```json
{
  "success": true,
  "papers": [...],
  "count": 5,
  "query": "transformer"
}
```

### Option 3: Check System Status

```bash
curl http://localhost:3000/api/agents/arxiv/status
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "apify": "connected",
    "mcpServer": "connected"
  }
}
```

## Common Use Cases

### 1. Search Papers by Topic

```javascript
const { ArXivAgent } = require('./agents/arxivagent');

const agent = new ArXivAgent();
const papers = await agent.searchPapers('deep learning', {
  maxResults: 50,
  dateFrom: '2020-01-01',
  categories: ['cs.LG']
});

console.log(`Found ${papers.length} papers`);
```

### 2. Build Knowledge Base for a Subject

```bash
curl -X POST http://localhost:3000/api/agents/arxiv/sync \
  -H "Content-Type: application/json" \
  -d '{
    "query": "computer vision",
    "discipline": "Computer Vision",
    "dateFrom": "2020-01-01",
    "categories": ["cs.CV"],
    "maxResults": 100
  }'
```

### 3. Get Specific Paper Details

```bash
curl http://localhost:3000/api/agents/arxiv/papers/1706.03762
```

## Troubleshooting

### Error: "APIFY_API_TOKEN not set"

**Solution**: Add your Apify token to `.env.local`:

```env
APIFY_API_TOKEN=your_token_here
```

Get your token from: https://console.apify.com/account/integrations

### Error: "Rate limit exceeded"

**Solution**: Add delay between requests or reduce maxResults:

```javascript
const agent = new ArXivAgent({
  requestDelayMs: 2000, // 2 second delay
});
```

### Error: "Module not found"

**Solution**: Reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

### Integrate with Your Workflow

1. **For Knowledge Patch Generation**: Use the `/api/agents/arxiv/sync` endpoint to populate your knowledge base
2. **For Research Discovery**: Use the `/api/agents/arxiv/search` endpoint to find relevant papers
3. **For Content Analysis**: Use the paper download/read methods to access full paper content

### Customize the Agent

Edit `agents/arxivagent.js` to:
- Add custom data sources
- Modify normalization logic
- Implement domain-specific filters
- Add new MCP tools

### Build UI Components

Create React components to:
- Display search results
- Show paper timelines
- Visualize knowledge evolution
- Generate patch notes

## API Reference

Full API documentation: [agents/README.md](agents/README.md)

### Key Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agents/arxiv/search` | POST | Search papers |
| `/api/agents/arxiv/papers/[id]` | GET | Get paper details |
| `/api/agents/arxiv/sync` | POST | Sync to knowledge base |
| `/api/agents/arxiv/status` | GET | Check system health |

## Example Integration

Here's how to integrate the agent into the CourseKeeper pipeline:

```javascript
// 1. User uploads Computer Vision syllabus from 2010
// 2. System extracts baseline topics

// 3. For year 2024, gather current papers
const agent = new ArXivAgent();
const currentPapers = await agent.searchPapers('computer vision', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  categories: ['cs.CV']
});

// 4. Normalize and sync to knowledge base
// ... push to knowledge base for gap analysis

// 5. Knowledge Gap Analyst compares 2010 baseline vs 2024 current
// 6. Generate patch notes with new concepts (e.g., Vision Transformers)
```

## Resources

- **Full Documentation**: [agents/README.md](agents/README.md)
- **Framework Architecture**: [assets/Framework and Technical Architecture.md](assets/Framework%20and%20Technical%20Architecture_%20Continuing%20Education%20Platform%20with%20Self-Improving%20AI%20Agents.md)
- **Build Specification**: [Syllabus-Patch-Notes-Spec.md](Syllabus-Patch-Notes-Spec.md)
- **Apify Documentation**: https://docs.apify.com
- **arXiv API**: https://arxiv.org/help/api

## Support

- For agent-specific issues: See [agents/README.md](agents/README.md#troubleshooting)
- For Apify issues: https://docs.apify.com
- For MCP server issues: https://apify.com/jakub.kopecky/arxiv-mcp-server

---

**Ready to build?** Start with `npm run dev` and explore the API! 🚀
