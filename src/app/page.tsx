'use client'

import { useAppStore } from '@/store/app-store'
import { LandingPage } from '@/components/landing/landing-page'
import { AnalysisPage } from '@/components/analysis/analysis-page'
import { ProfilePage } from '@/components/profile/profile-page'
import { AuthModal } from '@/components/auth/auth-modal'
import { Navbar } from '@/components/auth/navbar'
import DashboardPage from '@/components/dashboard/dashboard-page'
import UploadPage from '@/components/upload/upload-page'
import JobMatchPage from '@/components/upload/job-match-page'

export default function Home() {
  const { currentPage } = useAppStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage />
      case 'dashboard':
        return <DashboardPage />
      case 'upload':
        return <UploadPage />
      case 'analysis':
        return <AnalysisPage />
      case 'profile':
        return <ProfilePage />
      case 'job-match':
        return <JobMatchPage />
      default:
        return <LandingPage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {currentPage === 'landing' ? (
          renderPage()
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {renderPage()}
          </div>
        )}
      </main>
      <AuthModal />
    </div>
  )
}
