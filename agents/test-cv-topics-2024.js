/**
 * Computer Vision Topics 2024 - Comprehensive Test
 *
 * This script:
 * 1. Searches 5 CV topics from 2024
 * 2. Retrieves 10 papers per topic (50 total)
 * 3. Saves results to markdown file
 * 4. Stores metadata in JSON database
 *
 * Usage: node agents/test-cv-topics-2024.js
 */

require('dotenv').config({ path: '.env.local' });
const { ArXivAgent } = require('./arxivagent');
const fs = require('fs');
const path = require('path');

/**
 * 5 Hot Computer Vision Topics from 2024
 */
const CV_TOPICS_2024 = [
  {
    id: 'diffusion-models',
    name: 'Diffusion Models',
    query: 'diffusion models image generation',
    description: 'Diffusion-based generative models for image synthesis and editing'
  },
  {
    id: 'vision-language',
    name: 'Vision-Language Models',
    query: 'vision language models multimodal',
    description: 'Multimodal models combining vision and language understanding'
  },
  {
    id: '3d-reconstruction',
    name: '3D Reconstruction',
    query: '3D reconstruction neural radiance fields NeRF',
    description: 'Neural 3D scene reconstruction and novel view synthesis'
  },
  {
    id: 'video-understanding',
    name: 'Video Understanding',
    query: 'video understanding temporal action recognition',
    description: 'Temporal modeling and action recognition in videos'
  },
  {
    id: 'foundation-models',
    name: 'Vision Foundation Models',
    query: 'vision foundation models self-supervised learning',
    description: 'Large-scale pre-trained models for computer vision'
  }
];

/**
 * Main function to search and collect papers
 */
async function searchCVTopics() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Computer Vision Topics 2024 - ArXiv Search');
  console.log('═══════════════════════════════════════════════════\n');

  const agent = new ArXivAgent();
  const allResults = {
    generatedAt: new Date().toISOString(),
    totalTopics: CV_TOPICS_2024.length,
    totalPapers: 0,
    topics: []
  };

  for (const topic of CV_TOPICS_2024) {
    console.log(`\n📚 Searching: ${topic.name}`);
    console.log(`   Query: "${topic.query}"`);
    console.log(`   Description: ${topic.description}\n`);

    try {
      const papers = await agent.searchPapers(topic.query, {
        maxResults: 10,
        dateFrom: '2024-01-01',
        categories: ['cs.CV'],
        sortBy: 'submittedDate'
      });

      console.log(`   ✓ Found ${papers.length} papers\n`);

      // Add to results
      allResults.topics.push({
        id: topic.id,
        name: topic.name,
        query: topic.query,
        description: topic.description,
        paperCount: papers.length,
        papers: papers
      });

      allResults.totalPapers += papers.length;

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ✗ Error searching ${topic.name}:`, error.message);
      allResults.topics.push({
        id: topic.id,
        name: topic.name,
        query: topic.query,
        description: topic.description,
        paperCount: 0,
        papers: [],
        error: error.message
      });
    }
  }

  return allResults;
}

/**
 * Generate markdown report
 */
function generateMarkdown(results) {
  let md = `# Computer Vision Research Papers - 2024\n\n`;
  md += `**Generated:** ${new Date(results.generatedAt).toLocaleString()}\n\n`;
  md += `**Total Topics:** ${results.totalTopics}\n\n`;
  md += `**Total Papers:** ${results.totalPapers}\n\n`;
  md += `---\n\n`;

  // Table of contents
  md += `## Table of Contents\n\n`;
  results.topics.forEach((topic, idx) => {
    md += `${idx + 1}. [${topic.name}](#${topic.id}) (${topic.paperCount} papers)\n`;
  });
  md += `\n---\n\n`;

  // Details for each topic
  results.topics.forEach((topic, topicIdx) => {
    md += `## ${topicIdx + 1}. ${topic.name}\n\n`;
    md += `**Query:** \`${topic.query}\`\n\n`;
    md += `**Description:** ${topic.description}\n\n`;
    md += `**Papers Found:** ${topic.paperCount}\n\n`;

    if (topic.error) {
      md += `⚠️ **Error:** ${topic.error}\n\n`;
    } else if (topic.papers.length > 0) {
      topic.papers.forEach((paper, paperIdx) => {
        md += `### ${topicIdx + 1}.${paperIdx + 1} ${paper.title}\n\n`;
        md += `- **Authors:** ${paper.authors.slice(0, 5).join(', ')}${paper.authors.length > 5 ? ', et al.' : ''}\n`;
        md += `- **Year:** ${paper.year}\n`;
        md += `- **arXiv ID:** [${paper.arxivId}](${paper.url})\n`;
        md += `- **Categories:** ${paper.categories.join(', ')}\n`;
        md += `- **PDF:** [Download](${paper.pdfUrl})\n`;
        md += `\n**Abstract:**\n\n`;
        md += `> ${paper.abstract.substring(0, 500)}${paper.abstract.length > 500 ? '...' : ''}\n\n`;
        md += `---\n\n`;
      });
    } else {
      md += `*No papers found for this topic.*\n\n`;
    }
  });

  // Summary statistics
  md += `## Summary Statistics\n\n`;
  md += `| Topic | Papers Found |\n`;
  md += `|-------|-------------|\n`;
  results.topics.forEach(topic => {
    md += `| ${topic.name} | ${topic.paperCount} |\n`;
  });
  md += `\n`;

  return md;
}

/**
 * Save results to files
 */
async function saveResults(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const outputDir = path.join(__dirname, '../docs');

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save markdown file
  const mdPath = path.join(outputDir, `cv-topics-2024-${timestamp}.md`);
  const markdown = generateMarkdown(results);
  fs.writeFileSync(mdPath, markdown, 'utf8');
  console.log(`\n✓ Markdown report saved: ${mdPath}`);

  // Save JSON database
  const dbPath = path.join(outputDir, `cv-topics-2024-${timestamp}.json`);
  fs.writeFileSync(dbPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`✓ JSON database saved: ${dbPath}`);

  // Also save to a canonical "latest" version
  const latestMdPath = path.join(outputDir, 'cv-topics-2024-latest.md');
  const latestDbPath = path.join(outputDir, 'cv-topics-2024-latest.json');
  fs.writeFileSync(latestMdPath, markdown, 'utf8');
  fs.writeFileSync(latestDbPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`✓ Latest versions updated`);

  return {
    markdown: mdPath,
    database: dbPath
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    // Search all topics
    const results = await searchCVTopics();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   Search Complete!');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Total Papers Collected: ${results.totalPapers}`);

    // Display summary
    console.log('\nPapers per Topic:');
    results.topics.forEach(topic => {
      console.log(`  - ${topic.name}: ${topic.paperCount} papers`);
    });

    // Save results
    const files = await saveResults(results);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('   Files Generated Successfully!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  CV_TOPICS_2024,
  searchCVTopics,
  generateMarkdown,
  saveResults
};
