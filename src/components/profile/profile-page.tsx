'use client'

import { useState } from 'react'
import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import {
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  BarChart3,
  LogOut,
  Trash2,
  Lock,
  Save,
  ArrowLeft,
} from 'lucide-react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const emptySubscribe = () => () => {}

export function ProfilePage() {
  const { user, setUser, resumes, setCurrentPage } = useAppStore()
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) return null

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Not Signed In
        </h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          Please sign in to view your profile.
        </p>
        <Button onClick={() => setCurrentPage('landing')} variant="default">
          Go to Home
        </Button>
      </div>
    )
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase()

  const totalResumes = resumes.length
  const avgScore =
    totalResumes > 0
      ? Math.round(
          resumes.reduce((sum, r) => sum + r.overallScore, 0) / totalResumes
        )
      : 0

  const memberSince = format(new Date(), 'MMM d, yyyy')

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setUser({ ...user, name: name.trim() })
    toast.success('Profile updated successfully!')
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    toast.info('Feature coming soon')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleDeleteAccount = () => {
    toast.info('Feature coming soon')
  }

  const handleSignOut = () => {
    setUser(null)
    localStorage.removeItem('resumeai_user_id')
    localStorage.removeItem('resumeai_user')
    setCurrentPage('landing')
    toast.success('Signed out successfully')
  }

  return (
    <ScrollArea className="h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <motion.div
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage('dashboard')}
              className="gap-1.5 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Profile
            </h1>
          </motion.div>

          <Separator />

          {/* Profile Header Card */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {user.image && <AvatarImage src={user.image} alt={user.name || ''} />}
                    <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-lg font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-foreground truncate">
                      {user.name || 'No name set'}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={user.email}
                        readOnly
                        className="pl-9 bg-muted cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    className="self-start gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Stats */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Member Since
                    </span>
                    <span className="text-sm font-semibold">{memberSince}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Resumes Analyzed
                    </span>
                    <span className="text-sm font-semibold">{totalResumes}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Average Score
                    </span>
                    <span className="text-sm font-semibold">
                      {avgScore > 0 ? `${avgScore}/100` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    className="self-start gap-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={fadeInUp}>
            <Card className="border-red-200 dark:border-red-800/50">
              <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1.5">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all of your data from
                          our servers, including all resume analyses and
                          saved information.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-white hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sign Out */}
          <motion.div variants={fadeInUp}>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  )
}
