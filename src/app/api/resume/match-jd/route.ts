import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { resumeId, jobDescription } = body

    if (!resumeId || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume ID and job description are required' },
        { status: 400 }
      )
    }

    // Get existing resume analysis
    const existingAnalysis = await db.resumeAnalysis.findFirst({
      where: { id: resumeId, userId },
    })

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Resume analysis not found' },
        { status: 404 }
      )
    }

    // Match resume with job description using AI
    const zai = await ZAI.create()

    const matchPrompt = `You are an expert career advisor and ATS specialist. Compare the following resume with the job description and provide a detailed match analysis.

Resume Text:
${existingAnalysis.resumeText}

Job Description:
${jobDescription}

Provide your analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "matchScore": <number 0-100 representing how well the resume matches the JD>,
  "missingSkills": [<array of skills from the JD that are missing from the resume>],
  "matchedSkills": [<array of skills that match between resume and JD>],
  "recommendedKeywords": [<array of keywords the candidate should add to improve their match>],
  "suggestions": [<array of specific suggestions to improve the match>]
}

Be thorough and specific. Consider:
1. Required vs preferred qualifications
2. Technical skills match
3. Experience level alignment
4. Industry-specific terminology
5. Soft skills and cultural fit indicators`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert career advisor. You always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: matchPrompt
        }
      ],
      thinking: { type: 'disabled' }
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    let matchResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      matchResult = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      matchResult = {
        matchScore: 40,
        missingSkills: ['Key required skills not found in resume'],
        matchedSkills: ['Some relevant experience present'],
        recommendedKeywords: ['Add more industry-specific terms'],
        suggestions: ['Tailor your resume more closely to this specific role']
      }
    }

    // Update the existing analysis with match score and job description
    const updatedAnalysis = await db.resumeAnalysis.update({
      where: { id: resumeId },
      data: {
        matchScore: Math.min(100, Math.max(0, matchResult.matchScore || 0)),
        jobDescription,
        suggestions: JSON.stringify([
          ...JSON.parse(existingAnalysis.suggestions || '[]'),
          ...matchResult.suggestions,
        ]),
        missingKeywords: JSON.stringify([
          ...JSON.parse(existingAnalysis.missingKeywords || '[]'),
          ...matchResult.missingSkills,
          ...matchResult.recommendedKeywords,
        ]),
        matchedKeywords: JSON.stringify([
          ...JSON.parse(existingAnalysis.matchedKeywords || '[]'),
          ...matchResult.matchedSkills,
        ]),
      },
    })

    return NextResponse.json({
      id: updatedAnalysis.id,
      matchScore: updatedAnalysis.matchScore,
      missingSkills: matchResult.missingSkills,
      matchedSkills: matchResult.matchedSkills,
      recommendedKeywords: matchResult.recommendedKeywords,
      matchSuggestions: matchResult.suggestions,
      overallScore: updatedAnalysis.overallScore,
      atsScore: updatedAnalysis.atsScore,
      skillsScore: updatedAnalysis.skillsScore,
    })
  } catch (error) {
    console.error('JD matching error:', error)
    return NextResponse.json(
      { error: 'Failed to match resume with job description. Please try again.' },
      { status: 500 }
    )
  }
}
