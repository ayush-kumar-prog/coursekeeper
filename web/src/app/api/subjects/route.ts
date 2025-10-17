import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/subjects - Fetch all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        discipline: true,
        baselineYear: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// POST /api/subjects - Create a new subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, baselineYear, discipline, description, files } = body;

    // Basic validation
    if (!title || !baselineYear || !discipline) {
      return NextResponse.json(
        { error: 'Missing required fields: title, baselineYear, discipline' },
        { status: 400 }
      );
    }

    // Validate baselineYear is a number and reasonable
    const year = parseInt(baselineYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid baseline year' },
        { status: 400 }
      );
    }

    // For MVP, create a default user if none exists
    // In production, this would use actual authentication
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@coursekeeper.com',
          name: 'Demo User',
        },
      });
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        title,
        discipline,
        baselineYear: year,
        description: description || null,
        userId: user.id,
      },
    });

    // TODO: In future, handle file uploads here
    // For now, we just accept the file metadata but don't process it
    if (files && Array.isArray(files)) {
      // Placeholder for future file processing
      console.log('Files to process:', files.length);
    }

    return NextResponse.json({
      success: true,
      subjectId: subject.id,
      title: subject.title,
      discipline: subject.discipline,
      baselineYear: subject.baselineYear,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}

