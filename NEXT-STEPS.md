# Immediate Next Steps for CourseKeeper

## Current Situation
- Next.js is set up but only boilerplate
- Your diff-engine and patch-writer modules are ready
- Teammates working on: Baseline extraction (Phase 3) and Apify→Senso (Phase 4)
- No database or API routes exist yet

## What YOU Should Do Now (Priority Order)

### 1. Fix Project Structure (5 minutes)
```bash
# Move everything into the web directory for consistency
cd /Users/kumar/Documents/Projects/coursekeeper/coursekeeper/web

# Install all dependencies in one place
npm install @prisma/client prisma pdf-parse formidable
npm install openai axios zod jsonwebtoken bcryptjs
npm install @react-pdf/renderer resend
npm install --save-dev @types/formidable @types/jsonwebtoken @types/bcryptjs
```

### 2. Set Up Prisma & Database (15 minutes)
```bash
# In the web directory
npx prisma init

# This creates prisma/schema.prisma and .env
```

Then create the schema:
```prisma
# web/prisma/schema.prisma
# Copy the full schema from Implementation-Phases.md Phase 1.4
```

### 3. Create Environment Variables (5 minutes)
```bash
# web/.env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/coursekeeper"  # Get from teammate or use local
OPENAI_API_KEY="sk-..."  # Get from teammate or use your own
SENSO_API_KEY="..."       # Mock for now if not available
APIFY_API_TOKEN="..."     # Mock for now if not available
CRON_SECRET="dev-secret"
```

### 4. Create API Structure (10 minutes)
```bash
# Create the API directory structure
mkdir -p web/src/app/api/subjects
mkdir -p web/src/app/api/runs
mkdir -p web/src/app/api/test/diff
mkdir -p web/src/lib
```

### 5. Move Your Modules to lib (2 minutes)
```bash
# Move your standalone modules to the lib directory
cp standalone-modules/diff-engine.ts web/src/lib/diff-engine.ts
cp standalone-modules/patch-writer.ts web/src/lib/patch-writer.ts
```

### 6. Create Core API Endpoint (30 minutes)

Create `web/src/app/api/runs/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { DiffAnalysisEngine } from '@/lib/diff-engine'
import { PatchNotesWriter } from '@/lib/patch-writer'

export async function POST(request: NextRequest) {
  try {
    const { subjectId, year } = await request.json()
    
    // FOR NOW: Use mock data to test the pipeline
    const mockBaseline = [
      {
        id: '1',
        name: 'SIFT Features',
        type: 'method' as const,
        section: 'Feature Detection',
        summary: 'Scale-invariant features'
      }
    ]
    
    const mockCanon = [
      {
        title: 'CNNs for Computer Vision',
        url: 'https://example.com',
        venue: 'CVPR',
        year: 2014,
        type: 'paper' as const,
        summary: 'Deep learning revolution'
      }
    ]
    
    // Use your diff engine
    const diffEngine = new DiffAnalysisEngine()
    const changes = await diffEngine.classifyChanges(
      mockBaseline,
      mockCanon,
      year,
      2010
    )
    
    // Use your patch writer
    const patchWriter = new PatchNotesWriter()
    const patchNotes = await patchWriter.generatePatchNotes(
      changes,
      year,
      2010,
      "Computer Vision"
    )
    
    return NextResponse.json({
      success: true,
      patchNotes,
      changes
    })
    
  } catch (error) {
    console.error('Error in /api/runs:', error)
    return NextResponse.json(
      { error: 'Failed to generate patch notes' },
      { status: 500 }
    )
  }
}
```

### 7. Test Your Integration (5 minutes)
```bash
# Start the dev server
cd web
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  -d '{"subjectId": "test", "year": 2014}'
```

## Why This Order?

1. **Unblocks Everyone**: Once you have the API structure, teammates can integrate their parts
2. **Tests Your Code**: You can verify your diff engine and patch writer work in the Next.js context
3. **Creates Foundation**: Database schema and API routes are needed by everyone
4. **Enables Parallel Work**: With mock data, you don't need to wait for teammates' components

## Next After This

Once the above is working:
1. Replace mock data with real database queries (when Phase 3 is done)
2. Add Senso integration for citations (when Phase 4 is done)  
3. Build the UI components (Phase 6)
4. Add PDF generation and email (Phase 7)

## Communication Points

Tell your teammates:
- "I'm setting up the core API structure at `/api/runs` and `/api/subjects`"
- "The Prisma schema is ready in `web/prisma/schema.prisma`"
- "My diff engine and patch writer are ready to integrate"
- "What API keys do we have for OpenAI/Senso/Apify?"
- "What's the Supabase connection string?"
