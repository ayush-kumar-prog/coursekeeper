/**
 * POST /api/agents/arxiv/search
 *
 * Search arXiv papers using the ArXiv Agent
 *
 * Request body:
 * {
 *   "query": "transformer architecture",
 *   "maxResults": 50,
 *   "dateFrom": "2017-01-01",
 *   "dateTo": "2024-12-31",
 *   "categories": ["cs.AI", "cs.LG"],
 *   "sortBy": "relevance"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "papers": [...],
 *   "count": 50,
 *   "query": "transformer architecture"
 * }
 */

const { ArXivAgent } = require('../../../../../agents/arxivagent');
const { NextResponse } = require('next/server');

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, maxResults, dateFrom, dateTo, categories, sortBy, useMCP } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize agent
    const agent = new ArXivAgent();

    // Search papers (use MCP or Apify based on flag)
    let papers;
    if (useMCP) {
      papers = await agent.searchPapersViaMCP(query, {
        maxResults,
        dateFrom,
        categories,
      });
    } else {
      papers = await agent.searchPapers(query, {
        maxResults,
        dateFrom,
        dateTo,
        categories,
        sortBy,
      });
    }

    // Return results
    return NextResponse.json({
      success: true,
      papers,
      count: papers.length,
      query,
      usedMCP: !!useMCP,
    });

  } catch (error) {
    console.error('[API] Error searching papers:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search papers',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const agent = new ArXivAgent();
    const papers = await agent.searchPapers(query, {
      maxResults: parseInt(searchParams.get('maxResults')) || 20,
    });

    return NextResponse.json({
      success: true,
      papers,
      count: papers.length,
      query,
    });

  } catch (error) {
    console.error('[API] Error searching papers:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to search papers',
      },
      { status: 500 }
    );
  }
}
