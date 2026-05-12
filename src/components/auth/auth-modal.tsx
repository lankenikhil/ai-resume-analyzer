'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { Mail, Lock, User, Loader2, Chrome } from 'lucide-react'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function AuthModal() {
  const { authModal, openAuthModal, closeAuthModal, setUser, setCurrentPage } =
    useAppStore()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regErrors, setRegErrors] = useState<Record<string, string>>({})
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotErrors, setForgotErrors] = useState<Record<string, string>>({})
  const [forgotLoading, setForgotLoading] = useState(false)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedUserId = localStorage.getItem('resumeai_user_id')
      const savedUser = localStorage.getItem('resumeai_user')
      if (savedUserId && savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      }
    } catch {
      // Ignore parsing errors
    }
  }, [setUser])

  // Reset form state when modal opens/mode changes
  useEffect(() => {
    if (authModal.isOpen) {
      setLoginErrors({})
      setRegErrors({})
      setForgotErrors({})
    }
  }, [authModal.isOpen, authModal.mode])

  const handleLogin = useCallback(async () => {
    const errors: Record<string, string> = {}
    if (!loginEmail) {
      errors.email = 'Email is required'
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email'
    }
    if (!loginPassword) {
      errors.password = 'Password is required'
    } else if (loginPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors)
      return
    }

    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setLoginErrors({ general: data.error || 'Login failed' })
        return
      }

      setUser(data)
      localStorage.setItem('resumeai_user_id', data.id)
      localStorage.setItem('resumeai_user', JSON.stringify(data))
      closeAuthModal()
      setCurrentPage('dashboard')
      toast.success('Welcome back!', { description: `Signed in as ${data.name || data.email}` })
    } catch {
      setLoginErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setLoginLoading(false)
    }
  }, [loginEmail, loginPassword, setUser, closeAuthModal, setCurrentPage])

  const handleRegister = useCallback(async () => {
    const errors: Record<string, string> = {}
    if (!regName.trim()) {
      errors.name = 'Name is required'
    }
    if (!regEmail) {
      errors.email = 'Email is required'
    } else if (!validateEmail(regEmail)) {
      errors.email = 'Please enter a valid email'
    }
    if (!regPassword) {
      errors.password = 'Password is required'
    } else if (regPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    if (!regConfirm) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (regPassword !== regConfirm) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors)
      return
    }

    setRegLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail, password: regPassword, name: regName }),
      })
      const data = await res.json()

      if (!res.ok) {
        setRegErrors({ general: data.error || 'Registration failed' })
        return
      }

      setUser(data)
      localStorage.setItem('resumeai_user_id', data.id)
      localStorage.setItem('resumeai_user', JSON.stringify(data))
      closeAuthModal()
      setCurrentPage('dashboard')
      toast.success('Account created!', { description: 'Welcome to ResumeAI' })
    } catch {
      setRegErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setRegLoading(false)
    }
  }, [regName, regEmail, regPassword, regConfirm, setUser, closeAuthModal, setCurrentPage])

  const handleForgotPassword = useCallback(async () => {
    const errors: Record<string, string> = {}
    if (!forgotEmail) {
      errors.email = 'Email is required'
    } else if (!validateEmail(forgotEmail)) {
      errors.email = 'Please enter a valid email'
    }

    if (Object.keys(errors).length > 0) {
      setForgotErrors(errors)
      return
    }

    setForgotLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setForgotLoading(false)
    toast.success('Password reset link sent! (Demo only)')
    openAuthModal('login')
  }, [forgotEmail, openAuthModal])

  const handleGoogleAuth = () => {
    toast.info('Coming soon!', { description: 'Google authentication will be available soon' })
  }

  const renderLogin = () => (
    <div className="space-y-4">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-2xl font-bold">Welcome back</DialogTitle>
        <DialogDescription>Sign in to your ResumeAI account</DialogDescription>
      </DialogHeader>

      {loginErrors.general && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loginErrors.general}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={loginEmail}
              onChange={(e) => {
                setLoginEmail(e.target.value)
                if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: '' }))
              }}
              className="pl-9"
              aria-invalid={!!loginErrors.email}
            />
          </div>
          {loginErrors.email && (
            <p className="text-xs text-destructive">{loginErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value)
                if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: '' }))
              }}
              className="pl-9"
              aria-invalid={!!loginErrors.password}
            />
          </div>
          {loginErrors.password && (
            <p className="text-xs text-destructive">{loginErrors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => openAuthModal('forgot')}
            className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          onClick={handleLogin}
          disabled={loginLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="lg"
        >
          {loginLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          or continue with
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleGoogleAuth}
        type="button"
      >
        <Chrome className="size-4" />
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => openAuthModal('register')}
          className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Sign Up
        </button>
      </p>
    </div>
  )

  const renderRegister = () => (
    <div className="space-y-4">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-2xl font-bold">Create an account</DialogTitle>
        <DialogDescription>Get started with ResumeAI for free</DialogDescription>
      </DialogHeader>

      {regErrors.general && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {regErrors.general}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="reg-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={regName}
              onChange={(e) => {
                setRegName(e.target.value)
                if (regErrors.name) setRegErrors((prev) => ({ ...prev, name: '' }))
              }}
              className="pl-9"
              aria-invalid={!!regErrors.name}
            />
          </div>
          {regErrors.name && (
            <p className="text-xs text-destructive">{regErrors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="reg-email"
              type="email"
              placeholder="name@example.com"
              value={regEmail}
              onChange={(e) => {
                setRegEmail(e.target.value)
                if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: '' }))
              }}
              className="pl-9"
              aria-invalid={!!regErrors.email}
            />
          </div>
          {regErrors.email && (
            <p className="text-xs text-destructive">{regErrors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="reg-password"
              type="password"
              placeholder="At least 6 characters"
              value={regPassword}
              onChange={(e) => {
                setRegPassword(e.target.value)
                if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: '' }))
              }}
              className="pl-9"
              aria-invalid={!!regErrors.password}
            />
          </div>
          {regErrors.password && (
            <p className="text-xs text-destructive">{regErrors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="reg-confirm"
              type="password"
              placeholder="Confirm your password"
              value={regConfirm}
              onChange={(e) => {
                setRegConfirm(e.target.value)
                if (regErrors.confirmPassword)
                  setRegErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              className="pl-9"
              aria-invalid={!!regErrors.confirmPassword}
            />
          </div>
          {regErrors.confirmPassword && (
            <p className="text-xs text-destructive">{regErrors.confirmPassword}</p>
          )}
        </div>

        <Button
          onClick={handleRegister}
          disabled={regLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="lg"
        >
          {regLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          or continue with
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={handleGoogleAuth}
        type="button"
      >
        <Chrome className="size-4" />
        Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Sign In
        </button>
      </p>
    </div>
  )

  const renderForgotPassword = () => (
    <div className="space-y-4">
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-2xl font-bold">Reset password</DialogTitle>
        <DialogDescription>
          Enter your email and we&apos;ll send you a reset link
        </DialogDescription>
      </DialogHeader>

      {forgotErrors.general && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {forgotErrors.general}
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              placeholder="name@example.com"
              value={forgotEmail}
              onChange={(e) => {
                setForgotEmail(e.target.value)
                if (forgotErrors.email) setForgotErrors((prev) => ({ ...prev, email: '' }))
              }}
              className="pl-9"
              aria-invalid={!!forgotErrors.email}
            />
          </div>
          {forgotErrors.email && (
            <p className="text-xs text-destructive">{forgotErrors.email}</p>
          )}
        </div>

        <Button
          onClick={handleForgotPassword}
          disabled={forgotLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          size="lg"
        >
          {forgotLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Back to Login
        </button>
      </p>
    </div>
  )

  return (
    <Dialog open={authModal.isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[440px]">
        {authModal.mode === 'login' && renderLogin()}
        {authModal.mode === 'register' && renderRegister()}
        {authModal.mode === 'forgot' && renderForgotPassword()}
      </DialogContent>
    </Dialog>
  )
}
