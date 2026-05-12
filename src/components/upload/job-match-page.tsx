'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  FileText,
  Loader2,
  AlertCircle,
  Briefcase,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type AnalysisResult } from '@/store/app-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('resumeai_user_id')
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

export default function JobMatchPage() {
  const { resumes, setResumes, setCurrentAnalysis, setCurrentPage } = useAppStore()
  const [selectedResumeId, setSelectedResumeId] = useState<string>('')
  const [jobDescription, setJobDescription] = useState('')
  const [isMatching, setIsMatching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)

  // Fetch resumes if not loaded
  const fetchResumes = useCallback(async () => {
    const userId = getUserId()
    if (!userId) {
      setIsLoadingResumes(false)
      return
    }

    if (resumes.length > 0) {
      setIsLoadingResumes(false)
      return
    }

    try {
      const response = await fetch('/api/resume/list', {
        headers: { 'x-user-id': userId },
      })
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes)
      } else {
        toast.error('Failed to load resumes')
      }
    } catch {
      toast.error('Failed to connect to server')
    } finally {
      setIsLoadingResumes(false)
    }
  }, [resumes.length, setResumes])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const selectedResume = resumes.find((r) => r.id === selectedResumeId)

  const handleMatch = useCallback(async () => {
    const userId = getUserId()
    if (!userId) {
      toast.error('Please log in to match resumes')
      return
    }

    if (!selectedResumeId) {
      toast.error('Please select a resume')
      return
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error('Please provide a job description (at least 20 characters)')
      return
    }

    setIsMatching(true)
    setError(null)

    try {
      const response = await fetch('/api/resume/match-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobDescription: jobDescription.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Match analysis failed. Please try again.')
      }

      const matchResult = await response.json()

      // Update the current analysis with match data
      // We need to fetch the full updated analysis
      const reportResponse = await fetch(`/api/resume/report?id=${selectedResumeId}`, {
        headers: { 'x-user-id': userId },
      })

      if (reportResponse.ok) {
        const fullAnalysis = await reportResponse.json()
        setCurrentAnalysis(fullAnalysis)

        // Update the resume in the list
        const updatedResumes = resumes.map((r) =>
          r.id === selectedResumeId ? fullAnalysis : r
        )
        setResumes(updatedResumes)
      } else {
        // Fallback: construct the analysis from match result + existing resume
        const existingResume = resumes.find((r) => r.id === selectedResumeId)
        if (existingResume) {
          const updatedAnalysis: AnalysisResult = {
            ...existingResume,
            matchScore: matchResult.matchScore,
            jobDescription: jobDescription.trim(),
            suggestions: [
              ...existingResume.suggestions,
              ...(matchResult.matchSuggestions || []),
            ],
            missingKeywords: [
              ...new Set([
                ...existingResume.missingKeywords,
                ...(matchResult.missingSkills || []),
                ...(matchResult.recommendedKeywords || []),
              ]),
            ],
            matchedKeywords: [
              ...new Set([
                ...existingResume.matchedKeywords,
                ...(matchResult.matchedSkills || []),
              ]),
            ],
          }
          setCurrentAnalysis(updatedAnalysis)
          const updatedResumes = resumes.map((r) =>
            r.id === selectedResumeId ? updatedAnalysis : r
          )
          setResumes(updatedResumes)
        }
      }

      setCurrentPage('analysis')
      toast.success('Job match analysis completed!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Match analysis failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsMatching(false)
    }
  }, [selectedResumeId, jobDescription, resumes, setCurrentAnalysis, setResumes, setCurrentPage])

  if (isLoadingResumes) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Match Your Resume with Job Description
        </h1>
        <p className="text-muted-foreground mt-1">
          See how well your resume matches a specific job posting and get tailored suggestions.
        </p>
      </div>

      {/* No resumes state */}
      {resumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-full bg-emerald-50 p-4 mb-4">
              <FileText className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No resumes to match</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              You need to analyze at least one resume before you can match it with a job description.
            </p>
            <Button
              onClick={() => setCurrentPage('upload')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload a Resume First
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Resume Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-emerald-600" />
                Select a Resume
              </CardTitle>
              <CardDescription>
                Choose one of your previously analyzed resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a resume..." />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      <span className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">{resume.fileName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatDate(resume.createdAt)})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected resume preview */}
              {selectedResume && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-lg bg-muted/50 border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{selectedResume.fileName}</p>
                    <span className={cn('text-sm font-semibold', getScoreColor(selectedResume.overallScore))}>
                      Score: {selectedResume.overallScore}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>ATS: {selectedResume.atsScore}</span>
                    <span>Skills: {selectedResume.skillsScore}</span>
                    <span>Format: {selectedResume.formattingScore}</span>
                    <span>Grammar: {selectedResume.grammarScore}</span>
                  </div>
                  {selectedResume.matchScore !== null && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Previous match score: <span className={cn('font-semibold', getScoreColor(selectedResume.matchScore))}>{selectedResume.matchScore}</span>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the job description you want to match against
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here, including requirements, responsibilities, qualifications, and any other relevant details..."
                className="min-h-[200px] resize-y"
              />
              <p className="text-xs text-muted-foreground">
                {jobDescription.length > 0
                  ? `${jobDescription.length} characters entered`
                  : 'Minimum 20 characters required'}
              </p>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Analyze Match Button */}
          <Button
            onClick={handleMatch}
            disabled={isMatching || !selectedResumeId || jobDescription.trim().length < 20}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
            size="lg"
          >
            {isMatching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze Match
              </>
            )}
          </Button>

          {/* Loading Overlay */}
          {isMatching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card rounded-2xl p-8 shadow-2xl border text-center max-w-sm mx-4"
              >
                <div className="relative h-16 w-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Matching your resume...</h3>
                <p className="text-muted-foreground text-sm">
                  Our AI is comparing your resume with the job description to find the best match.
                </p>
                <div className="flex justify-center gap-1 mt-4">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.div
                    className="h-2 w-2 rounded-full bg-primary"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
