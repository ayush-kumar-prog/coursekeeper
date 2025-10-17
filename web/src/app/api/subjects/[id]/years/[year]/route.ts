import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; year: string }> }
) {
  try {
    const { id: subjectId, year: yearStr } = await params;
    const year = parseInt(yearStr, 10);

    if (isNaN(year)) {
      return NextResponse.json(
        { error: 'Invalid year parameter' },
        { status: 400 }
      );
    }

    // Fetch the year run with related data
    const yearRun = await prisma.yearRun.findUnique({
      where: {
        subjectId_year: {
          subjectId,
          year,
        },
      },
      include: {
        subject: {
          select: {
            id: true,
            title: true,
            baselineYear: true,
            discipline: true,
          },
        },
        diffs: {
          orderBy: {
            importance: 'desc',
          },
        },
      },
    });

    if (!yearRun) {
      return NextResponse.json(
        { error: 'Year run not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(yearRun);
  } catch (error) {
    console.error('Error fetching year run:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch year run',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

