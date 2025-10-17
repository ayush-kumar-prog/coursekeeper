# ArXiv Agent Documentation

## Overview

The ArXiv Agent is a multi-source research paper discovery and access system that combines:

1. **Apify Web Scraping** - Bulk paper discovery and metadata extraction
2. **MCP Server Integration** - On-demand paper access via jakub.kopecky/arxiv-mcp-server
3. **Knowledge Base Integration** - Data normalization for knowledge base ingestion with provenance tracking

This agent is designed to support the CourseKeeper platform's knowledge evolution tracking by providing access to academic research papers from arXiv.

## Features

- 🔍 **Comprehensive Search** - Search arXiv using keywords, categories, date ranges
- 📚 **Metadata Extraction** - Extract titles, abstracts, authors, categories, citations
- 📄 **Content Access** - Download and read full paper content
- 🗄️ **Data Normalization** - Transform data for knowledge base ingestion
- ⚡ **Caching** - Built-in caching for improved performance
- 🛡️ **Rate Limiting** - Automatic rate limiting to prevent API throttling
- 🔄 **Error Handling** - Robust error handling with retry logic

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Apify account and API token
- Access to jakub.kopecky/arxiv-mcp-server

### Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
APIFY_API_TOKEN=your_apify_token
ARXIV_MCP_SERVER_URL=https://jakub-kopecky--arxiv-mcp-server.apify.actor/sse
ARXIV_MCP_SERVER_TOKEN=your_apify_token
```

3. **Verify setup:**

```bash
curl http://localhost:3000/api/agents/arxiv/status
```

## Usage

### JavaScript/Node.js Usage

#### Basic Search

```javascript
const { ArXivAgent } = require('./agents/arxivagent');

// Initialize agent
const agent = new ArXivAgent();

// Search papers
const papers = await agent.searchPapers('transformer architecture', {
  maxResults: 50,
  dateFrom: '2017-01-01',
  categories: ['cs.AI', 'cs.LG'],
  sortBy: 'relevance'
});

console.log(`Found ${papers.length} papers`);
papers.forEach(paper => {
  console.log(`${paper.title} (${paper.year})`);
  console.log(`  Authors: ${paper.authors.join(', ')}`);
  console.log(`  URL: ${paper.url}`);
});
```

#### Fetch Specific Paper

```javascript
// Get paper metadata
const metadata = await agent.fetchPaperMetadata('2103.14030');

// Download paper content
const paperContent = await agent.downloadPaper('2103.14030');

// Read paper (if already downloaded)
const content = await agent.readPaper('2103.14030');
```

#### Normalize for Knowledge Base

```javascript
// Search and normalize
const papers = await agent.searchPapers('deep learning', {
  maxResults: 100,
  categories: ['cs.CV']
});

const normalizedPapers = agent.normalizeForKnowledgeBase(papers);

// normalizedPapers is ready for knowledge base ingestion
console.log(normalizedPapers[0]);
// {
//   title: "...",
//   url: "https://arxiv.org/abs/...",
//   venue: "arXiv",
//   year: 2024,
//   type: "paper",
//   summary: "...",
//   authors: [...],
//   categories: [...],
//   sourceProvider: "arXiv",
//   peerReviewed: false,
//   confidence: 0.85,
//   ...
// }
```

### REST API Usage

#### Search Papers

**POST** `/api/agents/arxiv/search`

Request:
```json
{
  "query": "vision transformer",
  "maxResults": 50,
  "dateFrom": "2020-01-01",
  "categories": ["cs.CV"],
  "sortBy": "relevance"
}
```

Response:
```json
{
  "success": true,
  "papers": [...],
  "count": 50,
  "query": "vision transformer"
}
```

**Example using curl:**

```bash
curl -X POST http://localhost:3000/api/agents/arxiv/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "attention mechanism",
    "maxResults": 20,
    "categories": ["cs.AI"]
  }'
```

#### Get Paper Details

**GET** `/api/agents/arxiv/papers/[arxivId]?includeContent=true`

```bash
curl http://localhost:3000/api/agents/arxiv/papers/2103.14030?includeContent=true
```

#### Sync to Knowledge Base

**POST** `/api/agents/arxiv/sync`

Request:
```json
{
  "query": "computer vision",
  "discipline": "Computer Vision",
  "dateFrom": "2020-01-01",
  "categories": ["cs.CV"],
  "maxResults": 50
}
```

Response:
```json
{
  "success": true,
  "synced": 98,
  "failed": 2,
  "knowledgeBaseIds": [...],
  "errors": [...]
}
```

#### Check Agent Status

**GET** `/api/agents/arxiv/status`

```bash
curl http://localhost:3000/api/agents/arxiv/status
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "apify": "connected",
    "mcpServer": "connected"
  },
  "config": {
    "maxResults": 50,
    "cacheTTL": 3600000
  },
  "cache": {
    "size": 42,
    "maxSize": 1000
  }
}
```

## Configuration

### Agent Configuration

You can customize the agent behavior by passing a config object:

```javascript
const agent = new ArXivAgent({
  apifyToken: 'your_token',
  maxResults: 100,
  requestDelayMs: 500,
  cacheTTL: 7200000, // 2 hours
  defaultCategories: ['cs.AI', 'cs.LG', 'cs.CV']
});
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apifyToken` | string | env.APIFY_API_TOKEN | Apify API token |
| `mcpServerUrl` | string | env.ARXIV_MCP_SERVER_URL | MCP server URL |
| `mcpServerToken` | string | env.ARXIV_MCP_SERVER_TOKEN | MCP server auth token |
| `maxResults` | number | 100 | Default max results per search |
| `requestDelayMs` | number | 1000 | Delay between requests (rate limiting) |
| `cacheTTL` | number | 3600000 | Cache time-to-live (1 hour) |
| `maxRetries` | number | 3 | Max retry attempts on failure |
| `defaultCategories` | array | ['cs.AI', ...] | Default arXiv categories |

## arXiv Categories

Common categories for Computer Science:

- `cs.AI` - Artificial Intelligence
- `cs.LG` - Machine Learning
- `cs.CV` - Computer Vision and Pattern Recognition
- `cs.CL` - Computation and Language (NLP)
- `cs.NE` - Neural and Evolutionary Computing
- `cs.RO` - Robotics
- `cs.CR` - Cryptography and Security
- `cs.DB` - Databases
- `cs.DC` - Distributed, Parallel, and Cluster Computing

See [arXiv taxonomy](https://arxiv.org/category_taxonomy) for full list.

## Integration with CourseKeeper Pipeline

### Canon Build Pipeline (Build Spec 7.B)

The ArXiv Agent integrates into the Canon Build pipeline:

```javascript
// 1. Fetch papers from discipline-specific queries
const agent = new ArXivAgent();
const papers = await agent.searchPapers('computer vision', {
  dateFrom: '2020-01-01',
  categories: ['cs.CV']
});

// 2. Normalize for knowledge base
const normalizedPapers = agent.normalizeForKnowledgeBase(papers);

// 3. Push to knowledge base (via API endpoint)
const response = await fetch('/api/agents/arxiv/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'computer vision',
    discipline: 'Computer Vision',
    dateFrom: '2020-01-01',
    categories: ['cs.CV']
  })
});
```

### Year Diff & Write Pipeline (Build Spec 7.C)

Use the agent to gather current research for knowledge gap analysis:

```javascript
// Map baseline topics to canon items
const year = 2024;
const baselineYear = 2016;

// Fetch papers from baseline year to current
const historicalPapers = await agent.searchPapers(baselineTopic, {
  dateFrom: `${baselineYear}-01-01`,
  dateTo: `${year}-12-31`,
  categories: relevantCategories
});

// Analyze for ADD/RENAME/DEPRECATE/CORRECT/EMERGE changes
// (Handled by Knowledge Gap Analyst Agent in the pipeline)
```

## Error Handling

The agent includes comprehensive error handling:

```javascript
try {
  const papers = await agent.searchPapers('quantum computing');
} catch (error) {
  if (error.message.includes('authentication failed')) {
    console.error('Check your APIFY_API_TOKEN');
  } else if (error.message.includes('rate limit')) {
    console.error('Too many requests, please wait');
  } else {
    console.error('Search failed:', error);
  }
}
```

## Caching

The agent automatically caches results to improve performance:

```javascript
// First call - hits API
const papers1 = await agent.searchPapers('transformers');

// Second call - returns cached result (within TTL)
const papers2 = await agent.searchPapers('transformers');

// Clear cache manually
agent.clearCache();
```

## Testing

### Unit Tests

Run unit tests:

```bash
npm test
```

### Integration Test

Test the full workflow:

```bash
node agents/test-arxiv-agent.js
```

## Troubleshooting

### Common Issues

**Issue: "Authentication failed"**
- Check that `APIFY_API_TOKEN` is set correctly
- Verify your Apify account is active

**Issue: "MCP server error"**
- Ensure `ARXIV_MCP_SERVER_URL` is correct
- Check that jakub.kopecky/arxiv-mcp-server is accessible

**Issue: "Rate limit exceeded"**
- Increase `requestDelayMs` in config
- Reduce `maxResults` per request

**Issue: "Knowledge base sync failed"**
- Verify knowledge base API configuration
- Check knowledge base service status

### Debug Mode

Enable verbose logging:

```javascript
// In agent code, logs are already included
// Set NODE_ENV=development for more detailed logs
```

## Performance Considerations

### Optimization Tips

1. **Use caching** - Results are cached for 1 hour by default
2. **Batch requests** - Sync papers in batches of 10-100
3. **Use categories** - Filter by specific categories to reduce results
4. **Set date ranges** - Limit searches to relevant time periods
5. **Use MCP for content** - Only download paper content when needed

### Benchmarks

Typical performance (on localhost):

- Search (100 papers): ~5-10 seconds
- Fetch metadata (1 paper): ~1-2 seconds
- Download paper: ~3-5 seconds
- Sync to knowledge base (100 papers): ~30-60 seconds

## Architecture Alignment

This agent follows the architecture patterns from the Framework document:

- **Real-Time Data Scout Agent** (Framework 3.3.2)
- **Multi-source collection** (Build Spec 3)
- **Canon Build Pipeline** (Build Spec 7.B)
- **Source provenance tracking** (Build Spec 9)

## Contributing

To extend the agent:

1. Add new methods to `ArXivAgent` class
2. Create corresponding API routes in `app/api/agents/arxiv/`
3. Update documentation
4. Add tests

## License

Proprietary - For Hackathon Use

## Support

For issues or questions:
- Check the troubleshooting section
- Review the Framework and Build Spec documents
- Contact the development team
