'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  X,
  Loader2,
  FileUp,
  ClipboardPaste,
  AlertCircle,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function getUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('resumeai_user_id')
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase()
}

export default function UploadPage() {
  const { isAnalyzing, setIsAnalyzing, setCurrentAnalysis, resumes, setResumes, setCurrentPage } = useAppStore()
  const [activeTab, setActiveTab] = useState<string>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    const ext = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit. Your file is ${formatFileSize(file.size)}.`
    }
    return null
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }
    setError(null)
    setSelectedFile(file)
  }, [validateFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    const userId = getUserId()
    if (!userId) {
      toast.error('Please log in to analyze resumes')
      return
    }

    if (activeTab === 'file' && !selectedFile) {
      toast.error('Please select a file to analyze')
      return
    }

    if (activeTab === 'text' && (!resumeText || resumeText.trim().length < 20)) {
      toast.error('Please paste your resume text (at least 20 characters)')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile)
      } else {
        formData.append('resumeText', resumeText.trim())
      }

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Analysis failed. Please try again.')
      }

      const result = await response.json()
      setCurrentAnalysis(result)
      setResumes([result, ...resumes])
      setCurrentPage('analysis')
      toast.success('Resume analyzed successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsAnalyzing(false)
    }
  }, [activeTab, selectedFile, resumeText, resumes, setIsAnalyzing, setCurrentAnalysis, setResumes, setCurrentPage])

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
          Upload Your Resume
        </h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered analysis, ATS scoring, and improvement suggestions.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="file" className="flex-1">
            <FileUp className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="text" className="flex-1">
            <ClipboardPaste className="h-4 w-4 mr-2" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer',
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/30'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="file-info"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-3"
                    >
                      <div className="rounded-full bg-emerald-100 p-3 mx-auto w-fit">
                        <FileText className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile()
                        }}
                        className="mt-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload-prompt"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-4"
                    >
                      <div className="rounded-full bg-emerald-100 p-3 mx-auto w-fit">
                        <Upload className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">
                          {isDragOver ? 'Drop your file here' : 'Drag & drop your resume here'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          or <span className="text-primary underline underline-offset-2">click to browse</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Badge variant="secondary">PDF</Badge>
                        <Badge variant="secondary">DOCX</Badge>
                        <Badge variant="secondary">TXT</Badge>
                        <span className="text-xs text-muted-foreground">Max 5MB</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error Message */}
              {error && activeTab === 'file' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Paste your resume content</p>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here... Include your work experience, education, skills, and any other relevant information."
                  className="min-h-[250px] resize-y"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {resumeText.length > 0
                    ? `${resumeText.length} characters entered`
                    : 'Minimum 20 characters required'}
                </p>
              </div>

              {error && activeTab === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analyze Button */}
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || (activeTab === 'file' ? !selectedFile : resumeText.trim().length < 20)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing your resume...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Analyze Resume
          </>
        )}
      </Button>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
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
              <h3 className="font-semibold text-lg mb-2">Analyzing your resume...</h3>
              <p className="text-muted-foreground text-sm">
                Our AI is reviewing your resume for ATS compatibility, skills, formatting, and more.
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
      </AnimatePresence>
    </motion.div>
  )
}
