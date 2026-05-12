'use client'

import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

interface ScoreCardProps {
  score: number
  label: string
  icon?: React.ReactNode
}

function getScoreColor(score: number): string {
  if (score <= 40) return 'bg-red-500'
  if (score <= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getScoreTextColor(score: number): string {
  if (score <= 40) return 'text-red-600'
  if (score <= 70) return 'text-amber-600'
  return 'text-emerald-600'
}

function getScoreTrackColor(score: number): string {
  if (score <= 40) return 'bg-red-100'
  if (score <= 70) return 'bg-amber-100'
  return 'bg-emerald-100'
}

const emptySubscribe = () => () => {}

export function ScoreCard({ score, label, icon }: ScoreCardProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const barColor = getScoreColor(score)
  const textColor = getScoreTextColor(score)
  const trackColor = getScoreTrackColor(score)

  return (
    <Card className="gap-3 py-4">
      <CardContent className="px-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${trackColor}`}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {label}
              </span>
              <span className={`text-lg font-bold ${textColor}`}>
                {score}
              </span>
            </div>
            <div className={`h-2 w-full rounded-full overflow-hidden ${trackColor}`}>
              <motion.div
                className={`h-full rounded-full ${barColor}`}
                initial={{ width: 0 }}
                animate={{ width: mounted ? `${score}%` : 0 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
