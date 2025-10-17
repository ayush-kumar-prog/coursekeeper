/**
 * GET /api/agents/arxiv/papers/[arxivId]
 *
 * Get detailed metadata and content for a specific arXiv paper
 *
 * Path parameter:
 * - arxivId: arXiv paper ID (e.g., '2103.14030')
 *
 * Query parameters:
 * - includeContent: 'true' to include full paper content (default: false)
 * - download: 'true' to download the paper first (default: false)
 *
 * Response:
 * {
 *   "success": true,
 *   "paper": {
 *     "arxivId": "2103.14030",
 *     "title": "...",
 *     "abstract": "...",
 *     "authors": [...],
 *     "url": "...",
 *     "pdfUrl": "...",
 *     "content": "..." // if includeContent=true
 *   }
 * }
 */

const { ArXivAgent } = require('../../../../../../agents/arxivagent');
const { NextResponse } = require('next/server');

export async function GET(request, { params }) {
  try {
    const { arxivId } = params;
    const searchParams = request.nextUrl.searchParams;
    const includeContent = searchParams.get('includeContent') === 'true';
    const download = searchParams.get('download') === 'true';

    // Validate arxivId
    if (!arxivId) {
      return NextResponse.json(
        { success: false, error: 'arXiv ID is required' },
        { status: 400 }
      );
    }

    // Initialize agent
    const agent = new ArXivAgent();

    // Fetch metadata
    const metadata = await agent.fetchPaperMetadata(arxivId);

    // Download paper if requested
    if (download) {
      await agent.downloadPaper(arxivId);
    }

    // Include content if requested
    let content = null;
    if (includeContent) {
      try {
        content = await agent.readPaper(arxivId);
      } catch (error) {
        console.warn('[API] Could not read paper content:', error.message);
        // Continue without content rather than failing
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      paper: {
        ...metadata,
        content,
      },
    });

  } catch (error) {
    console.error('[API] Error fetching paper:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch paper',
      },
      { status: 500 }
    );
  }
}
