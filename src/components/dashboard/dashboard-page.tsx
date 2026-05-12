'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  Award,
  Upload,
  Target,
  Eye,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useAppStore, type AnalysisResult } from '@/store/app-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const chartConfig = {
  overallScore: {
    label: 'Overall Score',
    color: 'oklch(0.55 0.15 155)',
  },
  atsScore: {
    label: 'ATS Score',
    color: 'oklch(0.65 0.12 155)',
  },
} satisfies ChartConfig

function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('resumeai_user_id')
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}

function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default'
  if (score >= 60) return 'secondary'
  return 'destructive'
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

export default function DashboardPage() {
  const { user, resumes, setResumes, setCurrentPage, setCurrentAnalysis } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  const fetchResumes = useCallback(async () => {
    const userId = getUserId()
    if (!userId) {
      setIsLoading(false)
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
      setIsLoading(false)
    }
  }, [setResumes])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  // Calculate stats
  const totalResumes = resumes.length
  const avgAtsScore = totalResumes > 0
    ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / totalResumes)
    : 0
  const avgOverallScore = totalResumes > 0
    ? Math.round(resumes.reduce((sum, r) => sum + r.overallScore, 0) / totalResumes)
    : 0
  const bestScore = totalResumes > 0
    ? Math.max(...resumes.map((r) => r.overallScore))
    : 0

  // Chart data - last 10 resumes by date
  const chartData = resumes
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      name: r.fileName.length > 12 ? r.fileName.substring(0, 12) + '...' : r.fileName,
      overallScore: r.overallScore,
      atsScore: r.atsScore,
    }))

  const recentAnalyses = resumes.slice(0, 5)

  const handleViewAnalysis = (result: AnalysisResult) => {
    setCurrentAnalysis(result)
    setCurrentPage('analysis')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s an overview of your resume analysis activity.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentPage('upload')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New Resume
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage('job-match')}
          >
            <Target className="mr-2 h-4 w-4" />
            Match Job Description
          </Button>
        </div>
      </div>

      {totalResumes === 0 ? (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-full bg-emerald-50 p-4 mb-4">
              <Sparkles className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No resumes analyzed yet</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Upload your first resume to get started with AI-powered analysis, ATS scoring, and personalized improvement suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setCurrentPage('upload')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Your Resume
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentPage('job-match')}
              >
                <Target className="mr-2 h-4 w-4" />
                Match a Job Description
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Total Resumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalResumes}</div>
                <p className="text-xs text-muted-foreground mt-1">analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Avg ATS Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn('text-3xl font-bold', getScoreColor(avgAtsScore))}>
                  {avgAtsScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Avg Overall Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn('text-3xl font-bold', getScoreColor(avgOverallScore))}>
                  {avgOverallScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Best Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn('text-3xl font-bold', getScoreColor(bestScore))}>
                  {bestScore}
                </div>
                <p className="text-xs text-muted-foreground mt-1">overall</p>
              </CardContent>
            </Card>
          </div>

          {/* Score History Chart */}
          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Score History
                </CardTitle>
                <CardDescription>
                  Overall and ATS scores across your recent analyses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="overallScore"
                      fill="var(--color-overallScore)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="atsScore"
                      fill="var(--color-atsScore)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Analyses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Recent Analyses
              </CardTitle>
              <CardDescription>
                Your most recently analyzed resumes
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <ScrollArea className="max-h-96">
                <div className="divide-y">
                  {recentAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="rounded-lg bg-emerald-50 p-2 shrink-0">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {analysis.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(analysis.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="hidden sm:flex items-center gap-2">
                          <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                            Overall: {analysis.overallScore}
                          </Badge>
                          <Badge variant={getScoreBadgeVariant(analysis.atsScore)}>
                            ATS: {analysis.atsScore}
                          </Badge>
                        </div>
                        <div className="flex sm:hidden items-center gap-2">
                          <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                            {analysis.overallScore}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAnalysis(analysis)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {resumes.length > 5 && (
                <div className="px-6 pt-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-primary hover:text-primary/80"
                    onClick={() => {
                      /* Could scroll or expand list */
                    }}
                  >
                    View All Resumes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  )
}
