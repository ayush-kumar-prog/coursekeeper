import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subjects/[id]/timeline - Get subject timeline with year runs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: subjectId } = await params;

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    // Fetch subject with its runs
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        runs: {
          select: {
            year: true,
            status: true,
            tldr: true,
            changesCount: true,
            completedAt: true,
          },
          orderBy: {
            year: 'asc',
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Generate year range from baseline to current year
    const currentYear = new Date().getFullYear();
    const years = [];

    // Add baseline year first
    years.push({
      year: subject.baselineYear,
      status: 'baseline' as const,
      tldr: null,
      changesCount: 0,
      completedAt: null,
    });

    // Add all years from baseline + 1 to current year
    for (let year = subject.baselineYear + 1; year <= currentYear; year++) {
      // Check if we have a run for this year
      const run = subject.runs.find((r) => r.year === year);

      if (run) {
        years.push({
          year,
          status: run.status,
          tldr: run.tldr,
          changesCount: run.changesCount,
          completedAt: run.completedAt,
        });
      } else {
        // No run exists for this year yet
        years.push({
          year,
          status: 'pending' as const,
          tldr: null,
          changesCount: 0,
          completedAt: null,
        });
      }
    }

    // Return subject info (without runs) and the processed years array
    const { runs, ...subjectWithoutRuns } = subject;

    return NextResponse.json({
      subject: subjectWithoutRuns,
      years,
    });
  } catch (error) {
    console.error('Error fetching subject timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject timeline' },
      { status: 500 }
    );
  }
}

