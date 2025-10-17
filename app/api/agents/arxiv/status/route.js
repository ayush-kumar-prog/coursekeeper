/**
 * GET /api/agents/arxiv/status
 *
 * Get ArXiv Agent health and status
 *
 * Response:
 * {
 *   "success": true,
 *   "status": "healthy",
 *   "services": {
 *     "apify": "connected",
 *     "mcpServer": "connected"
 *   },
 *   "config": {
 *     "maxResults": 100,
 *     "cacheTTL": 3600000
 *   },
 *   "cache": {
 *     "size": 42,
 *     "maxSize": 1000
 *   }
 * }
 */

const { ArXivAgent } = require('../../../../../agents/arxivagent');
const { NextResponse } = require('next/server');

export async function GET(request) {
  try {
    // Initialize agent
    const agent = new ArXivAgent();

    // Check service connectivity
    const services = {
      apify: 'unknown',
      mcpServer: 'unknown',
    };

    // Test Apify connection
    try {
      if (agent.config.apifyToken) {
        // Simple test: try to access Apify API
        await agent.apifyClient.user().get();
        services.apify = 'connected';
      } else {
        services.apify = 'not_configured';
      }
    } catch (error) {
      console.error('[Status] Apify check failed:', error.message);
      services.apify = 'error';
    }

    // Test MCP server connection
    try {
      if (agent.config.mcpServerUrl && agent.config.mcpServerToken) {
        // Try to list papers (lightweight operation)
        await agent.listDownloadedPapers();
        services.mcpServer = 'connected';
      } else {
        services.mcpServer = 'not_configured';
      }
    } catch (error) {
      console.error('[Status] MCP server check failed:', error.message);
      services.mcpServer = 'error';
    }

    // Determine overall status
    const allHealthy = Object.values(services).every(s => s === 'connected' || s === 'not_configured');
    const status = allHealthy ? 'healthy' : 'degraded';

    // Return status
    return NextResponse.json({
      success: true,
      status,
      services,
      config: {
        maxResults: agent.config.maxResults,
        cacheTTL: agent.config.cacheTTL,
        requestDelayMs: agent.config.requestDelayMs,
        defaultCategories: agent.config.defaultCategories,
      },
      cache: {
        size: agent.cache.size,
        maxSize: 1000,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API] Error checking status:', error);

    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error.message || 'Failed to check status',
      },
      { status: 500 }
    );
  }
}
