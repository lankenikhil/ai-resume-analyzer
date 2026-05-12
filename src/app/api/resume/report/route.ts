import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      )
    }

    const report = await db.resumeAnalysis.findFirst({
      where: { id: reportId, userId },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: report.id,
      fileName: report.fileName,
      resumeText: report.resumeText,
      overallScore: report.overallScore,
      atsScore: report.atsScore,
      skillsScore: report.skillsScore,
      formattingScore: report.formattingScore,
      grammarScore: report.grammarScore,
      readabilityScore: report.readabilityScore,
      matchScore: report.matchScore,
      suggestions: JSON.parse(report.suggestions || '[]'),
      missingKeywords: JSON.parse(report.missingKeywords || '[]'),
      matchedKeywords: JSON.parse(report.matchedKeywords || '[]'),
      skillGaps: JSON.parse(report.skillGaps || '[]'),
      improvedSummary: report.improvedSummary,
      jobDescription: report.jobDescription,
      createdAt: report.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { error: 'Failed to get report' },
      { status: 500 }
    )
  }
}
