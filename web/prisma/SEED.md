# Database Seed Documentation

This document explains the seed data and how to use it.

## What Gets Seeded

The seed script (`seed.ts`) populates your database with realistic mock data from the CourseKeeper system, sourced from the standalone modules (`diff-engine.ts` and `patch-writer.ts`).

### Data Overview

1. **1 Test User**
   - Email: `test@coursekeeper.dev`
   - Name: Test User

2. **1 Subject: Computer Vision (2010)**
   - Discipline: Computer Science
   - Baseline Year: 2010
   - Description: Introduction to Computer Vision course

3. **6 Baseline Topics** (What was taught in 2010)
   - SIFT Features (method)
   - Bag of Visual Words (method)
   - Epipolar Geometry (concept)
   - Deep Belief Networks (method)
   - HOG Features (method)
   - SURF Features (method)

4. **7 Canon Items** (Knowledge base from 2012-2014)
   - AlexNet Paper (2012)
   - R-CNN Paper (2014)
   - Caffe Framework (2014)
   - Deep Neural Networks (2014)
   - CS231n Course (2014)
   - And more...

5. **1 Year Run for 2014**
   - Status: Completed
   - Contains generated patch notes summary

6. **6 Year Diffs** (Changes detected)
   - ADD: Transformer Architecture
   - ADD: Convolutional Neural Networks
   - DEPRECATE: SIFT Features
   - RENAME: Deep Belief Networks → Deep Neural Networks
   - CORRECT: Feature Engineering → End-to-End Learning
   - EMERGE: Vision-Language Models (CLIP)

## How to Run

### Option 1: Using npm script (Recommended)

```bash
cd web
npm install  # Install tsx if not already installed
npm run db:seed
```

### Option 2: Using Prisma directly

```bash
cd web
npx prisma db seed
```

### Option 3: Reset database and seed

```bash
cd web
npm run db:reset  # This will reset migrations AND seed
```

## When to Use

- **Initial Setup**: Run seed after setting up your database for the first time
- **Testing**: Populate test data for development
- **Demo**: Generate realistic data for demonstrations
- **CI/CD**: Use in test environments to ensure consistent data

## Cleaning Data

The seed script **automatically cleans existing data** before seeding. If you want to preserve existing data, comment out these lines in `seed.ts`:

```typescript
// Comment out these lines to preserve existing data
await prisma.yearDiff.deleteMany();
await prisma.yearRun.deleteMany();
// ... etc
```

## Database Requirements

Make sure you have:
1. PostgreSQL database running (or configured in `.env`)
2. Migrations applied: `npx prisma migrate dev`
3. Prisma Client generated: `npx prisma generate`

## What's NOT Seeded

The following tables are **not populated** by the seed script:
- `Upload` - PDF uploads (requires actual files)
- `EmailNotification` - Email tracking (created at runtime)

## Customizing Seed Data

To modify the seed data:

1. Edit `prisma/seed.ts`
2. Modify the data arrays (baselineTopics, canonItems, etc.)
3. Run `npm run db:seed` again

## Verifying Seed

After seeding, you can verify the data:

```bash
# Using Prisma Studio (GUI)
npx prisma studio

# Or query directly
node -e "require('@prisma/client').PrismaClient().then(p => p.user.findMany()).then(console.log)"
```

## Troubleshooting

### Error: "tsx command not found"
```bash
npm install tsx --save-dev
```

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: Database connection issues
Check your `DATABASE_URL` in `.env` file.

## API Testing with Seed Data

Use the seeded subject ID to test your API endpoints:

```bash
# Get all runs for the seeded subject
curl http://localhost:3000/api/runs?subjectId=<subject-id>

# Test with the seeded user
curl http://localhost:3000/api/subjects?userId=<user-id>
```

You can find the IDs by running:
```bash
npx prisma studio
```

---

**Note**: The seed data is based on the real-world evolution of Computer Vision from 2010 to 2014, making it realistic and useful for testing the core CourseKeeper functionality.

