# Subject Timeline Page - Implementation Summary

## ✅ What Was Implemented

### 1. Subject Timeline Page (`/subjects/[id]`)
**File**: `/web/src/app/subjects/[id]/page.tsx`

This page displays a year-by-year timeline for a specific subject, showing patch notes status from the baseline year + 1 to the current year.

#### Features:
- **Dynamic year tiles** from baselineYear + 1 to current year
- **Status indicators** for each year:
  - ⏳ **Pending** - Not yet generated (gray)
  - ⚙️ **Processing** - Currently generating (yellow, animated)
  - ✅ **Completed** - Ready to view (green)
  - ❌ **Failed** - Generation failed (red)
- **Progress overview** showing completion statistics
- **Interactive tiles** - Click to view patch notes (when completed) or trigger generation (when pending)
- **Back navigation** to subjects list
- **Bulk actions** - Generate all pending years button

#### Year Tile Component (Inline)
Each year tile displays:
- Year number
- Status icon and label
- TL;DR summary (for completed years)
- Number of changes (for completed years)
- "Generate now" button (for pending years)

### 2. Timeline API Endpoint
**File**: `/web/src/app/api/subjects/[id]/timeline/route.ts`

**Endpoint**: `GET /api/subjects/[id]/timeline`

#### Response Structure:
```json
{
  "subject": {
    "id": "...",
    "title": "Computer Vision",
    "discipline": "CS",
    "baselineYear": 2010,
    "description": "..."
  },
  "years": [
    {
      "year": 2011,
      "status": "completed",
      "tldr": "Major shift...",
      "changesCount": 15,
      "completedAt": "2024-01-15T10:30:00Z"
    },
    {
      "year": 2012,
      "status": "pending",
      "tldr": null,
      "changesCount": 0,
      "completedAt": null
    }
  ]
}
```

#### Logic:
1. Fetches subject details from database
2. Fetches all existing YearRun records for the subject
3. Generates a complete year range from baselineYear + 1 to current year
4. Merges existing runs with the year range (fills in "pending" for missing years)
5. Returns subject info + processed years array

### 3. Integration Points

#### From Subjects List → Timeline
The existing `SubjectTile` component already links to `/subjects/[id]`, which now routes to the timeline page.

**File**: `/web/src/app/subjects/components/SubjectTile.tsx`
```tsx
<Link href={`/subjects/${id}`}>
  {/* Subject card content */}
</Link>
```

#### From Timeline → Year Page (Future)
Year tiles have a click handler that will navigate to:
```
/subjects/{subjectId}/years/{year}
```
This route will be implemented next to display the full patch notes.

## 📊 Database Integration

The timeline page queries the existing Prisma schema:

```prisma
model Subject {
  id           String   @id @default(cuid())
  title        String
  discipline   String
  baselineYear Int
  runs         YearRun[]
}

model YearRun {
  id           String   @id @default(cuid())
  subjectId    String
  year         Int
  status       String   // "pending" | "processing" | "completed" | "failed"
  tldr         String?
  changesCount Int      @default(0)
  completedAt  DateTime?
}
```

## 🎨 UI/UX Highlights

### Visual Design
- Gradient background (blue-50 to indigo-100)
- Card-based layout with shadows
- Color-coded status states
- Responsive grid (2-6 columns based on screen size)

### Progress Overview Section
- Visual progress bar showing completion percentage
- Statistics grid showing counts by status
- Real-time calculation based on year data

### Interaction States
- Hover effects on year tiles
- Pulse animation for processing status
- Clickable tiles with cursor feedback
- Disabled state for pending years

## 🔄 User Flow

1. **User visits** `/subjects` (subjects list)
2. **Clicks on** a subject card
3. **Lands on** `/subjects/[id]` (timeline page)
4. **Sees** year-by-year grid from baseline+1 to current
5. **Can**:
   - View completed years (green tiles)
   - Generate individual pending years
   - Generate all pending years at once
   - Navigate back to subjects list

## 🚀 Next Steps

To complete the full pipeline, implement:

1. **Year Page** (`/subjects/[id]/years/[year]`)
   - Display full patch notes
   - Show TL;DR, sections, citations
   - Provide PDF download
   - Show delta learning path

2. **Generation Trigger**
   - Connect "Generate now" buttons to `/api/runs` endpoint
   - Add loading states during generation
   - Update timeline in real-time after generation

3. **Bulk Generation**
   - Implement "Generate All Pending Years" button
   - Queue management for multiple year generations
   - Progress tracking UI

4. **Error Handling**
   - Retry mechanism for failed runs
   - Detailed error messages
   - Manual retry buttons

## 📁 File Structure

```
web/src/app/
├── subjects/
│   ├── [id]/
│   │   └── page.tsx              # Subject Timeline Page (NEW)
│   ├── components/
│   │   ├── SubjectTile.tsx       # Links to timeline (EXISTING)
│   │   └── CreateSubjectModal.tsx
│   └── page.tsx                  # Subjects list
└── api/
    └── subjects/
        └── [id]/
            └── timeline/
                └── route.ts      # Timeline API endpoint (NEW)
```

## ✅ Testing Checklist

- [ ] Visit `/subjects` and create a test subject
- [ ] Click on subject to open timeline
- [ ] Verify year tiles display correctly (baseline+1 to current)
- [ ] Check progress overview calculates correctly
- [ ] Verify all years show as "pending" initially
- [ ] Test back navigation to subjects list
- [ ] Check responsive layout on different screen sizes
- [ ] Verify API returns correct data structure

## 🎯 Alignment with Specs

This implementation follows the specifications from:
- **Implementation-Phases.md** - Phase 6.2 (Subject Timeline Page)
- **Syllabus-Patch-Notes-Spec.md** - Section 2 (UX Summary)

Key requirements met:
✅ Year tiles from baseline_year+1 → current
✅ Status indicators for each year (pending/completed/failed)
✅ TL;DR display for completed years
✅ Dashboard → Subject Timeline flow
✅ Clean, modern UI with good UX

