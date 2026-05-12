'use client'

import { motion } from 'framer-motion'
import { Shield, Brain, Target, SpellCheck, FileText, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Shield,
    title: 'ATS Compatibility Check',
    description:
      'Ensure your resume passes Applicant Tracking Systems with a detailed compatibility score and actionable fixes.',
  },
  {
    icon: Brain,
    title: 'AI Skill Analysis',
    description:
      'Our AI identifies your key skills, highlights gaps, and suggests improvements to make your resume stand out.',
  },
  {
    icon: Target,
    title: 'Job Description Matching',
    description:
      'Compare your resume against any job description and see exactly how well you match the requirements.',
  },
  {
    icon: SpellCheck,
    title: 'Grammar & Readability',
    description:
      'Catch grammar mistakes, improve readability, and ensure your resume communicates clearly and professionally.',
  },
  {
    icon: FileText,
    title: 'Resume Formatting',
    description:
      'Get formatting recommendations to ensure your resume looks professional and is easy to parse by recruiters.',
  },
  {
    icon: Lightbulb,
    title: 'Improvement Suggestions',
    description:
      'Receive personalized, actionable suggestions to strengthen every section of your resume.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Everything You Need
            </span>{' '}
            to Perfect Your Resume
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Our comprehensive suite of AI-powered tools analyzes every aspect of your resume to help
            you land your dream job.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="group h-full border-border/50 bg-card transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:border-emerald-800">
                <CardHeader>
                  <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:group-hover:bg-emerald-950">
                    <feature.icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
