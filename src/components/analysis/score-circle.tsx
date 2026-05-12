'use client'

import { useSyncExternalStore } from 'react'
import { motion } from 'framer-motion'

interface ScoreCircleProps {
  score: number
  size?: number
  label?: string
  showValue?: boolean
}

function getScoreColor(score: number): string {
  if (score <= 40) return '#ef4444' // red-500
  if (score <= 70) return '#f59e0b' // amber-500
  return '#10b981' // emerald-500
}

function getScoreBgColor(score: number): string {
  if (score <= 40) return '#fecaca' // red-200
  if (score <= 70) return '#fde68a' // amber-200
  return '#a7f3d0' // emerald-200
}

function getScoreLabel(score: number): string {
  if (score <= 40) return 'Needs Improvement'
  if (score <= 70) return 'Fair'
  return 'Good'
}

const emptySubscribe = () => () => {}

export function ScoreCircle({
  score,
  size = 120,
  label,
  showValue = true,
}: ScoreCircleProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const strokeWidth = size * 0.08
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = mounted ? (score / 100) * circumference : 0
  const color = getScoreColor(score)
  const bgColor = getScoreBgColor(score)
  const scoreLabel = getScoreLabel(score)
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        {/* Center text */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-bold leading-none"
              style={{
                fontSize: size * 0.28,
                color,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span
              className="text-muted-foreground font-medium"
              style={{ fontSize: size * 0.09 }}
            >
              /100
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm font-semibold text-foreground">{label}</span>
      )}
      {!label && (
        <span
          className="text-xs font-medium"
          style={{ color }}
        >
          {scoreLabel}
        </span>
      )}
    </div>
  )
}
