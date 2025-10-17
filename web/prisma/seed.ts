/**
 * Database Seed Script for CourseKeeper
 * Populates the database with mock data from diff-engine and patch-writer
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data (optional - comment out if you want to preserve data)
  console.log('🧹 Cleaning existing data...');
  await prisma.yearDiff.deleteMany();
  await prisma.yearRun.deleteMany();
  await prisma.baselineTopic.deleteMany();
  await prisma.canonItem.deleteMany();
  await prisma.upload.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleaned\n');

  // 1. Create test user
  console.log('👤 Creating test user...');
  const user = await prisma.user.create({
    data: {
      email: 'test@coursekeeper.dev',
      name: 'Test User',
    },
  });
  console.log(`✓ Created user: ${user.email}\n`);

  // 2. Create subject (Computer Vision 2010)
  console.log('📚 Creating subject...');
  const subject = await prisma.subject.create({
    data: {
      userId: user.id,
      title: 'Computer Vision',
      discipline: 'CS',
      baselineYear: 2010,
      description: 'Introduction to Computer Vision - covering image processing, feature detection, object recognition, and 3D reconstruction',
    },
  });
  console.log(`✓ Created subject: ${subject.title} (${subject.baselineYear})\n`);

  // 3. Populate baseline topics (from diff-engine.ts mockBaseline)
  console.log('📋 Creating baseline topics...');
  const baselineTopics = await prisma.baselineTopic.createMany({
    data: [
      {
        subjectId: subject.id,
        name: 'SIFT Features',
        type: 'method',
        category: 'Feature Detection',
        section: 'Feature Detection',
        summary: 'Scale-Invariant Feature Transform for object recognition',
        importance: 8,
      },
      {
        subjectId: subject.id,
        name: 'Bag of Visual Words',
        type: 'method',
        category: 'Image Classification',
        section: 'Image Classification',
        summary: 'Histogram-based image representation',
        importance: 7,
      },
      {
        subjectId: subject.id,
        name: 'Epipolar Geometry',
        type: 'concept',
        category: 'Multiple View Geometry',
        section: 'Multiple View Geometry',
        summary: 'Geometric constraints between stereo images',
        importance: 9,
      },
      {
        subjectId: subject.id,
        name: 'Deep Belief Networks',
        type: 'method',
        category: 'Machine Learning',
        section: 'Machine Learning',
        summary: 'Unsupervised learning with stacked RBMs',
        importance: 6,
      },
      {
        subjectId: subject.id,
        name: 'HOG Features',
        type: 'method',
        category: 'Object Detection',
        section: 'Feature Detection',
        summary: 'Histogram of Oriented Gradients for object detection',
        importance: 7,
      },
      {
        subjectId: subject.id,
        name: 'SURF Features',
        type: 'method',
        category: 'Feature Detection',
        section: 'Feature Detection',
        summary: 'Speeded Up Robust Features - faster alternative to SIFT',
        importance: 7,
      },
    ],
  });
  console.log(`✓ Created ${baselineTopics.count} baseline topics\n`);

  // 4. Populate canon items (from diff-engine.ts mockCanon)
  console.log('📖 Creating canon items...');
  const canonItems = await prisma.canonItem.createMany({
    data: [
      {
        discipline: 'CS',
        title: 'Convolutional Neural Networks (AlexNet)',
        url: 'https://papers.nips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
        venue: 'NIPS',
        year: 2012,
        type: 'paper',
        summary: 'Deep CNNs achieve breakthrough on ImageNet',
        confidence: 0.95,
      },
      {
        discipline: 'CS',
        title: 'R-CNN: Region-based Convolutional Networks',
        url: 'https://arxiv.org/abs/1311.2524',
        venue: 'CVPR',
        year: 2014,
        type: 'paper',
        summary: 'Object detection using CNNs on region proposals',
        confidence: 0.9,
      },
      {
        discipline: 'CS',
        title: 'Caffe Deep Learning Framework',
        url: 'https://caffe.berkeleyvision.org/',
        venue: 'Berkeley',
        year: 2014,
        type: 'tool',
        summary: 'Fast, open framework for deep learning',
        confidence: 0.85,
      },
      {
        discipline: 'CS',
        title: 'Deep Neural Networks',
        url: 'https://www.deeplearningbook.org/',
        venue: 'MIT Press',
        year: 2014,
        type: 'concept',
        summary: 'Feedforward and convolutional architectures for vision',
        confidence: 0.9,
      },
      {
        discipline: 'CS',
        title: 'Epipolar Geometry and Structure from Motion',
        url: 'https://www.cs.cmu.edu/~16385/',
        venue: 'CMU Course',
        year: 2014,
        type: 'course',
        summary: 'Fundamental matrix and 3D reconstruction',
        confidence: 0.95,
      },
      {
        discipline: 'CS',
        title: 'ImageNet Classification with Deep CNNs',
        url: 'https://papers.nips.cc/2012',
        venue: 'NIPS',
        year: 2012,
        type: 'paper',
        summary: 'Revolutionary paper that proved deep learning works',
        confidence: 0.98,
      },
      {
        discipline: 'CS',
        title: 'CS231n: Convolutional Neural Networks for Visual Recognition',
        url: 'http://cs231n.stanford.edu',
        venue: 'Stanford',
        year: 2014,
        type: 'course',
        summary: 'Comprehensive CNN course that became industry standard',
        confidence: 0.95,
      },
    ],
  });
  console.log(`✓ Created ${canonItems.count} canon items\n`);

  // 5. Create a year run for 2014
  console.log('🔄 Creating year run (2014)...');
  const yearRun = await prisma.yearRun.create({
    data: {
      subjectId: subject.id,
      year: 2014,
      status: 'completed',
      tldr: 'Deep learning revolutionized computer vision between 2010 and 2014. Hand-crafted features like SIFT were replaced by learned CNN features. New frameworks like Caffe democratized deep learning.',
      startedAt: new Date(),
      completedAt: new Date(),
      changesCount: 5,
      citationsCount: 8,
      processingTime: 45,
    },
  });
  console.log(`✓ Created year run for ${yearRun.year}\n`);

  // 6. Create year diffs (from diff-engine.ts getMockChanges)
  console.log('📝 Creating year diffs...');
  const diffs = await prisma.yearDiff.createMany({
    data: [
      {
        runId: yearRun.id,
        changeType: 'ADD',
        toTitle: 'Transformer Architecture',
        rationale: 'Transformers revolutionized NLP and computer vision after 2017, completely absent from 2010 curriculum',
        confidence: 0.95,
        evidence: [
          { canonId: 'attention_2017', title: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', venue: 'NIPS', year: 2017 }
        ],
        lowEvidence: true,
        section: 'major',
        importance: 10,
      },
      {
        runId: yearRun.id,
        changeType: 'DEPRECATE',
        fromTitle: 'SIFT Features',
        rationale: 'While historically important, SIFT has been largely replaced by learned features from CNNs',
        confidence: 0.8,
        evidence: [
          { canonId: 'survey_2014', title: 'From SIFT to CNNs: Evolution of Features', url: 'https://arxiv.org/abs/1411.4038', venue: 'arXiv', year: 2014 }
        ],
        lowEvidence: true,
        section: 'corrections',
        importance: 7,
      },
      {
        runId: yearRun.id,
        changeType: 'RENAME',
        fromTitle: 'Deep Belief Networks',
        toTitle: 'Deep Neural Networks',
        rationale: 'The terminology shifted as the field standardized around feedforward and convolutional architectures',
        confidence: 0.85,
        evidence: [
          { canonId: 'goodfellow_2016', title: 'Deep Learning Book', url: 'https://deeplearningbook.org', venue: 'MIT Press', year: 2016 }
        ],
        lowEvidence: true,
        section: 'major',
        importance: 6,
      },
      {
        runId: yearRun.id,
        changeType: 'CORRECT',
        fromTitle: 'Feature Engineering is Essential',
        toTitle: 'End-to-End Learning',
        rationale: 'The 2010 emphasis on hand-crafted features was replaced by end-to-end learning paradigm',
        confidence: 0.9,
        evidence: [
          { canonId: 'bengio_2013', title: 'Representation Learning', url: 'https://arxiv.org/abs/1206.5538', venue: 'IEEE', year: 2013 },
          { canonId: 'lecun_2015', title: 'Deep Learning Review', url: 'https://nature.com/articles/nature14539', venue: 'Nature', year: 2015 }
        ],
        lowEvidence: false,
        section: 'corrections',
        importance: 9,
      },
      {
        runId: yearRun.id,
        changeType: 'EMERGE',
        toTitle: 'Vision-Language Models (CLIP)',
        rationale: 'Multimodal models combining vision and language are emerging as a new paradigm',
        confidence: 0.7,
        evidence: [
          { canonId: 'clip_2021', title: 'Learning Transferable Visual Models', url: 'https://openai.com/research/clip', venue: 'OpenAI', year: 2021 }
        ],
        lowEvidence: true,
        section: 'emerging',
        importance: 8,
      },
      {
        runId: yearRun.id,
        changeType: 'ADD',
        toTitle: 'Convolutional Neural Networks',
        rationale: 'CNNs became the dominant approach after AlexNet 2012, representing a paradigm shift in computer vision',
        confidence: 0.95,
        evidence: [
          { canonId: 'alexnet_2012', title: 'ImageNet Classification with Deep CNNs', url: 'https://papers.nips.cc/2012', venue: 'NIPS', year: 2012 },
          { canonId: 'lecun_1998', title: 'Gradient-Based Learning', url: 'https://ieeexplore.ieee.org', venue: 'IEEE', year: 1998 }
        ],
        lowEvidence: false,
        section: 'major',
        importance: 10,
      },
    ],
  });
  console.log(`✓ Created ${diffs.count} year diffs\n`);

  // Summary
  console.log('✨ Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`  • Users: 1`);
  console.log(`  • Subjects: 1`);
  console.log(`  • Baseline Topics: ${baselineTopics.count}`);
  console.log(`  • Canon Items: ${canonItems.count}`);
  console.log(`  • Year Runs: 1`);
  console.log(`  • Year Diffs: ${diffs.count}`);
  console.log('\nTest credentials:');
  console.log(`  Email: ${user.email}`);
  console.log(`  Subject: ${subject.title} (${subject.baselineYear})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

