/**
 * ArXiv Agent - Multi-source Research Paper Discovery & Access
 *
 * This agent combines Apify web scraping for bulk paper discovery
 * with MCP server integration for on-demand paper access and content retrieval.
 *
 * Key Capabilities:
 * - Search and discover papers using Apify's arXiv scrapers
 * - Access paper content via jakub.kopecky/arxiv-mcp-server
 * - Normalize data for knowledge base ingestion
 * - Handle rate limiting, caching, and error recovery
 *
 * @author Manus AI
 * @version 1.0.0
 */

const { ApifyClient } = require('apify-client');
const axios = require('axios');
const EventSource = require('eventsource');
const { format, parseISO } = require('date-fns');

/**
 * ArXiv Agent Configuration
 */
const DEFAULT_CONFIG = {
  // Apify settings
  apifyToken: process.env.APIFY_API_TOKEN,
  apifyScraperActorId: 'scrapestorm/arxiv-article-metadata-scraper---pay-per-results',

  // MCP Server settings
  mcpServerUrl: process.env.ARXIV_MCP_SERVER_URL || 'https://jakub-kopecky--arxiv-mcp-server.apify.actor/sse',
  mcpServerToken: process.env.ARXIV_MCP_SERVER_TOKEN || process.env.APIFY_API_TOKEN,

  // Search defaults
  maxResults: 25,
  defaultCategories: ['cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE'],

  // Rate limiting
  requestDelayMs: 1000,
  maxRetries: 3,

  // Caching
  cacheTTL: 3600000, // 1 hour in milliseconds
};

/**
 * ArXiv Agent Class
 */
class ArXivAgent {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize Apify client
    this.apifyClient = new ApifyClient({
      token: this.config.apifyToken,
    });

    // Initialize cache
    this.cache = new Map();

    // Track last request time for rate limiting
    this.lastRequestTime = 0;
  }

  /**
   * Search arXiv papers using Apify scraper
   *
   * @param {string} query - Search query (keywords, author, title)
   * @param {Object} options - Search options
   * @param {number} options.maxResults - Maximum number of results (default: 100)
   * @param {string} options.dateFrom - Start date (YYYY-MM-DD)
   * @param {string} options.dateTo - End date (YYYY-MM-DD)
   * @param {string[]} options.categories - arXiv categories (e.g., ['cs.AI', 'cs.CV'])
   * @param {string} options.sortBy - Sort order: 'relevance', 'submittedDate', 'lastUpdatedDate'
   * @returns {Promise<Array>} Array of paper metadata
   */
  async searchPapers(query, options = {}) {
    try {
      console.log(`[ArXivAgent] Searching papers: "${query}"`, options);

      // Apply rate limiting
      await this._rateLimit();

      // Check cache
      const cacheKey = this._getCacheKey('search', query, options);
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[ArXivAgent] Returning cached results');
        return cached;
      }

      // Build arXiv search URL from query and options
      const searchUrl = this._buildArxivSearchUrl(query, options);
      console.log('[ArXivAgent] Search URL:', searchUrl);

      // Prepare Apify actor input for scrapestorm actor
      const input = {
        searchUrls: [searchUrl],
        maxItems: options.maxResults || this.config.maxResults,
      };

      // Run Apify actor
      console.log('[ArXivAgent] Running Apify scraper...');
      const run = await this.apifyClient.actor(this.config.apifyScraperActorId).call(input);

      // Fetch results from dataset
      const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

      console.log(`[ArXivAgent] Found ${items.length} papers from scraper`);

      // Normalize the results
      let papers = items.map(item => this._normalizeApifyResult(item));

      // Apply date filtering if specified (post-fetch since arXiv URL doesn't support it)
      if (options.dateFrom || options.dateTo) {
        papers = this._filterByDateRange(papers, options.dateFrom, options.dateTo);
        console.log(`[ArXivAgent] After date filtering: ${papers.length} papers`);
      }

      // Limit results to maxResults (in case scraper returns more than requested)
      const maxResults = options.maxResults || this.config.maxResults;
      if (papers.length > maxResults) {
        console.log(`[ArXivAgent] Limiting from ${papers.length} to ${maxResults} papers`);
        papers = papers.slice(0, maxResults);
      }

      // Cache results
      this._setInCache(cacheKey, papers);

      return papers;

    } catch (error) {
      console.error('[ArXivAgent] Error searching papers:', error);
      throw new Error(`Failed to search papers: ${error.message}`);
    }
  }

  /**
   * Fetch detailed metadata for a specific arXiv paper
   *
   * @param {string} arxivId - arXiv ID (e.g., '2103.14030' or 'arXiv:2103.14030v2')
   * @returns {Promise<Object>} Detailed paper metadata
   */
  async fetchPaperMetadata(arxivId) {
    try {
      const cleanId = this._cleanArxivId(arxivId);
      console.log(`[ArXivAgent] Fetching metadata for: ${cleanId}`);

      // Check cache
      const cacheKey = this._getCacheKey('metadata', cleanId);
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[ArXivAgent] Returning cached metadata');
        return cached;
      }

      // Use arXiv API directly for metadata
      const apiUrl = `http://export.arxiv.org/api/query?id_list=${cleanId}`;
      const response = await axios.get(apiUrl);

      // Parse XML response (simplified - in production, use a proper XML parser)
      const metadata = this._parseArxivApiResponse(response.data, cleanId);

      // Cache results
      this._setInCache(cacheKey, metadata);

      return metadata;

    } catch (error) {
      console.error('[ArXivAgent] Error fetching metadata:', error);
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }

  /**
   * Download and read paper content using MCP server
   *
   * @param {string} arxivId - arXiv ID
   * @returns {Promise<Object>} Paper content and metadata
   */
  async downloadPaper(arxivId) {
    try {
      const cleanId = this._cleanArxivId(arxivId);
      console.log(`[ArXivAgent] Downloading paper via MCP server: ${cleanId}`);

      // Check cache
      const cacheKey = this._getCacheKey('download', cleanId);
      const cached = this._getFromCache(cacheKey);
      if (cached) {
        console.log('[ArXivAgent] Returning cached paper content');
        return cached;
      }

      // Call MCP server's download_paper tool
      const result = await this._callMCPTool('download_paper', {
        paper_id: cleanId,
      });

      // Cache results
      this._setInCache(cacheKey, result);

      return result;

    } catch (error) {
      console.error('[ArXivAgent] Error downloading paper:', error);
      throw new Error(`Failed to download paper: ${error.message}`);
    }
  }

  /**
   * Read paper content from MCP server (assumes already downloaded)
   *
   * @param {string} arxivId - arXiv ID
   * @returns {Promise<string>} Paper content as text
   */
  async readPaper(arxivId) {
    try {
      const cleanId = this._cleanArxivId(arxivId);
      console.log(`[ArXivAgent] Reading paper via MCP server: ${cleanId}`);

      // Call MCP server's read_paper tool
      const result = await this._callMCPTool('read_paper', {
        paper_id: cleanId,
      });

      return result.content || result.text || '';

    } catch (error) {
      console.error('[ArXivAgent] Error reading paper:', error);
      throw new Error(`Failed to read paper: ${error.message}`);
    }
  }

  /**
   * List all papers cached by the MCP server
   *
   * @returns {Promise<Array>} List of downloaded papers
   */
  async listDownloadedPapers() {
    try {
      console.log('[ArXivAgent] Listing downloaded papers from MCP server');

      const result = await this._callMCPTool('list_papers', {});

      return result.papers || result || [];

    } catch (error) {
      console.error('[ArXivAgent] Error listing papers:', error);
      throw new Error(`Failed to list papers: ${error.message}`);
    }
  }

  /**
   * Normalize paper data for knowledge base ingestion
   *
   * @param {Array} papers - Array of papers from any source
   * @returns {Array} Normalized papers ready for knowledge base ingestion
   */
  normalizeForKnowledgeBase(papers) {
    console.log(`[ArXivAgent] Normalizing ${papers.length} papers for knowledge base`);

    return papers.map(paper => ({
      // Required fields per Build Spec section 7.B
      title: paper.title,
      url: paper.url || `https://arxiv.org/abs/${this._cleanArxivId(paper.arxivId || paper.id)}`,
      venue: 'arXiv',
      year: paper.year || this._extractYear(paper.publishedDate || paper.submittedDate),
      type: 'paper',
      summary: paper.abstract || paper.summary || '',

      // Additional metadata
      authors: paper.authors || [],
      categories: paper.categories || [],
      arxivId: this._cleanArxivId(paper.arxivId || paper.id),
      submittedDate: paper.submittedDate || paper.publishedDate,
      updatedDate: paper.updatedDate,
      version: paper.version,

      // Provenance metadata
      sourceProvider: 'arXiv',
      sourceType: 'preprint',
      peerReviewed: false, // arXiv papers are preprints
      confidence: 0.85, // High confidence for arXiv metadata, but not peer-reviewed

      // Citation metadata
      citationCount: paper.citationCount || null,
      pdfUrl: paper.pdfUrl || `https://arxiv.org/pdf/${this._cleanArxivId(paper.arxivId || paper.id)}.pdf`,

      // Timestamps
      fetchedAt: new Date().toISOString(),
    }));
  }

  /**
   * Search papers with MCP server (alternative to Apify)
   *
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results from MCP server
   */
  async searchPapersViaMCP(query, options = {}) {
    try {
      console.log(`[ArXivAgent] Searching via MCP server: "${query}"`);

      const result = await this._callMCPTool('search_papers', {
        query,
        max_results: options.maxResults || this.config.maxResults,
        date_from: options.dateFrom,
        categories: options.categories,
      });

      return result.papers || result || [];

    } catch (error) {
      console.error('[ArXivAgent] Error searching via MCP:', error);
      throw new Error(`Failed to search via MCP: ${error.message}`);
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  /**
   * Build arXiv search URL from query and options
   * @private
   */
  _buildArxivSearchUrl(query, options = {}) {
    const baseUrl = 'https://arxiv.org/search/';
    const params = new URLSearchParams();

    // Add query (supports advanced queries)
    let fullQuery = query;

    // Add category filters if provided
    if (options.categories && options.categories.length > 0) {
      const categoryQuery = options.categories.map(cat => `cat:${cat}`).join(' OR ');
      fullQuery = `(${query}) AND (${categoryQuery})`;
    }

    params.append('query', fullQuery);
    params.append('searchtype', 'all');
    params.append('source', 'header');

    // Add sort order
    if (options.sortBy) {
      const sortMap = {
        'relevance': 'relevance',
        'submittedDate': 'submitted_date',
        'lastUpdatedDate': 'last_updated_date',
      };
      params.append('order', sortMap[options.sortBy] || 'relevance');
    }

    // Note: arXiv search UI doesn't directly support date filters in URL
    // Date filtering will need to be done post-fetch
    // Categories are handled in the query string above

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Filter papers by date range
   * @private
   */
  _filterByDateRange(papers, dateFrom, dateTo) {
    return papers.filter(paper => {
      const paperDate = paper.publishedDate || paper.submittedDate;
      if (!paperDate) return true; // Keep papers without dates

      try {
        const date = parseISO(paperDate);

        if (dateFrom) {
          const fromDate = parseISO(dateFrom);
          if (date < fromDate) return false;
        }

        if (dateTo) {
          const toDate = parseISO(dateTo);
          if (date > toDate) return false;
        }

        return true;
      } catch (error) {
        console.warn(`[ArXivAgent] Failed to parse date: ${paperDate}`);
        return true; // Keep papers with unparseable dates
      }
    });
  }

  /**
   * Call MCP server tool
   * @private
   */
  async _callMCPTool(toolName, params) {
    try {
      // Apply rate limiting
      await this._rateLimit();

      // Prepare request
      const requestBody = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      };

      // Call MCP server via HTTP POST
      const response = await axios.post(
        this.config.mcpServerUrl.replace('/sse', ''),
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.mcpServerToken}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error.message || 'MCP server error');
      }

      return response.data.result || response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('MCP server authentication failed. Check your ARXIV_MCP_SERVER_TOKEN.');
      }
      throw error;
    }
  }

  /**
   * Normalize Apify scraper result to common format
   * @private
   */
  _normalizeApifyResult(item) {
    // Extract arXiv ID (handle both old and new scraper formats)
    const arxivId = this._cleanArxivId(
      item.arxiv_id || item.arxivId || item.id || ''
    );

    // Parse categories (new scraper uses newline-separated string in 'domain' field)
    let categories = [];
    if (item.domain) {
      categories = item.domain.split('\n').map(c => c.trim()).filter(Boolean);
    } else if (item.categories) {
      categories = Array.isArray(item.categories) ? item.categories : [];
    } else if (item.subjects) {
      categories = Array.isArray(item.subjects) ? item.subjects : [];
    }

    // Extract submission date from submitted_info (new scraper format)
    let submittedDate = item.publishedDate || item.submittedDate;
    if (item.submitted_info && !submittedDate) {
      // Parse date from "Submitted 16 October, 2025; originally announced October 2025."
      const dateMatch = item.submitted_info.match(/(\d+)\s+(\w+),?\s+(\d{4})/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        // Convert to ISO format approximation (day Month year -> YYYY-MM-DD)
        const monthMap = {
          January: '01', February: '02', March: '03', April: '04',
          May: '05', June: '06', July: '07', August: '08',
          September: '09', October: '10', November: '11', December: '12'
        };
        const monthNum = monthMap[month] || '01';
        submittedDate = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      }
    }

    return {
      arxivId,
      title: item.title,
      abstract: item.abstract || item.summary || '',
      authors: item.authors || [],
      categories,
      publishedDate: submittedDate,
      submittedDate,
      updatedDate: item.updatedDate,
      url: item.arxiv_link || item.url || `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: item.pdfUrl || `https://arxiv.org/pdf/${arxivId}.pdf`,
      year: this._extractYear(submittedDate),
      version: item.version,
      citationCount: item.citationCount,
      comments: item.comments,
    };
  }

  /**
   * Parse arXiv API XML response (simplified)
   * @private
   */
  _parseArxivApiResponse(xmlData, arxivId) {
    // NOTE: This is a simplified parser. In production, use a proper XML parser like 'xml2js'
    // For now, return a basic structure
    console.log('[ArXivAgent] Parsing arXiv API response (simplified)');

    return {
      arxivId,
      url: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
      // Additional parsing would be done here in production
    };
  }

  /**
   * Clean arXiv ID (remove 'arXiv:' prefix and version suffix if present)
   * @private
   */
  _cleanArxivId(arxivId) {
    if (!arxivId) return '';

    // Remove 'arXiv:' prefix
    let clean = arxivId.replace(/^arXiv:/i, '');

    // Optionally keep version (e.g., '2103.14030v2')
    // For now, we keep it as-is

    return clean.trim();
  }

  /**
   * Extract year from date string
   * @private
   */
  _extractYear(dateString) {
    if (!dateString) return new Date().getFullYear();

    try {
      const date = parseISO(dateString);
      return date.getFullYear();
    } catch {
      // Try to extract year from string (e.g., '2024-03-15' -> 2024)
      const match = dateString.match(/(\d{4})/);
      return match ? parseInt(match[1]) : new Date().getFullYear();
    }
  }

  /**
   * Rate limiting
   * @private
   */
  async _rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.config.requestDelayMs) {
      const delay = this.config.requestDelayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generate cache key
   * @private
   */
  _getCacheKey(operation, ...args) {
    return `${operation}:${JSON.stringify(args)}`;
  }

  /**
   * Get from cache
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set in cache
   * @private
   */
  _setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Simple cache size limit
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[ArXivAgent] Cache cleared');
  }
}

module.exports = { ArXivAgent, DEFAULT_CONFIG };
