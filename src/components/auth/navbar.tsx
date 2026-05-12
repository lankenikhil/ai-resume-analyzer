'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Menu,
  FileText,
  LayoutDashboard,
  Upload,
  UserCircle,
  Settings,
  LogOut,
  ScanSearch,
} from 'lucide-react'

export function Navbar() {
  const { user, setUser, setCurrentPage, openAuthModal, currentPage } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('resumeai_user_id')
    localStorage.removeItem('resumeai_user')
    setCurrentPage('landing')
    toast.success('Signed out successfully')
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  // Guest navbar (landing page)
  const renderGuestNav = () => (
    <nav className="hidden md:flex items-center gap-1">
      <button
        onClick={() => scrollToSection('features')}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
      >
        Features
      </button>
      <button
        onClick={() => scrollToSection('how-it-works')}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
      >
        How It Works
      </button>
      <button
        onClick={() => scrollToSection('pricing')}
        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
      >
        Pricing
      </button>
    </nav>
  )

  // Authenticated navbar links
  const renderAuthNav = () => (
    <nav className="hidden md:flex items-center gap-1">
      <button
        onClick={() => setCurrentPage('dashboard')}
        className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          currentPage === 'dashboard'
            ? 'text-emerald-600 bg-emerald-50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <LayoutDashboard className="inline size-4 mr-1.5 -mt-0.5" />
        Dashboard
      </button>
      <button
        onClick={() => setCurrentPage('upload')}
        className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          currentPage === 'upload'
            ? 'text-emerald-600 bg-emerald-50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Upload className="inline size-4 mr-1.5 -mt-0.5" />
        Upload Resume
      </button>
      <button
        onClick={() => setCurrentPage('profile')}
        className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
          currentPage === 'profile'
            ? 'text-emerald-600 bg-emerald-50'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <UserCircle className="inline size-4 mr-1.5 -mt-0.5" />
        Profile
      </button>
    </nav>
  )

  // Guest right side
  const renderGuestActions = () => (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="ghost" onClick={() => openAuthModal('login')} size="sm">
        Sign In
      </Button>
      <Button
        onClick={() => openAuthModal('register')}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        Get Started
      </Button>
    </div>
  )

  // Authenticated right side
  const renderAuthActions = () => (
    <div className="hidden md:flex items-center gap-3">
      <Button
        onClick={() => setCurrentPage('upload')}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <ScanSearch className="size-4" />
        Analyze Resume
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full p-0.5 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            <Avatar className="size-8">
              <AvatarImage src={user?.image || undefined} alt={user?.name || 'User'} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCurrentPage('profile')} className="cursor-pointer">
            <UserCircle className="size-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCurrentPage('profile')} className="cursor-pointer">
            <Settings className="size-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="size-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  // Mobile menu content
  const renderMobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600">
              <FileText className="size-4 text-white" />
            </div>
            <span className="font-bold text-lg">ResumeAI</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-2 px-4">
          {!user ? (
            <>
              <button
                onClick={() => {
                  scrollToSection('features')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection('how-it-works')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  scrollToSection('pricing')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                Pricing
              </button>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  openAuthModal('login')
                  setMobileMenuOpen(false)
                }}
              >
                Sign In
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  openAuthModal('register')
                  setMobileMenuOpen(false)
                }}
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-md px-3 py-2 mb-2">
                <Avatar className="size-10">
                  <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Separator className="my-1" />
              <button
                onClick={() => {
                  setCurrentPage('dashboard')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  setCurrentPage('upload')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === 'upload'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Upload className="size-4" />
                Upload Resume
              </button>
              <button
                onClick={() => {
                  setCurrentPage('profile')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPage === 'profile'
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <UserCircle className="size-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setCurrentPage('profile')
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Settings className="size-4" />
                Settings
              </button>
              <Separator className="my-1" />
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setCurrentPage('upload')
                  setMobileMenuOpen(false)
                }}
              >
                <ScanSearch className="size-4" />
                Analyze Resume
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setCurrentPage('landing')}>
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 transition-transform group-hover:scale-105">
            <FileText className="size-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Resume<span className="text-emerald-600">AI</span>
          </span>
        </Link>

        {/* Center nav - desktop */}
        {user ? renderAuthNav() : renderGuestNav()}

        {/* Right side - desktop */}
        {user ? renderAuthActions() : renderGuestActions()}

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Mobile menu */}
        {renderMobileMenu()}
      </div>
    </header>
  )
}
