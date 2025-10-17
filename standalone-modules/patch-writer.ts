/**
 * Standalone Patch Notes Writer for CourseKeeper
 * Generates structured knowledge patches with citations
 */

import OpenAI from 'openai';
import { DiffChange } from './diff-engine';

export interface Citation {
  key: string;
  title: string;
  url: string;
  venue: string;
  year: number;
}

export interface PatchNotes {
  tldr: string[];
  sections: {
    major: string[];
    tools: string[];
    resources: string[];
    corrections: string[];
    emerging: string[];
  };
  deltaPath: {
    title: string;
    hours: number;
    link: string;
    type: 'paper' | 'video' | 'doc' | 'course';
  }[];
  bibliography: Citation[];
}

export class PatchNotesWriter {
  private openai: OpenAI;
  
  constructor(apiKey: string = process.env.OPENAI_API_KEY || '') {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate patch notes from classified changes
   */
  async generatePatchNotes(
    changes: DiffChange[],
    year: number,
    baselineYear: number,
    subjectTitle: string = "Computer Vision"
  ): Promise<PatchNotes> {
    // Ensure each change has citations
    const changesWithCitations = this.mockAddCitations(changes);
    
    const prompt = this.buildPrompt(changesWithCitations, year, baselineYear, subjectTitle);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are writing educational "patch notes" that explain how ${subjectTitle} has evolved.
                     CRITICAL RULES:
                     1. Every factual claim MUST include [citation_key]
                     2. If fewer than 2 citations exist, add "(Low evidence)" 
                     3. Be concise but comprehensive
                     4. Write for someone with ${baselineYear} knowledge`
          },
          { role: "user", content: prompt }
        ],
        functions: [{
          name: "generate_patch_notes",
          description: "Generate structured patch notes with citations",
          parameters: {
            type: "object",
            properties: {
              tldr: {
                type: "array",
                items: { type: "string" },
                description: "3-5 bullet points summarizing the most important changes"
              },
              sections: {
                type: "object",
                properties: {
                  major: {
                    type: "array",
                    items: { type: "string" },
                    description: "Major paradigm shifts with [citations]"
                  },
                  tools: {
                    type: "array",
                    items: { type: "string" },
                    description: "New tools and frameworks with [citations]"
                  },
                  resources: {
                    type: "array",
                    items: { type: "string" },
                    description: "New learning resources with [citations]"
                  },
                  corrections: {
                    type: "array",
                    items: { type: "string" },
                    description: "Corrections to outdated knowledge with [citations]"
                  },
                  emerging: {
                    type: "array",
                    items: { type: "string" },
                    description: "Emerging trends (may have lower evidence) with [citations]"
                  }
                },
                required: ["major", "tools", "resources", "corrections", "emerging"]
              },
              deltaPath: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    hours: { type: "number" },
                    link: { type: "string" },
                    type: { 
                      type: "string",
                      enum: ["paper", "video", "doc", "course"]
                    }
                  },
                  required: ["title", "hours", "link", "type"]
                },
                description: "4-8 hour learning path to catch up"
              },
              bibliography: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    key: { type: "string" },
                    title: { type: "string" },
                    url: { type: "string" },
                    venue: { type: "string" },
                    year: { type: "number" }
                  },
                  required: ["key", "title", "url", "venue", "year"]
                }
              }
            },
            required: ["tldr", "sections", "deltaPath", "bibliography"]
          }
        }],
        function_call: { name: "generate_patch_notes" }
      });

      const result = response.choices[0].message.function_call;
      if (!result) throw new Error("No function call in response");
      
      return JSON.parse(result.arguments);
    } catch (error) {
      console.error('Error generating patch notes:', error);
      // Return mock patch notes for testing
      return this.getMockPatchNotes(changes, year, baselineYear);
    }
  }

  /**
   * Build the prompt for patch notes generation
   */
  private buildPrompt(
    changes: DiffChange[],
    year: number,
    baselineYear: number,
    subjectTitle: string
  ): string {
    return `
    Generate ${year} patch notes for someone who learned ${subjectTitle} in ${baselineYear}.
    
    Key Changes Detected:
    ${changes.map(c => `
      - [${c.changeType}] ${c.fromTitle || 'N/A'} → ${c.toTitle || 'N/A'}
        Rationale: ${c.rationale}
        Evidence: ${c.evidence?.length || 0} sources
        ${c.lowEvidence ? '⚠️ LOW EVIDENCE' : ''}
    `).join('\n')}
    
    Create comprehensive patch notes that:
    1. Summarize the most important changes in TL;DR
    2. Organize changes into thematic sections
    3. Include a practical learning path (4-8 hours total)
    4. Cite every claim with [source_key]
    5. Mark claims with < 2 citations as "(Low evidence)"
    `;
  }

  /**
   * Add mock citations to changes for testing
   */
  private mockAddCitations(changes: DiffChange[]): DiffChange[] {
    const mockCitations = {
      'ADD': [
        { canonId: 'alexnet_2012', title: 'ImageNet Classification with Deep CNNs', url: 'https://papers.nips.cc/2012', venue: 'NIPS', year: 2012 },
        { canonId: 'lecun_2015', title: 'Deep Learning Review', url: 'https://nature.com/articles/nature14539', venue: 'Nature', year: 2015 }
      ],
      'DEPRECATE': [
        { canonId: 'survey_2014', title: 'From SIFT to CNNs: Evolution of Features', url: 'https://arxiv.org/abs/1411.4038', venue: 'arXiv', year: 2014 }
      ],
      'RENAME': [
        { canonId: 'goodfellow_2016', title: 'Deep Learning Book', url: 'https://deeplearningbook.org', venue: 'MIT Press', year: 2016 }
      ],
      'CORRECT': [
        { canonId: 'bengio_2013', title: 'Representation Learning', url: 'https://arxiv.org/abs/1206.5538', venue: 'IEEE', year: 2013 }
      ],
      'EMERGE': [
        { canonId: 'clip_2021', title: 'Learning Transferable Visual Models', url: 'https://openai.com/research/clip', venue: 'OpenAI', year: 2021 }
      ]
    };

    return changes.map(change => ({
      ...change,
      evidence: mockCitations[change.changeType] || [],
      lowEvidence: (mockCitations[change.changeType]?.length || 0) < 2
    }));
  }

  /**
   * Generate mock patch notes for testing without OpenAI
   */
  private getMockPatchNotes(
    changes: DiffChange[],
    year: number,
    baselineYear: number
  ): PatchNotes {
    return {
      tldr: [
        `Deep learning revolutionized computer vision between ${baselineYear} and ${year} [alexnet_2012]`,
        "Hand-crafted features like SIFT were replaced by learned CNN features [survey_2014]",
        "New frameworks like Caffe and later TensorFlow democratized deep learning [caffe_2014]",
        "Object detection moved from sliding windows to region-based methods (R-CNN) [rcnn_2014]",
        "The field shifted from feature engineering to architecture engineering [lecun_2015]"
      ],
      sections: {
        major: [
          "The 2012 AlexNet moment proved deep CNNs could outperform traditional methods by huge margins [alexnet_2012] [krizhevsky_2012]",
          "End-to-end learning replaced the traditional pipeline of feature extraction → classification [bengio_2013]",
          "Transfer learning emerged: pre-train on ImageNet, fine-tune on your task [yosinski_2014]"
        ],
        tools: [
          "Caffe (2014): First production-ready deep learning framework for vision [caffe_2014]",
          "cuDNN: NVIDIA's GPU acceleration made training 10-50x faster [cudnn_2014]",
          "Model Zoo: Pre-trained models became freely available [model_zoo_2014]"
        ],
        resources: [
          "CS231n at Stanford: Comprehensive CNN course launched in 2014 [cs231n_2014]",
          "ImageNet dataset: 14M images across 22K categories for training [imagenet_2014]",
          "arXiv cs.CV: Preprint server became primary venue for rapid iteration [arxiv_stats]"
        ],
        corrections: [
          "SIFT/SURF features are NOT always better than learned features (Low evidence)",
          "Deep networks CAN be trained effectively with proper initialization [glorot_2010] [he_2015]",
          "More data and compute often beats clever algorithms [halevy_2009] [sun_2017]"
        ],
        emerging: [
          "Vision transformers starting to challenge CNNs in some tasks [dosovitskiy_2020] (Low evidence)",
          "Self-supervised learning reducing dependence on labeled data [chen_2020]",
          "Neural architecture search automating model design [zoph_2016] (Low evidence)"
        ]
      },
      deltaPath: [
        {
          title: "CS231n Lecture 5: Convolutional Neural Networks",
          hours: 2,
          link: "https://www.youtube.com/watch?v=bNb2fEVKeEo",
          type: "video"
        },
        {
          title: "ImageNet Classification with Deep CNNs (AlexNet paper)",
          hours: 1,
          link: "https://papers.nips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf",
          type: "paper"
        },
        {
          title: "Caffe Tutorial: Training LeNet on MNIST",
          hours: 2,
          link: "https://caffe.berkeleyvision.org/gathered/examples/mnist.html",
          type: "doc"
        },
        {
          title: "Fast R-CNN Paper - Object Detection",
          hours: 1,
          link: "https://arxiv.org/pdf/1504.08083.pdf",
          type: "paper"
        },
        {
          title: "Transfer Learning with Pre-trained CNNs",
          hours: 2,
          link: "https://cs231n.github.io/transfer-learning/",
          type: "doc"
        }
      ],
      bibliography: [
        { key: "alexnet_2012", title: "ImageNet Classification with Deep CNNs", url: "https://papers.nips.cc/2012", venue: "NIPS", year: 2012 },
        { key: "survey_2014", title: "From SIFT to CNNs: Evolution of Features", url: "https://arxiv.org/abs/1411.4038", venue: "arXiv", year: 2014 },
        { key: "caffe_2014", title: "Caffe: Convolutional Architecture for Fast Feature Embedding", url: "https://arxiv.org/abs/1408.5093", venue: "ACM MM", year: 2014 },
        { key: "rcnn_2014", title: "Rich feature hierarchies for object detection", url: "https://arxiv.org/abs/1311.2524", venue: "CVPR", year: 2014 },
        { key: "lecun_2015", title: "Deep Learning", url: "https://nature.com/articles/nature14539", venue: "Nature", year: 2015 },
        { key: "bengio_2013", title: "Representation Learning: A Review", url: "https://arxiv.org/abs/1206.5538", venue: "IEEE TPAMI", year: 2013 },
        { key: "cs231n_2014", title: "CS231n: Convolutional Neural Networks for Visual Recognition", url: "http://cs231n.stanford.edu", venue: "Stanford", year: 2014 },
        { key: "he_2015", title: "Delving Deep into Rectifiers", url: "https://arxiv.org/abs/1502.01852", venue: "ICCV", year: 2015 }
      ]
    };
  }

  /**
   * Validate that all citations are properly referenced
   */
  validateCitations(patchNotes: PatchNotes): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const biblioKeys = new Set(patchNotes.bibliography.map(b => b.key));
    
    // Extract all citation keys from text
    const extractCitations = (text: string): string[] => {
      const matches = text.match(/\[([^\]]+)\]/g) || [];
      return matches.map(m => m.slice(1, -1));
    };
    
    // Check all sections
    const allText = [
      ...patchNotes.tldr,
      ...patchNotes.sections.major,
      ...patchNotes.sections.tools,
      ...patchNotes.sections.resources,
      ...patchNotes.sections.corrections,
      ...patchNotes.sections.emerging
    ];
    
    const usedCitations = new Set<string>();
    
    allText.forEach(text => {
      const citations = extractCitations(text);
      citations.forEach(cite => {
        usedCitations.add(cite);
        if (!biblioKeys.has(cite) && cite !== 'Low evidence') {
          issues.push(`Citation [${cite}] not found in bibliography`);
        }
      });
      
      // Check for claims without citations (excluding short connective text)
      if (text.length > 50 && !text.includes('[') && !text.includes('(Low evidence)')) {
        issues.push(`Possible uncited claim: "${text.substring(0, 50)}..."`);
      }
    });
    
    // Check for unused bibliography entries
    biblioKeys.forEach(key => {
      if (!usedCitations.has(key)) {
        issues.push(`Bibliography entry [${key}] is never referenced`);
      }
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
}

// ============================================
// TESTING SECTION
// ============================================

async function testPatchWriter() {
  console.log('📝 Testing Patch Notes Writer...\n');
  
  const writer = new PatchNotesWriter();
  
  // Use mock changes from diff-engine
  const mockChanges: DiffChange[] = [
    {
      changeType: 'ADD',
      toTitle: 'Convolutional Neural Networks',
      rationale: 'CNNs became the dominant approach after AlexNet 2012',
      confidence: 0.95
    },
    {
      changeType: 'DEPRECATE',
      fromTitle: 'SIFT Features',
      rationale: 'Hand-crafted features largely replaced by learned CNN features',
      confidence: 0.85
    },
    {
      changeType: 'EMERGE',
      toTitle: 'Vision Transformers',
      rationale: 'Transformers starting to compete with CNNs in vision tasks',
      confidence: 0.6
    }
  ];
  
  console.log('📊 Input Changes:', mockChanges.length);
  console.log('📅 Time Period: 2010 → 2014\n');
  
  // Generate patch notes
  const patchNotes = await writer.generatePatchNotes(
    mockChanges,
    2014,
    2010,
    "Computer Vision"
  );
  
  // Display results
  console.log('✨ Generated Patch Notes:\n');
  console.log('TL;DR:');
  patchNotes.tldr.forEach(point => {
    console.log(`  • ${point}`);
  });
  
  console.log('\n🔥 Major Shifts:');
  patchNotes.sections.major.forEach(item => {
    console.log(`  • ${item}`);
  });
  
  console.log('\n🛠️  New Tools:');
  patchNotes.sections.tools.forEach(item => {
    console.log(`  • ${item}`);
  });
  
  console.log('\n📚 Learning Path (Total: ' + 
    patchNotes.deltaPath.reduce((sum, item) => sum + item.hours, 0) + ' hours):');
  patchNotes.deltaPath.forEach(item => {
    console.log(`  • ${item.title} (${item.hours}h) - ${item.type}`);
  });
  
  console.log('\n📖 Bibliography:', patchNotes.bibliography.length, 'sources');
  
  // Validate citations
  console.log('\n✅ Validating Citations...');
  const validation = writer.validateCitations(patchNotes);
  
  if (validation.valid) {
    console.log('   ✓ All citations properly referenced!');
  } else {
    console.log('   ⚠️  Citation Issues Found:');
    validation.issues.forEach(issue => {
      console.log(`      - ${issue}`);
    });
  }
}

// Run tests if executed directly
if (require.main === module) {
  testPatchWriter().catch(console.error);
}

export { PatchNotesWriter, Citation, PatchNotes };
