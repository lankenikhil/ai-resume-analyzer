import { create } from 'zustand'

export type PageType = 'landing' | 'dashboard' | 'upload' | 'analysis' | 'profile' | 'job-match'

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
}

export interface AnalysisResult {
  id: string
  fileName: string
  resumeText: string
  overallScore: number
  atsScore: number
  skillsScore: number
  formattingScore: number
  grammarScore: number
  readabilityScore: number
  matchScore: number | null
  suggestions: string[]
  missingKeywords: string[]
  matchedKeywords: string[]
  skillGaps: string[]
  improvedSummary: string | null
  jobDescription: string | null
  createdAt: string
}

export interface AuthModalState {
  isOpen: boolean
  mode: 'login' | 'register' | 'forgot'
}

interface AppState {
  // Navigation
  currentPage: PageType
  setCurrentPage: (page: PageType) => void

  // Auth
  user: User | null
  setUser: (user: User | null) => void
  authModal: AuthModalState
  setAuthModal: (state: AuthModalState) => void
  openAuthModal: (mode: 'login' | 'register' | 'forgot') => void
  closeAuthModal: () => void

  // Resume Analysis
  currentAnalysis: AnalysisResult | null
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void
  resumes: AnalysisResult[]
  setResumes: (resumes: AnalysisResult[]) => void

  // Loading states
  isAnalyzing: boolean
  setIsAnalyzing: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'landing',
  setCurrentPage: (page) => set({ currentPage: page }),

  // Auth
  user: null,
  setUser: (user) => set({ user }),
  authModal: { isOpen: false, mode: 'login' },
  setAuthModal: (state) => set({ authModal: state }),
  openAuthModal: (mode) => set({ authModal: { isOpen: true, mode } }),
  closeAuthModal: () => set({ authModal: { isOpen: false, mode: 'login' } }),

  // Resume Analysis
  currentAnalysis: null,
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  resumes: [],
  setResumes: (resumes) => set({ resumes }),

  // Loading states
  isAnalyzing: false,
  setIsAnalyzing: (loading) => set({ isAnalyzing: loading }),
}))
