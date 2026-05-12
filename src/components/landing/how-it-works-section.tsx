'use client'

import { motion } from 'framer-motion'
import { Upload, Cpu, BarChart3 } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload Resume',
    description: 'Drag & drop your resume file in PDF, DOCX, or plain text format. It only takes seconds.',
  },
  {
    number: 2,
    icon: Cpu,
    title: 'AI Analysis',
    description: 'Our advanced AI analyzes every aspect of your resume — from ATS compatibility to skill gaps.',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Get Results',
    description: 'Receive detailed feedback, scores, and actionable suggestions to improve your resume instantly.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            How It{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get your resume analyzed in three simple steps. No complex setup, no waiting — just results.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Connecting line for desktop */}
          <div className="pointer-events-none absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent md:block dark:via-emerald-700" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Numbered circle */}
              <div className="relative z-10 mb-6">
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-background shadow-lg shadow-emerald-500/10 dark:border-emerald-800">
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <step.icon className="size-7" />
              </div>

              {/* Text */}
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
