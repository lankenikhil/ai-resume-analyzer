'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Lightbulb,
  FileText,
  Sparkles,
  Target,
  Type,
  AlignLeft,
  BookOpen,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { useAppStore } from '@/store/app-store'
import { ScoreCircle } from '@/components/analysis/score-circle'
import { ScoreCard } from '@/components/analysis/score-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { downloadReport } from '@/lib/report-generator'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function AnalysisPage() {
  const { currentAnalysis, setCurrentPage } = useAppStore()

  if (!currentAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          No Analysis Selected
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Upload and analyze a resume first to see detailed results here.
        </p>
        <Button onClick={() => setCurrentPage('dashboard')} variant="default">
          Go to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <ScrollArea className="h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-8"
        >
          {/* Header Section */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage('dashboard')}
                className="gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                if (currentAnalysis) {
                  downloadReport(currentAnalysis)
                  toast.success('Report opened for download!')
                }
              }}>
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Resume Analysis Report
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{currentAnalysis.fileName}</span>
                <span>•</span>
                <span>
                  {format(
                    new Date(currentAnalysis.createdAt),
                    'MMM d, yyyy · h:mm a'
                  )}
                </span>
              </div>
            </div>
          </motion.div>

          <Separator />

          {/* Score Overview Section */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center gap-3"
          >
            <ScoreCircle
              score={currentAnalysis.overallScore}
              size={160}
              label="Overall Resume Score"
            />
          </motion.div>

          {/* Score Breakdown Section */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <ScoreCard
                score={currentAnalysis.atsScore}
                label="ATS Score"
                icon={<Target className="w-4 h-4 text-emerald-600" />}
              />
              <ScoreCard
                score={currentAnalysis.skillsScore}
                label="Skills Score"
                icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
              />
              <ScoreCard
                score={currentAnalysis.formattingScore}
                label="Formatting"
                icon={<AlignLeft className="w-4 h-4 text-emerald-600" />}
              />
              <ScoreCard
                score={currentAnalysis.grammarScore}
                label="Grammar"
                icon={<Type className="w-4 h-4 text-emerald-600" />}
              />
              <ScoreCard
                score={currentAnalysis.readabilityScore}
                label="Readability"
                icon={<BookOpen className="w-4 h-4 text-emerald-600" />}
              />
            </div>
          </motion.div>

          {/* Radar Chart Section */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Score Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChartSection analysis={currentAnalysis} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Match Score Section */}
          {currentAnalysis.matchScore !== null && (
            <motion.div variants={fadeInUp}>
              <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
                <CardContent className="py-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Target className="w-5 h-5" />
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        Job Description Match
                      </span>
                    </div>
                    <ScoreCircle
                      score={currentAnalysis.matchScore}
                      size={130}
                    />
                    {currentAnalysis.jobDescription && (
                      <p className="text-xs text-muted-foreground text-center max-w-md mt-1">
                        Matched against the provided job description
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Suggestions Section */}
          {currentAnalysis.suggestions.length > 0 && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Improvement Suggestions
              </h2>
              <div className="flex flex-col gap-3">
                {currentAnalysis.suggestions.map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="gap-2 py-3">
                      <CardContent className="px-4">
                        <div className="flex gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-sm text-foreground leading-relaxed pt-0.5">
                            {suggestion}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Keywords Section */}
          {(currentAnalysis.missingKeywords.length > 0 ||
            currentAnalysis.matchedKeywords.length > 0) && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-lg font-semibold mb-4">Keywords Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Missing Keywords */}
                <Card className="gap-3">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      Missing Keywords
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {currentAnalysis.missingKeywords.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentAnalysis.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.missingKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="outline"
                            className="border-red-300 text-red-600 dark:border-red-800 dark:text-red-400 bg-red-50 dark:bg-red-950/30"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No missing keywords detected.
                      </p>
                    )}
                  </CardContent>
                </Card>
                {/* Matched Keywords */}
                <Card className="gap-3">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Matched Keywords
                      <Badge className="ml-auto text-xs bg-emerald-600">
                        {currentAnalysis.matchedKeywords.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentAnalysis.matchedKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {currentAnalysis.matchedKeywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="outline"
                            className="border-emerald-300 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No keywords matched yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Skill Gaps Section */}
          {currentAnalysis.skillGaps.length > 0 && (
            <motion.div variants={fadeInUp}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Skill Gaps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentAnalysis.skillGaps.map((gap, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className="gap-2 py-3 border-amber-200 dark:border-amber-800/50">
                      <CardContent className="px-4">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {gap}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Consider adding relevant experience or
                              certifications for this skill.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Improved Summary Section */}
          {currentAnalysis.improvedSummary && (
            <motion.div variants={fadeInUp}>
              <Card className="border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      AI-Generated Professional Summary
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          currentAnalysis.improvedSummary!
                        )
                        toast.success('Summary copied to clipboard!')
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-background p-4">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {currentAnalysis.improvedSummary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </ScrollArea>
  )
}

function RadarChartSection({
  analysis,
}: {
  analysis: NonNullable<ReturnType<typeof useAppStore.getState>['currentAnalysis']>
}) {
  const data = useMemo(
    () => [
      { subject: 'ATS', score: analysis.atsScore, fullMark: 100 },
      { subject: 'Skills', score: analysis.skillsScore, fullMark: 100 },
      { subject: 'Formatting', score: analysis.formattingScore, fullMark: 100 },
      { subject: 'Grammar', score: analysis.grammarScore, fullMark: 100 },
      { subject: 'Readability', score: analysis.readabilityScore, fullMark: 100 },
    ],
    [analysis]
  )

  return (
    <div className="w-full h-[300px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
