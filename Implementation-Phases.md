# CourseKeeper Implementation Phases - LLM Build Guide

## Project Overview

**Goal**: Build a web application that generates "Syllabus Patch Notes" - annual knowledge updates showing what's changed in a field since a user studied it.

**Core Flow**: User uploads old syllabus PDF → System extracts baseline topics → Generates yearly "patch notes" comparing old knowledge to current state → Delivers via web UI and PDF with citations.

**Required Integrations** (Must use all three):
1. **OpenAI** - LLM for extraction, classification, and writing
2. **Senso** - Knowledge base with citation provenance
3. **Apify** - Web scraping for academic/industry sources

---

## Phase 1: Foundation & Infrastructure Setup

### 1.1 Initialize Next.js Project

```bash
npx create-next-app@latest coursekeeper --typescript --tailwind --app --src-dir=false
cd coursekeeper
```

### 1.2 Install Core Dependencies

```bash
npm install @prisma/client prisma
npm install @vercel/postgres @neondatabase/serverless
npm install openai
npm install axios
npm install formidable # for file uploads
npm install pdf-parse # for PDF processing
npm install @react-pdf/renderer # for PDF generation
npm install resend # for email
npm install jsonwebtoken bcryptjs # for auth
npm install zod # for validation
```

### 1.3 Environment Configuration

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# APIs
OPENAI_API_KEY="sk-..."
SENSO_API_KEY="..."
SENSO_API_URL="https://api.senso.ai/v1"
APIFY_API_TOKEN="..."

# Email
RESEND_API_KEY="re_..."

# App
NEXTAUTH_SECRET="..."
CRON_SECRET="your-secret-key"
```

### 1.4 Prisma Schema Setup

Create `prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  Subjects  Subject[]
}

model Subject {
  id           String   @id @default(cuid())
  userId       String
  title        String           // e.g., "Computer Vision"
  discipline   String           // "CS"|"BIO"|"ECON"|...
  baselineYear Int              // e.g., 2010
  createdAt    DateTime @default(now())
  uploads      Upload[]
  baseline     BaselineTopic[]
  runs         YearRun[]
  User         User     @relation(fields: [userId], references: [id])
}

model Upload {
  id        String   @id @default(cuid())
  subjectId String
  fileUrl   String
  pages     Int?
  createdAt DateTime @default(now())
  Subject   Subject  @relation(fields: [subjectId], references: [id])
}

model BaselineTopic {
  id         String  @id @default(cuid())
  subjectId  String
  name       String         // "SIFT", "Epipolar geometry"
  type       String         // "concept"|"method"|"system"|"paper"
  section    String?
  summary    String?
  sourcePage String?        // slide/page anchor
  Subject    Subject @relation(fields: [subjectId], references: [id])
  @@index([subjectId])
}

model YearRun {
  id         String   @id @default(cuid())
  subjectId  String
  year       Int              // 2011..Now
  status     String           // "pending"|"ok"|"failed"
  pdfUrl     String?
  webJsonUrl String?          // optional cache of rendered JSON
  tlDr       String?
  createdAt  DateTime @default(now())
  finishedAt DateTime?
  diffs      YearDiff[]
  Subject    Subject  @relation(fields: [subjectId], references: [id])
  @@index([subjectId, year])
}

model YearDiff {
  id         String   @id @default(cuid())
  runId      String
  changeType String   // "ADD"|"RENAME"|"DEPRECATE"|"CORRECT"|"EMERGE"|"HOTFIX"
  fromTitle  String?
  toTitle    String?
  rationale  String   // short "why"
  confidence Float
  evidence   Json     // [{canonId,title,url,venue,year}]
  YearRun    YearRun  @relation(fields: [runId], references: [id])
  @@index([runId])
}
```

### 1.5 Initialize Database

```bash
npx prisma generate
npx prisma db push
```

---

## Phase 2: Core API Implementation

### 2.1 API Route: Upload Subject

Create `app/api/subjects/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import formidable from 'formidable'
import { extractTopics } from '@/lib/openai'
import { uploadToStorage } from '@/lib/storage'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  // Parse multipart form data
  const formData = await request.formData()
  const file = formData.get('file') as File
  const title = formData.get('title') as string
  const baselineYear = parseInt(formData.get('baselineYear') as string)
  const discipline = formData.get('discipline') as string || 'CS'
  
  // Upload file to storage
  const fileUrl = await uploadToStorage(file)
  
  // Extract PDF text
  const pdfText = await extractPdfText(file)
  
  // Call OpenAI to extract topics
  const topics = await extractTopics(pdfText, discipline)
  
  // Create subject with baseline topics
  const subject = await prisma.subject.create({
    data: {
      userId: getUserId(request), // implement auth
      title,
      discipline,
      baselineYear,
      uploads: {
        create: {
          fileUrl,
          pages: topics.pageCount
        }
      },
      baseline: {
        create: topics.topics.map(t => ({
          name: t.name,
          type: t.type,
          section: t.section,
          summary: t.summary,
          sourcePage: t.sourcePage
        }))
      }
    }
  })
  
  return NextResponse.json({ subjectId: subject.id })
}

export async function GET(request: NextRequest) {
  const subjects = await prisma.subject.findMany({
    where: { userId: getUserId(request) },
    include: { _count: { select: { runs: true } } }
  })
  
  return NextResponse.json(subjects)
}
```

### 2.2 OpenAI Integration for Topic Extraction

Create `lib/openai.ts`:
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function extractTopics(pdfText: string, discipline: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are extracting a topic map from course slides. Return only structured JSON via the function."
      },
      {
        role: "user",
        content: `Extract topics from this ${discipline} course material:\n\n${pdfText}`
      }
    ],
    functions: [{
      name: "extract_topics",
      description: "Extract structured topics from course material",
      parameters: {
        type: "object",
        properties: {
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", enum: ["concept", "method", "system", "paper"] },
                section: { type: "string" },
                summary: { type: "string" },
                sourcePage: { type: "string" }
              },
              required: ["name", "type", "summary"]
            }
          },
          pageCount: { type: "number" }
        },
        required: ["topics"]
      }
    }],
    function_call: { name: "extract_topics" }
  })
  
  return JSON.parse(response.choices[0].message.function_call.arguments)
}
```

---

## Phase 3: Baseline Extraction Pipeline

### 3.1 PDF Processing

Create `lib/pdf.ts`:
```typescript
import pdf from 'pdf-parse'

export async function extractPdfText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const data = await pdf(buffer)
  
  // Structure the text by pages
  const sections = data.text.split('\n\n')
    .filter(s => s.trim().length > 0)
    .map((section, idx) => ({
      title: section.split('\n')[0],
      text: section,
      page: Math.floor(idx / 3) + 1 // rough estimate
    }))
  
  return JSON.stringify(sections)
}
```

### 3.2 Enhanced Topic Extraction

Update OpenAI function to handle structured sections:
```typescript
export async function extractTopicsStructured(sections: any[], discipline: string) {
  const prompt = `
    Analyze these course sections and extract key topics.
    Focus on:
    - Core concepts and theories
    - Methods and algorithms
    - Systems and tools
    - Key papers and references
    
    Sections: ${JSON.stringify(sections)}
  `
  
  // Call OpenAI with structured extraction
  // Return baseline topics with confidence scores
}
```

---

## Phase 4: Canon Building (Apify → Senso)

### 4.1 Apify Actor Setup

Create `lib/apify.ts`:
```typescript
import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
})

export async function fetchDisciplineSources(discipline: string, year: number) {
  const actors = {
    CS: 'apify/arxiv-scraper',
    // Add more discipline-specific actors
  }
  
  // Fetch from arXiv
  const arxivRun = await client.actor(actors[discipline]).call({
    searchQuery: `cat:cs.CV AND submittedDate:[${year}0101 TO ${year}1231]`,
    maxItems: 100
  })
  
  // Fetch from conference pages
  const conferenceData = await fetchConferences(['CVPR', 'ICCV', 'ECCV'], year)
  
  // Normalize data
  const normalizedData = normalizeSourceData([
    ...arxivRun.items,
    ...conferenceData
  ])
  
  return normalizedData
}

function normalizeSourceData(items: any[]) {
  return items.map(item => ({
    title: item.title,
    url: item.url,
    venue: item.venue || 'arXiv',
    year: item.year,
    type: classifyType(item),
    summary: item.abstract || item.summary
  }))
}
```

### 4.2 Senso Integration

Create `lib/senso.ts`:
```typescript
import axios from 'axios'

const sensoClient = axios.create({
  baseURL: process.env.SENSO_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.SENSO_API_KEY}`,
    'Content-Type': 'application/json'
  }
})

export async function indexToSenso(documents: any[]) {
  const response = await sensoClient.post('/index', {
    documents: documents.map(doc => ({
      ...doc,
      metadata: {
        provenance: 'apify_collection',
        indexed_at: new Date().toISOString(),
        confidence: calculateConfidence(doc)
      }
    }))
  })
  
  return response.data.documentIds
}

export async function retrieveWithProvenance(query: string, minCitations = 2) {
  const response = await sensoClient.post('/retrieve', {
    query,
    min_sources: minCitations,
    include_provenance: true,
    filters: {
      confidence: { $gte: 0.7 }
    }
  })
  
  // Ensure we have proper citations
  const citations = response.data.results.filter(r => r.provenance)
  
  if (citations.length < minCitations) {
    // Mark as low evidence
    return { citations, lowEvidence: true }
  }
  
  return { citations, lowEvidence: false }
}
```

---

## Phase 5: Year Diff & Patch Notes Generation

### 5.1 Diff Analysis Engine

Create `lib/diff-engine.ts`:
```typescript
export async function analyzeYearDiff(
  baselineTopics: any[],
  currentYear: number,
  subject: any
) {
  // Fetch current canon from Senso
  const canonItems = await fetchCanonForYear(subject.discipline, currentYear)
  
  // Map baseline to canon using embeddings
  const mappings = await mapBaselineToCanon(baselineTopics, canonItems)
  
  // Classify changes
  const changes = classifyChanges(mappings, currentYear)
  
  // Get citations for each change
  const changesWithCitations = await addCitations(changes)
  
  return changesWithCitations
}

async function classifyChanges(mappings: any, year: number) {
  const prompt = `
    Given baseline topics and canon items for year ${year},
    classify changes as:
    - ADD: New concepts not in baseline
    - RENAME: Naming evolution
    - DEPRECATE: No longer used
    - CORRECT: Baseline misconception fixed
    - EMERGE: High momentum but exploratory
  `
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Classify knowledge evolution changes" },
      { role: "user", content: prompt }
    ],
    functions: [{
      name: "classify_diff",
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
                confidence: { type: "number" }
              }
            }
          }
        }
      }
    }],
    function_call: { name: "classify_diff" }
  })
  
  return JSON.parse(response.choices[0].message.function_call.arguments).changes
}
```

### 5.2 Patch Notes Writer

Create `lib/patch-writer.ts`:
```typescript
export async function writePatchNotes(
  year: number,
  baselineYear: number,
  changes: any[],
  citations: any[]
) {
  const prompt = `
    Write Patch Notes for year ${year} for a learner whose baseline was ${baselineYear}.
    CRITICAL: Every claim must include [src_key]. If <2 sources, append '(Low evidence)'.
    
    Changes: ${JSON.stringify(changes)}
    Citations: ${JSON.stringify(citations)}
  `
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { 
        role: "system", 
        content: "Generate structured patch notes with citations" 
      },
      { role: "user", content: prompt }
    ],
    functions: [{
      name: "write_patch_notes",
      parameters: {
        type: "object",
        properties: {
          tldr: {
            type: "array",
            items: { type: "string" },
            description: "3-5 bullet points summarizing major changes"
          },
          sections: {
            type: "object",
            properties: {
              major: { type: "array", items: { type: "string" } },
              tools: { type: "array", items: { type: "string" } },
              resources: { type: "array", items: { type: "string" } },
              corrections: { type: "array", items: { type: "string" } },
              emerging: { type: "array", items: { type: "string" } }
            }
          },
          deltaPath: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                hours: { type: "number" },
                link: { type: "string" },
                type: { type: "string", enum: ["paper", "video", "doc"] }
              }
            },
            description: "4-8 hour learning path"
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
              }
            }
          }
        },
        required: ["tldr", "sections", "deltaPath", "bibliography"]
      }
    }],
    function_call: { name: "write_patch_notes" }
  })
  
  return JSON.parse(response.choices[0].message.function_call.arguments)
}
```

---

## Phase 6: Web UI Implementation

### 6.1 Dashboard Page

Create `app/page.tsx`:
```tsx
import { getSubjects } from '@/lib/api'
import SubjectCard from '@/components/SubjectCard'
import UploadButton from '@/components/UploadButton'

export default async function Dashboard() {
  const subjects = await getSubjects()
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Your Knowledge Subjects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
        
        <UploadButton />
      </div>
    </div>
  )
}
```

### 6.2 Subject Timeline Page

Create `app/subjects/[id]/page.tsx`:
```tsx
export default async function SubjectTimeline({ params }) {
  const subject = await getSubject(params.id)
  const timeline = await getTimeline(params.id)
  
  const currentYear = new Date().getFullYear()
  const years = []
  
  for (let year = subject.baselineYear + 1; year <= currentYear; year++) {
    const run = timeline.find(r => r.year === year)
    years.push({
      year,
      status: run?.status || 'pending',
      tlDr: run?.tlDr
    })
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">{subject.title}</h1>
      <p className="text-gray-600 mb-8">Baseline: {subject.baselineYear}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {years.map(year => (
          <YearTile key={year.year} {...year} subjectId={params.id} />
        ))}
      </div>
    </div>
  )
}
```

### 6.3 Year Page with Patch Notes

Create `app/subjects/[id]/years/[year]/page.tsx`:
```tsx
export default async function YearPage({ params }) {
  const patchNotes = await getPatchNotes(params.id, params.year)
  
  if (!patchNotes) {
    return <GenerateButton subjectId={params.id} year={params.year} />
  }
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">
        {patchNotes.subject.title} - {params.year} Patch Notes
      </h1>
      
      {/* TL;DR Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">TL;DR</h2>
        <ul className="space-y-2">
          {patchNotes.tldr.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Sections */}
      <div className="space-y-8">
        <Section 
          title="🔥 Major Shifts" 
          items={patchNotes.sections.major}
          citations={patchNotes.bibliography}
        />
        <Section 
          title="🛠️ Tools & Technologies" 
          items={patchNotes.sections.tools}
          citations={patchNotes.bibliography}
        />
        <Section 
          title="📚 New Resources" 
          items={patchNotes.sections.resources}
          citations={patchNotes.bibliography}
        />
        <Section 
          title="🎯 Corrections" 
          items={patchNotes.sections.corrections}
          citations={patchNotes.bibliography}
        />
        <Section 
          title="🔮 Emerging Trends" 
          items={patchNotes.sections.emerging}
          citations={patchNotes.bibliography}
        />
      </div>
      
      {/* Delta Learning Path */}
      <div className="mt-12 bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          Delta Learning Path ({patchNotes.deltaPath.reduce((a,b) => a + b.hours, 0)} hours)
        </h2>
        <div className="space-y-3">
          {patchNotes.deltaPath.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <a href={item.link} className="text-blue-600 hover:underline">
                {item.title}
              </a>
              <span className="text-sm text-gray-600">
                {item.hours}h • {item.type}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => downloadPDF(patchNotes)}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          📥 Download PDF
        </button>
        <button className="text-gray-600">
          ✉️ Email sent
        </button>
      </div>
    </div>
  )
}
```

---

## Phase 7: PDF Generation & Email

### 7.1 PDF Generator

Create `lib/pdf-generator.ts`:
```typescript
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40 },
  title: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  bullet: { fontSize: 12, marginBottom: 5, paddingLeft: 20 },
  citation: { fontSize: 10, color: '#666' }
})

export async function generatePatchNotesPDF(patchNotes: any) {
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          {patchNotes.subject.title} - Year {patchNotes.year} Patch Notes
        </Text>
        
        {/* TL;DR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TL;DR</Text>
          {patchNotes.tldr.map((item, i) => (
            <Text key={i} style={styles.bullet}>• {item}</Text>
          ))}
        </View>
        
        {/* Sections */}
        {Object.entries(patchNotes.sections).map(([key, items]) => (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {getSectionTitle(key)}
            </Text>
            {items.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item}</Text>
            ))}
          </View>
        ))}
        
        {/* Bibliography */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>References</Text>
          {patchNotes.bibliography.map((ref, i) => (
            <Text key={i} style={styles.citation}>
              [{ref.key}] {ref.title} - {ref.venue} {ref.year}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  )
  
  const pdfBlob = await pdf(MyDocument).toBlob()
  return pdfBlob
}
```

### 7.2 Email Service

Create `lib/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPatchNotesEmail(
  userEmail: string,
  subject: any,
  year: number,
  patchNotes: any,
  pdfUrl: string
) {
  const yearPageUrl = `${process.env.NEXT_PUBLIC_URL}/subjects/${subject.id}/years/${year}`
  
  await resend.emails.send({
    from: 'CourseKeeper <noreply@coursekeeper.app>',
    to: userEmail,
    subject: `Your ${subject.title} ${year} Patch Notes are ready`,
    html: `
      <h2>Your ${subject.title} Knowledge Update for ${year}</h2>
      
      <h3>TL;DR:</h3>
      <ul>
        ${patchNotes.tldr.map(item => `<li>${item}</li>`).join('')}
      </ul>
      
      <p>
        <a href="${yearPageUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Open Year Page
        </a>
        &nbsp;&nbsp;
        <a href="${pdfUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Download PDF
        </a>
      </p>
      
      <p style="color: #666; font-size: 14px;">
        This patch note contains ${patchNotes.bibliography.length} citations 
        and a ${patchNotes.deltaPath.reduce((a,b) => a + b.hours, 0)}-hour learning path.
      </p>
    `
  })
}
```

---

## Phase 8: Integration & Testing

### 8.1 Run Generation API

Create `app/api/run/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  const { subjectId, year } = await request.json()
  
  // Create pending run
  const run = await prisma.yearRun.create({
    data: { subjectId, year, status: 'pending' }
  })
  
  try {
    // Get baseline topics
    const baseline = await prisma.baselineTopic.findMany({
      where: { subjectId }
    })
    
    // Fetch and index canon data
    const canonData = await fetchDisciplineSources(subject.discipline, year)
    await indexToSenso(canonData)
    
    // Analyze differences
    const changes = await analyzeYearDiff(baseline, year, subject)
    
    // Get citations for each change
    const changesWithCitations = await Promise.all(
      changes.map(async change => {
        const { citations, lowEvidence } = await retrieveWithProvenance(
          change.rationale,
          2
        )
        return { ...change, citations, lowEvidence }
      })
    )
    
    // Generate patch notes
    const patchNotes = await writePatchNotes(
      year,
      subject.baselineYear,
      changesWithCitations,
      citations
    )
    
    // Generate PDF
    const pdfBlob = await generatePatchNotesPDF(patchNotes)
    const pdfUrl = await uploadToStorage(pdfBlob, `patch-${run.id}.pdf`)
    
    // Send email
    const user = await prisma.user.findUnique({ 
      where: { id: subject.userId } 
    })
    await sendPatchNotesEmail(user.email, subject, year, patchNotes, pdfUrl)
    
    // Update run status
    await prisma.yearRun.update({
      where: { id: run.id },
      data: {
        status: 'ok',
        pdfUrl,
        tlDr: patchNotes.tldr.join(' • '),
        finishedAt: new Date(),
        diffs: {
          create: changesWithCitations.map(change => ({
            changeType: change.changeType,
            fromTitle: change.fromTitle,
            toTitle: change.toTitle,
            rationale: change.rationale,
            confidence: change.confidence,
            evidence: change.citations
          }))
        }
      }
    })
    
    return NextResponse.json({ success: true, runId: run.id })
    
  } catch (error) {
    await prisma.yearRun.update({
      where: { id: run.id },
      data: { status: 'failed' }
    })
    
    throw error
  }
}
```

### 8.2 Cron Job for Scheduled Generation

Create `app/api/cron/generate/route.ts`:
```typescript
export async function GET(request: NextRequest) {
  // Verify cron secret
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const currentYear = new Date().getFullYear()
  
  // Find subjects due for generation
  const subjects = await prisma.subject.findMany({
    include: { runs: true }
  })
  
  const jobs = []
  
  for (const subject of subjects) {
    // Generate missing years up to current
    for (let year = subject.baselineYear + 1; year <= currentYear; year++) {
      const hasRun = subject.runs.some(r => r.year === year)
      
      if (!hasRun) {
        jobs.push({ subjectId: subject.id, year })
      }
    }
  }
  
  // Process jobs in parallel (with concurrency limit)
  const results = await Promise.allSettled(
    jobs.map(job => 
      fetch(`${process.env.NEXT_PUBLIC_URL}/api/run`, {
        method: 'POST',
        body: JSON.stringify(job)
      })
    )
  )
  
  return NextResponse.json({ 
    processed: jobs.length,
    succeeded: results.filter(r => r.status === 'fulfilled').length
  })
}
```

### 8.3 Testing Checklist

```typescript
// test/integration.test.ts

describe('CourseKeeper E2E Tests', () => {
  test('Upload syllabus creates subject with baseline', async () => {
    const formData = new FormData()
    formData.append('file', testPDF)
    formData.append('title', 'Computer Vision')
    formData.append('baselineYear', '2010')
    
    const response = await fetch('/api/subjects', {
      method: 'POST',
      body: formData
    })
    
    expect(response.ok).toBe(true)
    const { subjectId } = await response.json()
    
    // Verify baseline topics created
    const baseline = await prisma.baselineTopic.findMany({
      where: { subjectId }
    })
    expect(baseline.length).toBeGreaterThan(0)
  })
  
  test('Generate year patch notes with citations', async () => {
    const response = await fetch('/api/run', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: testSubjectId,
        year: 2014
      })
    })
    
    expect(response.ok).toBe(true)
    
    // Verify patch notes have citations
    const run = await prisma.yearRun.findFirst({
      where: { subjectId: testSubjectId, year: 2014 },
      include: { diffs: true }
    })
    
    expect(run.status).toBe('ok')
    expect(run.pdfUrl).toBeTruthy()
    
    // Check evidence
    run.diffs.forEach(diff => {
      const evidence = diff.evidence as any[]
      expect(evidence.length).toBeGreaterThanOrEqual(1)
    })
  })
  
  test('Low evidence badges appear when citations < 2', async () => {
    // Mock Senso to return only 1 citation
    // Generate patch notes
    // Verify "(Low evidence)" appears in output
  })
})
```

---

## Success Criteria Checklist

- [ ] **Baseline Extraction**: Upload PDF → topics extracted → stored in DB
- [ ] **Canon Building**: Apify fetches sources → indexed in Senso
- [ ] **Diff Analysis**: Baseline vs current state → changes classified
- [ ] **Citation Enforcement**: Every claim has ≥1 citation or "(Low evidence)"
- [ ] **Patch Notes Generation**: Structured output with TL;DR, sections, delta path
- [ ] **PDF Generation**: Downloadable PDF with same content as web
- [ ] **Email Delivery**: User receives email with summary and links
- [ ] **Timeline UI**: Year tiles from baseline+1 to current
- [ ] **Autonomous Operation**: Cron job generates patches without intervention
- [ ] **3-Minute Demo**: Shows full workflow from upload to patch notes

---

## Demo Script

1. **00:00-00:30**: Upload "Computer Vision 2010.pdf"
   - Show file selection
   - Subject card appears on dashboard

2. **00:30-01:00**: Open Computer Vision timeline
   - Show year tiles 2011-2025
   - Some marked as "completed", others "pending"

3. **01:00-02:00**: Click 2014 - Show patch notes
   - TL;DR: "Deep learning revolution begins..."
   - Major shifts: CNNs beating traditional methods
   - Show [src_1], [src_2] citations
   - Delta path with 6 hours of learning

4. **02:00-02:30**: Download PDF
   - Click download button
   - Open PDF showing same content

5. **02:30-03:00**: Show email notification
   - Display email with TL;DR
   - Links to year page and PDF
   - Mention autonomous generation

---

## Environment Variables Template

```env
# Database (Vercel Postgres/Neon)
DATABASE_URL="postgresql://user:pass@host:5432/coursekeeper?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/coursekeeper?sslmode=require"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Senso
SENSO_API_KEY="senso_..."
SENSO_API_URL="https://api.senso.ai/v1"

# Apify
APIFY_API_TOKEN="apify_api_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"
CRON_SECRET="your-cron-secret"

# Storage (Vercel Blob or S3)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

---

## Key Implementation Notes

1. **No Graph UI**: Focus on timeline tiles, not knowledge graph visualization
2. **Citation Required**: Use `(Low evidence)` badge if < 2 sources
3. **Deterministic LLM**: Always use function calling, never free text
4. **Email Only**: No WhatsApp/Intercom for MVP
5. **Autonomous**: After setup, system runs without intervention
6. **Sponsor Integration**: Must use OpenAI + Senso + Apify (required)

This implementation guide provides everything an LLM needs to build CourseKeeper from scratch, with specific code examples, API structures, and clear success criteria.
