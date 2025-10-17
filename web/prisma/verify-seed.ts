/**
 * Verify Seed Script
 * Checks that all seed data was created successfully
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('🔍 Verifying seed data...\n');

  try {
    // Check User
    const users = await prisma.user.findMany();
    console.log(`✓ Users: ${users.length}`);
    if (users.length > 0) {
      console.log(`  → ${users[0].email}`);
    }

    // Check Subject
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            baseline: true,
            runs: true,
          },
        },
      },
    });
    console.log(`✓ Subjects: ${subjects.length}`);
    if (subjects.length > 0) {
      const sub = subjects[0];
      console.log(`  → "${sub.title}" (${sub.baselineYear})`);
      console.log(`  → ${sub._count.baseline} baseline topics`);
      console.log(`  → ${sub._count.runs} year runs`);
    }

    // Check Baseline Topics
    const baselineTopics = await prisma.baselineTopic.findMany();
    console.log(`✓ Baseline Topics: ${baselineTopics.length}`);
    const topicTypes = new Set(baselineTopics.map((t) => t.type));
    console.log(`  → Types: ${Array.from(topicTypes).join(', ')}`);

    // Check Canon Items
    const canonItems = await prisma.canonItem.findMany();
    console.log(`✓ Canon Items: ${canonItems.length}`);
    const canonTypes = new Set(canonItems.map((c) => c.type));
    console.log(`  → Types: ${Array.from(canonTypes).join(', ')}`);
    const yearRange = {
      min: Math.min(...canonItems.map((c) => c.year)),
      max: Math.max(...canonItems.map((c) => c.year)),
    };
    console.log(`  → Years: ${yearRange.min} - ${yearRange.max}`);

    // Check Year Runs
    const yearRuns = await prisma.yearRun.findMany({
      include: {
        _count: {
          select: {
            diffs: true,
          },
        },
      },
    });
    console.log(`✓ Year Runs: ${yearRuns.length}`);
    if (yearRuns.length > 0) {
      const run = yearRuns[0];
      console.log(`  → Year ${run.year} (${run.status})`);
      console.log(`  → ${run._count.diffs} diffs`);
    }

    // Check Year Diffs
    const yearDiffs = await prisma.yearDiff.findMany();
    console.log(`✓ Year Diffs: ${yearDiffs.length}`);
    const changeTypes = yearDiffs.reduce((acc, diff) => {
      acc[diff.changeType] = (acc[diff.changeType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(changeTypes).forEach(([type, count]) => {
      console.log(`  → ${type}: ${count}`);
    });

    console.log('\n✨ Seed verification complete!');
    console.log('\n📊 Quick Stats:');
    console.log(`   Total Records: ${
      users.length +
      subjects.length +
      baselineTopics.length +
      canonItems.length +
      yearRuns.length +
      yearDiffs.length
    }`);

    if (subjects.length > 0) {
      console.log('\n🔗 Useful IDs for testing:');
      console.log(`   User ID: ${users[0].id}`);
      console.log(`   Subject ID: ${subjects[0].id}`);
      if (yearRuns.length > 0) {
        console.log(`   Year Run ID: ${yearRuns[0].id}`);
      }
    }
  } catch (error) {
    console.error('❌ Error verifying seed:', error);
    process.exit(1);
  }
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

