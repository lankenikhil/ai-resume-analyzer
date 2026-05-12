import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const resumes = await db.resumeAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const formattedResumes = resumes.map((r) => ({
      id: r.id,
      fileName: r.fileName,
      resumeText: r.resumeText,
      overallScore: r.overallScore,
      atsScore: r.atsScore,
      skillsScore: r.skillsScore,
      formattingScore: r.formattingScore,
      grammarScore: r.grammarScore,
      readabilityScore: r.readabilityScore,
      matchScore: r.matchScore,
      suggestions: JSON.parse(r.suggestions || '[]'),
      missingKeywords: JSON.parse(r.missingKeywords || '[]'),
      matchedKeywords: JSON.parse(r.matchedKeywords || '[]'),
      skillGaps: JSON.parse(r.skillGaps || '[]'),
      improvedSummary: r.improvedSummary,
      jobDescription: r.jobDescription,
      createdAt: r.createdAt.toISOString(),
    }))

    return NextResponse.json({ resumes: formattedResumes })
  } catch (error) {
    console.error('List resumes error:', error)
    return NextResponse.json(
      { error: 'Failed to list resumes' },
      { status: 500 }
    )
  }
}
