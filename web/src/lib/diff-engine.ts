/**
 * Standalone Diff Analysis Engine for CourseKeeper
 * Can be developed and tested independently, then integrated into Next.js
 */

import OpenAI from 'openai';

// Types that will be shared across the project
export interface BaselineTopic {
  id: string;
  name: string;
  type: 'concept' | 'method' | 'system' | 'paper';
  section?: string;
  summary?: string;
  sourcePage?: string;
}

export interface CanonItem {
  title: string;
  url: string;
  venue: string;
  year: number;
  type: 'paper' | 'tool' | 'course' | 'concept';
  summary: string;
  confidence?: number;
}

export interface DiffChange {
  changeType: 'ADD' | 'RENAME' | 'DEPRECATE' | 'CORRECT' | 'EMERGE';
  fromTitle?: string;
  toTitle?: string;
  rationale: string;
  confidence: number;
  evidence?: Array<{
    canonId?: string
    title: string
    url: string
    venue: string
    year: number
  }>;
  lowEvidence?: boolean;
}

export class DiffAnalysisEngine {
  private openai: OpenAI;
  
  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Map baseline topics to canon items for a given year
   */
  async mapBaselineToCanon(
    baseline: BaselineTopic[],
    canonItems: CanonItem[],
    targetYear: number
  ): Promise<Map<string, CanonItem[]>> {
    const mappings = new Map<string, CanonItem[]>();
    
    // Filter canon items to those active in target year
    const relevantCanon = canonItems.filter(item => item.year <= targetYear);
    
    // Generate embeddings for semantic matching (simplified for standalone)
    for (const topic of baseline) {
      const relatedItems = await this.findSemanticMatches(topic, relevantCanon);
      mappings.set(topic.id, relatedItems);
    }
    
    return mappings;
  }

  /**
   * Find semantically similar canon items for a baseline topic
   */
  private async findSemanticMatches(
    topic: BaselineTopic,
    canonItems: CanonItem[]
  ): Promise<CanonItem[]> {
    // In production, use embeddings. For standalone testing, use keyword matching
    const matches = canonItems.filter(item => {
      const topicLower = topic.name.toLowerCase();
      const itemLower = item.title.toLowerCase();
      
      // Simple keyword matching for testing
      return itemLower.includes(topicLower) || 
             topicLower.includes(itemLower) ||
             this.calculateSimilarity(topicLower, itemLower) > 0.5;
    });
    
    return matches.slice(0, 5); // Top 5 matches
  }

  /**
   * Simple similarity calculation for testing without embeddings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Classify changes between baseline and current knowledge
   */
  async classifyChanges(
    baseline: BaselineTopic[],
    canonItems: CanonItem[],
    year: number,
    baselineYear: number
  ): Promise<DiffChange[]> {
    const mappings = await this.mapBaselineToCanon(baseline, canonItems, year);
    
    const prompt = `
    You are analyzing knowledge evolution in a field from ${baselineYear} to ${year}.
    
    Baseline topics (what was taught in ${baselineYear}):
    ${JSON.stringify(baseline, null, 2)}
    
    Current canon items (what exists in ${year}):
    ${JSON.stringify(canonItems.filter(c => c.year <= year), null, 2)}
    
    Topic mappings:
    ${JSON.stringify(Array.from(mappings.entries()), null, 2)}
    
    Classify changes into these categories:
    - ADD: Completely new concepts/tools not in baseline
    - RENAME: Same concept, different name/terminology
    - DEPRECATE: Baseline topic no longer relevant/used
    - CORRECT: Baseline had misconception, now corrected
    - EMERGE: Experimental/cutting-edge (lower confidence)
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are an expert at analyzing knowledge evolution in academic fields."
          },
          { role: "user", content: prompt }
        ],
        functions: [{
          name: "classify_changes",
          description: "Classify knowledge changes between two time periods",
          parameters: {
            type: "object",
            properties: {
              changes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    changeType: {
                      type: "string",
                      enum: ["ADD", "RENAME", "DEPRECATE", "CORRECT", "EMERGE"]
                    },
                    fromTitle: { type: "string" },
                    toTitle: { type: "string" },
                    rationale: { type: "string" },
                    confidence: { type: "number", minimum: 0, maximum: 1 }
                  },
                  required: ["changeType", "rationale", "confidence"]
                }
              }
            },
            required: ["changes"]
          }
        }],
        function_call: { name: "classify_changes" }
      });

      const result = response.choices[0].message.function_call;
      if (!result) throw new Error("No function call in response");
      
      return JSON.parse(result.arguments).changes;
    } catch (error) {
      console.error('Error classifying changes:', error);
      // Return mock data for testing without OpenAI
      return this.getMockChanges();
    }
  }

  /**
   * Generate mock changes for testing without OpenAI API
   */
  private getMockChanges(): DiffChange[] {
    return [
      {
        changeType: 'ADD',
        toTitle: 'Transformer Architecture',
        rationale: 'Transformers revolutionized NLP and computer vision after 2017, completely absent from 2010 curriculum',
        confidence: 0.95
      },
      {
        changeType: 'DEPRECATE',
        fromTitle: 'SIFT Features',
        rationale: 'While historically important, SIFT has been largely replaced by learned features from CNNs',
        confidence: 0.8
      },
      {
        changeType: 'RENAME',
        fromTitle: 'Deep Belief Networks',
        toTitle: 'Deep Neural Networks',
        rationale: 'The terminology shifted as the field standardized around feedforward and convolutional architectures',
        confidence: 0.85
      },
      {
        changeType: 'CORRECT',
        fromTitle: 'Feature Engineering is Essential',
        toTitle: 'End-to-End Learning',
        rationale: 'The 2010 emphasis on hand-crafted features was replaced by end-to-end learning paradigm',
        confidence: 0.9
      },
      {
        changeType: 'EMERGE',
        toTitle: 'Vision-Language Models (CLIP)',
        rationale: 'Multimodal models combining vision and language are emerging as a new paradigm',
        confidence: 0.7
      }
    ];
  }

  /**
   * Rank changes by importance
   */
  rankChangesByImportance(changes: DiffChange[]): DiffChange[] {
    const weights = {
      'ADD': 1.0,      // New knowledge is critical
      'CORRECT': 0.9,  // Fixing misconceptions is very important
      'DEPRECATE': 0.7, // Knowing what's outdated helps
      'RENAME': 0.5,   // Terminology updates are useful
      'EMERGE': 0.6    // Emerging trends are interesting
    };

    return changes.sort((a, b) => {
      const scoreA = weights[a.changeType] * a.confidence;
      const scoreB = weights[b.changeType] * b.confidence;
      return scoreB - scoreA;
    });
  }
}

// ============================================
// TESTING SECTION - Can run standalone
// ============================================

async function testDiffEngine() {
  console.log('🧪 Testing Diff Analysis Engine...\n');
  
  const engine = new DiffAnalysisEngine();
  
  // Mock baseline topics (Computer Vision 2010)
  const mockBaseline: BaselineTopic[] = [
    {
      id: '1',
      name: 'SIFT Features',
      type: 'method',
      section: 'Feature Detection',
      summary: 'Scale-Invariant Feature Transform for object recognition'
    },
    {
      id: '2',
      name: 'Bag of Visual Words',
      type: 'method',
      section: 'Image Classification',
      summary: 'Histogram-based image representation'
    },
    {
      id: '3',
      name: 'Epipolar Geometry',
      type: 'concept',
      section: 'Multiple View Geometry',
      summary: 'Geometric constraints between stereo images'
    },
    {
      id: '4',
      name: 'Deep Belief Networks',
      type: 'method',
      section: 'Machine Learning',
      summary: 'Unsupervised learning with stacked RBMs'
    }
  ];
  
  // Mock canon items (Computer Vision 2014)
  const mockCanon: CanonItem[] = [
    {
      title: 'Convolutional Neural Networks (AlexNet)',
      url: 'https://papers.nips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
      venue: 'NIPS',
      year: 2012,
      type: 'paper',
      summary: 'Deep CNNs achieve breakthrough on ImageNet'
    },
    {
      title: 'R-CNN: Region-based Convolutional Networks',
      url: 'https://arxiv.org/abs/1311.2524',
      venue: 'CVPR',
      year: 2014,
      type: 'paper',
      summary: 'Object detection using CNNs on region proposals'
    },
    {
      title: 'Caffe Deep Learning Framework',
      url: 'https://caffe.berkeleyvision.org/',
      venue: 'Berkeley',
      year: 2014,
      type: 'tool',
      summary: 'Fast, open framework for deep learning'
    },
    {
      title: 'Deep Neural Networks',
      url: 'https://www.deeplearningbook.org/',
      venue: 'MIT Press',
      year: 2014,
      type: 'concept',
      summary: 'Feedforward and convolutional architectures for vision'
    },
    {
      title: 'Epipolar Geometry and Structure from Motion',
      url: 'https://www.cs.cmu.edu/~16385/',
      venue: 'CMU Course',
      year: 2014,
      type: 'course',
      summary: 'Fundamental matrix and 3D reconstruction'
    }
  ];
  
  console.log('📚 Baseline Topics:', mockBaseline.length);
  console.log('📖 Canon Items:', mockCanon.length);
  console.log('\n');
  
  // Test change classification
  console.log('🔍 Classifying changes from 2010 to 2014...\n');
  const changes = await engine.classifyChanges(
    mockBaseline,
    mockCanon,
    2014,
    2010
  );
  
  // Rank by importance
  const rankedChanges = engine.rankChangesByImportance(changes);
  
  console.log('📊 Detected Changes (ranked by importance):\n');
  rankedChanges.forEach((change, idx) => {
    console.log(`${idx + 1}. [${change.changeType}] ${change.fromTitle || ''} → ${change.toTitle || ''}`);
    console.log(`   Rationale: ${change.rationale}`);
    console.log(`   Confidence: ${(change.confidence * 100).toFixed(0)}%\n`);
  });
  
  // Statistics
  const stats = {
    total: changes.length,
    adds: changes.filter(c => c.changeType === 'ADD').length,
    deprecates: changes.filter(c => c.changeType === 'DEPRECATE').length,
    renames: changes.filter(c => c.changeType === 'RENAME').length,
    corrections: changes.filter(c => c.changeType === 'CORRECT').length,
    emerging: changes.filter(c => c.changeType === 'EMERGE').length
  };
  
  console.log('📈 Change Statistics:');
  console.log(`   Total Changes: ${stats.total}`);
  console.log(`   New Additions: ${stats.adds}`);
  console.log(`   Deprecations: ${stats.deprecates}`);
  console.log(`   Renames: ${stats.renames}`);
  console.log(`   Corrections: ${stats.corrections}`);
  console.log(`   Emerging: ${stats.emerging}`);
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDiffEngine().catch(console.error);
}

export default DiffAnalysisEngine;
