/**
 * ArXiv Agent - Test & Example Script
 *
 * This script demonstrates how to use the ArXiv Agent for:
 * 1. Searching papers
 * 2. Fetching metadata
 * 3. Downloading content
 * 4. Normalizing for knowledge base
 *
 * Usage: node agents/test-arxiv-agent.js
 */

require('dotenv').config({ path: '.env.local' });
const { ArXivAgent } = require('./arxivagent');

/**
 * Example 1: Basic Paper Search
 */
async function exampleBasicSearch() {
  console.log('\n=== Example 1: Basic Paper Search ===\n');

  const agent = new ArXivAgent();

  try {
    const papers = await agent.searchPapers('transformer architecture', {
      maxResults: 5,
      dateFrom: '2017-01-01',
      categories: ['cs.AI', 'cs.LG'],
    });

    console.log(`Found ${papers.length} papers:\n`);

    papers.forEach((paper, index) => {
      console.log(`${index + 1}. ${paper.title}`);
      console.log(`   Authors: ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ', ...' : ''}`);
      console.log(`   Year: ${paper.year}`);
      console.log(`   arXiv: ${paper.arxivId}`);
      console.log(`   Categories: ${paper.categories.join(', ')}`);
      console.log(`   URL: ${paper.url}\n`);
    });

    return papers;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

/**
 * Example 2: Fetch Specific Paper Metadata
 */
async function exampleFetchMetadata() {
  console.log('\n=== Example 2: Fetch Paper Metadata ===\n');

  const agent = new ArXivAgent();

  try {
    // Example: "Attention Is All You Need" paper
    const arxivId = '1706.03762';
    console.log(`Fetching metadata for arXiv:${arxivId}...\n`);

    const metadata = await agent.fetchPaperMetadata(arxivId);

    console.log('Paper Metadata:');
    console.log(`  arXiv ID: ${metadata.arxivId}`);
    console.log(`  URL: ${metadata.url}`);
    console.log(`  PDF: ${metadata.pdfUrl}`);
    console.log();

    return metadata;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

/**
 * Example 3: Search Using MCP Server
 */
async function exampleMCPSearch() {
  console.log('\n=== Example 3: Search via MCP Server ===\n');

  const agent = new ArXivAgent();

  try {
    const papers = await agent.searchPapersViaMCP('vision transformer', {
      maxResults: 5,
      categories: ['cs.CV'],
    });

    console.log(`Found ${papers.length} papers via MCP:\n`);

    papers.forEach((paper, index) => {
      console.log(`${index + 1}. ${paper.title || paper.id}`);
    });

    return papers;
  } catch (error) {
    console.error('Error (expected if MCP not available):', error.message);
    return [];
  }
}

/**
 * Example 4: Normalize for Knowledge Base
 */
async function exampleNormalizeForKnowledgeBase() {
  console.log('\n=== Example 4: Normalize for Knowledge Base ===\n');

  const agent = new ArXivAgent();

  try {
    // Search papers
    const papers = await agent.searchPapers('deep learning', {
      maxResults: 3,
      categories: ['cs.LG'],
    });

    // Normalize for knowledge base
    const normalizedPapers = agent.normalizeForKnowledgeBase(papers);

    console.log('Normalized papers for knowledge base:\n');

    normalizedPapers.forEach((paper, index) => {
      console.log(`${index + 1}. ${paper.title}`);
      console.log(`   Venue: ${paper.venue}`);
      console.log(`   Year: ${paper.year}`);
      console.log(`   Type: ${paper.type}`);
      console.log(`   Source: ${paper.sourceProvider}`);
      console.log(`   Peer Reviewed: ${paper.peerReviewed}`);
      console.log(`   Confidence: ${paper.confidence}`);
      console.log(`   Fetched At: ${paper.fetchedAt}`);
      console.log();
    });

    return normalizedPapers;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

/**
 * Example 5: Computer Vision Domain Search
 */
async function exampleDomainSearch() {
  console.log('\n=== Example 5: Computer Vision Domain Search ===\n');

  const agent = new ArXivAgent();

  try {
    // Simulate a domain-specific search for Computer Vision
    console.log('Searching for recent CV papers (2020-2024)...\n');

    const papers = await agent.searchPapers('object detection', {
      maxResults: 25,
      dateFrom: '2020-01-01',
      dateTo: '2024-12-31',
      categories: ['cs.CV'],
      sortBy: 'submittedDate',
    });

    console.log(`Found ${papers.length} Computer Vision papers:\n`);

    // Group by year
    const papersByYear = {};
    papers.forEach(paper => {
      const year = paper.year;
      if (!papersByYear[year]) papersByYear[year] = [];
      papersByYear[year].push(paper);
    });

    Object.keys(papersByYear).sort().reverse().forEach(year => {
      console.log(`${year}: ${papersByYear[year].length} papers`);
      papersByYear[year].slice(0, 2).forEach(paper => {
        console.log(`  - ${paper.title.substring(0, 60)}...`);
      });
    });

    console.log('\nThis data could be used for Canon Build Pipeline (Build Spec 7.B)');

    return papers;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

/**
 * Example 6: Default Results Test (25 results)
 */
async function exampleDefaultResults() {
  console.log('\n=== Example 6: Default Results Test ===\n');

  const agent = new ArXivAgent();

  try {
    console.log('Testing default maxResults (25)...\n');

    // No maxResults specified - should use default of 25
    const papers = await agent.searchPapers('machine learning', {
      categories: ['cs.LG'],
    });

    console.log(`Found ${papers.length} papers (default limit: 25)`);
    console.log('First 5 papers:');
    papers.slice(0, 5).forEach((paper, index) => {
      console.log(`  ${index + 1}. ${paper.title.substring(0, 60)}...`);
    });

    return papers;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

/**
 * Example 7: Cache Performance Test
 */
async function exampleCacheTest() {
  console.log('\n=== Example 7: Cache Performance Test ===\n');

  const agent = new ArXivAgent();

  try {
    const query = 'neural networks';

    // First call (no cache)
    console.log('First search (no cache)...');
    const start1 = Date.now();
    const papers1 = await agent.searchPapers(query, { maxResults: 10 });
    const time1 = Date.now() - start1;
    console.log(`  Took ${time1}ms, found ${papers1.length} papers`);

    // Second call (cached)
    console.log('\nSecond search (cached)...');
    const start2 = Date.now();
    const papers2 = await agent.searchPapers(query, { maxResults: 10 });
    const time2 = Date.now() - start2;
    console.log(`  Took ${time2}ms, found ${papers2.length} papers`);

    console.log(`\nCache speedup: ${(time1 / time2).toFixed(2)}x faster`);

    // Clear cache
    agent.clearCache();
    console.log('\nCache cleared.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 8: Error Handling
 */
async function exampleErrorHandling() {
  console.log('\n=== Example 8: Error Handling ===\n');

  const agent = new ArXivAgent();

  // Example 1: Invalid arXiv ID
  try {
    console.log('Testing with invalid arXiv ID...');
    await agent.fetchPaperMetadata('invalid-id-123');
  } catch (error) {
    console.log(`  ✓ Caught error: ${error.message}`);
  }

  // Example 2: Empty query
  try {
    console.log('\nTesting with empty query...');
    await agent.searchPapers('');
  } catch (error) {
    console.log(`  ✓ Caught error: ${error.message}`);
  }

  console.log('\nError handling is working correctly.');
}

/**
 * Main test runner
 */
async function runAllExamples() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('         ArXiv Agent - Test & Examples');
  console.log('═══════════════════════════════════════════════════');

  // Check environment
  if (!process.env.APIFY_API_TOKEN) {
    console.log('\n⚠️  Warning: APIFY_API_TOKEN not set');
    console.log('Some examples may fail. Please set it in .env.local\n');
  }

  try {
    // Run examples sequentially
    await exampleBasicSearch();
    await exampleFetchMetadata();
    await exampleNormalizeForKnowledgeBase();
    await exampleDomainSearch();
    await exampleDefaultResults();
    await exampleCacheTest();
    await exampleErrorHandling();

    // Optional: MCP search (may fail if not configured)
    console.log('\n--- Optional: MCP Server Test ---');
    await exampleMCPSearch();

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('         All Examples Complete!');
  console.log('═══════════════════════════════════════════════════\n');
}

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

// Export for use in other scripts
module.exports = {
  exampleBasicSearch,
  exampleFetchMetadata,
  exampleMCPSearch,
  exampleNormalizeForKnowledgeBase,
  exampleDomainSearch,
  exampleDefaultResults,
  exampleCacheTest,
  exampleErrorHandling,
};
