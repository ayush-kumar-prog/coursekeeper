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
        summary: 'Scale-invariant feature detection for robust image matching'
      },
      {
        id: '2',
        name: 'Bag of Words',
        type: 'method' as const,
        section: 'Image Classification',
        summary: 'Histogram-based representation of visual features'
      },
      {
        id: '3',
        name: 'Epipolar Geometry',
        type: 'concept' as const,
        section: '3D Vision',
        summary: 'Geometric constraints between two camera views'
      }
    ]
    
    const mockCanon = [
      {
        canonId: 'arxiv:1409.1556',
        title: 'Very Deep Convolutional Networks for Large-Scale Image Recognition (VGGNet)',
        url: 'https://arxiv.org/abs/1409.1556',
        venue: 'ICLR',
        year: 2015,
        type: 'paper' as const,
        summary: 'Demonstrated that network depth is crucial for performance in visual recognition'
      },
      {
        canonId: 'arxiv:1312.6229',
        title: 'OverFeat: Integrated Recognition, Localization and Detection using Convolutional Networks',
        url: 'https://arxiv.org/abs/1312.6229',
        venue: 'ICLR',
        year: 2014,
        type: 'paper' as const,
        summary: 'Multi-scale sliding window approach using CNNs for detection tasks'
      },
      {
        canonId: 'arxiv:1409.4842',
        title: 'Going Deeper with Convolutions (GoogLeNet)',
        url: 'https://arxiv.org/abs/1409.4842',
        venue: 'CVPR',
        year: 2015,
        type: 'paper' as const,
        summary: 'Introduced the Inception architecture with efficient multi-scale feature extraction'
      },
      {
        canonId: 'pytorch',
        title: 'PyTorch',
        url: 'https://pytorch.org',
        venue: 'Framework',
        year: 2016,
        type: 'tool' as const,
        summary: 'Dynamic computation graph framework becoming standard for deep learning research'
      }
    ]
    
    console.log(`🚀 Generating patch notes for year ${year} (baseline: 2010)`)
    
    // Use your diff engine
    const diffEngine = new DiffAnalysisEngine()
    const changes = await diffEngine.classifyChanges(
      mockBaseline,
      mockCanon,
      year,
      2010
    )
    
    console.log(`✅ Found ${changes.length} changes`)
    
    // Use your patch writer
    const patchWriter = new PatchNotesWriter()
    const patchNotes = await patchWriter.generatePatchNotes(
      changes,
      year,
      2010,
      "Computer Vision"
    )
    
    console.log(`📝 Generated patch notes with ${patchNotes.sections.length} sections`)
    
    return NextResponse.json({
      success: true,
      patchNotes,
      changes,
      meta: {
        changesCount: changes.length,
        sectionsCount: patchNotes.sections.length,
        year,
        baselineYear: 2010
      }
    })
    
  } catch (error) {
    console.error('❌ Error in /api/runs:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate patch notes',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'CourseKeeper Patch Notes API',
    endpoints: {
      POST: {
        description: 'Generate patch notes for a subject and year',
        body: {
          subjectId: 'string',
          year: 'number'
        }
      }
    }
  })
}

