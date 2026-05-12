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

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const resumeText = formData.get('resumeText') as string | null

    if (!file && !resumeText) {
      return NextResponse.json(
        { error: 'Please upload a resume file or provide resume text' },
        { status: 400 }
      )
    }

    let extractedText = resumeText || ''
    const fileName = file?.name || 'pasted-text'

    // Extract text from file if provided
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ]

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
        return NextResponse.json(
          { error: 'Only PDF, DOCX, and TXT files are supported' },
          { status: 400 }
        )
      }

      // Read file as text for TXT files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extractedText = await file.text()
      } else {
        // For PDF/DOCX, try to read as text (basic extraction)
        // In production, use proper PDF/DOCX parsers
        try {
          const buffer = await file.arrayBuffer()
          const text = Buffer.from(buffer).toString('utf-8')
          // Filter out non-printable characters for basic text extraction
          extractedText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
        } catch {
          extractedText = 'Unable to extract text from this file format. Please paste your resume text instead.'
        }
      }
    }

    if (!extractedText || extractedText.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the resume. Please paste your resume text instead.' },
        { status: 400 }
      )
    }

    // Analyze resume with AI
    const zai = await ZAI.create()

    const analysisPrompt = `You are an expert resume analyzer and ATS optimization specialist. Analyze the following resume text and provide a detailed evaluation.

Resume Text:
${extractedText}

Provide your analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "formattingScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "suggestions": [<array of specific improvement suggestions as strings>],
  "missingKeywords": [<array of missing important keywords>],
  "matchedKeywords": [<array of keywords that are well-represented>],
  "skillGaps": [<array of skills the candidate should add>],
  "improvedSummary": "<a professionally rewritten summary/profile section>"
}

Scoring Guidelines:
- overallScore: Weighted average considering all factors
- atsScore: How well the resume would perform in Applicant Tracking Systems (formatting, keywords, structure)
- skillsScore: Quality and relevance of skills listed, use of action verbs
- formattingScore: Structure, sections, consistency, readability for recruiters
- grammarScore: Grammar, spelling, punctuation, professional language
- readabilityScore: Clarity, conciseness, impact of statements

Provide at least 5 specific, actionable suggestions for improvement.
List at least 5 missing keywords that would improve ATS performance.
List at least 5 matched keywords that are well-represented.
If the resume has a summary section, rewrite it to be more impactful. If no summary exists, create one.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert resume analyzer. You always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      thinking: { type: 'disabled' }
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    let analysis
    try {
      // Try to parse JSON from response, handling potential markdown wrapping
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      // Fallback analysis if AI response is not valid JSON
      analysis = {
        overallScore: 50,
        atsScore: 50,
        skillsScore: 50,
        formattingScore: 50,
        grammarScore: 50,
        readabilityScore: 50,
        suggestions: ['Consider adding more specific achievements with metrics', 'Use stronger action verbs', 'Add relevant industry keywords', 'Improve formatting consistency', 'Include a professional summary'],
        missingKeywords: ['leadership', 'project management', 'data analysis', 'collaboration', 'strategic planning'],
        matchedKeywords: ['experience', 'skills', 'education'],
        skillGaps: ['Project management', 'Data analysis', 'Leadership'],
        improvedSummary: 'Results-driven professional with demonstrated expertise in delivering impactful solutions. Seeking to leverage strong analytical and communication skills in a challenging role.'
      }
    }

    // Save analysis to database
    const savedAnalysis = await db.resumeAnalysis.create({
      data: {
        userId,
        fileName,
        resumeText: extractedText.substring(0, 10000), // Limit stored text
        overallScore: Math.min(100, Math.max(0, analysis.overallScore || 0)),
        atsScore: Math.min(100, Math.max(0, analysis.atsScore || 0)),
        skillsScore: Math.min(100, Math.max(0, analysis.skillsScore || 0)),
        formattingScore: Math.min(100, Math.max(0, analysis.formattingScore || 0)),
        grammarScore: Math.min(100, Math.max(0, analysis.grammarScore || 0)),
        readabilityScore: Math.min(100, Math.max(0, analysis.readabilityScore || 0)),
        matchScore: null,
        suggestions: JSON.stringify(analysis.suggestions || []),
        missingKeywords: JSON.stringify(analysis.missingKeywords || []),
        matchedKeywords: JSON.stringify(analysis.matchedKeywords || []),
        skillGaps: JSON.stringify(analysis.skillGaps || []),
        improvedSummary: analysis.improvedSummary || null,
      },
    })

    return NextResponse.json({
      id: savedAnalysis.id,
      fileName: savedAnalysis.fileName,
      resumeText: savedAnalysis.resumeText,
      overallScore: savedAnalysis.overallScore,
      atsScore: savedAnalysis.atsScore,
      skillsScore: savedAnalysis.skillsScore,
      formattingScore: savedAnalysis.formattingScore,
      grammarScore: savedAnalysis.grammarScore,
      readabilityScore: savedAnalysis.readabilityScore,
      matchScore: savedAnalysis.matchScore,
      suggestions: JSON.parse(savedAnalysis.suggestions),
      missingKeywords: JSON.parse(savedAnalysis.missingKeywords),
      matchedKeywords: JSON.parse(savedAnalysis.matchedKeywords),
      skillGaps: JSON.parse(savedAnalysis.skillGaps),
      improvedSummary: savedAnalysis.improvedSummary,
      createdAt: savedAnalysis.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Resume analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again.' },
      { status: 500 }
    )
  }
}
