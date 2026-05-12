'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Get started with basic resume analysis.',
    features: ['3 Resume Analyses', 'Basic ATS Score', 'Skill Analysis', 'Grammar Check'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/mo',
    description: 'Unlimited analysis with advanced features.',
    features: [
      'Unlimited Analyses',
      'Job Description Matching',
      'PDF Reports',
      'Priority Support',
      'Detailed Skill Gaps',
      'Keyword Optimization',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations.',
    features: [
      'Team Dashboard',
      'API Access',
      'Custom Branding',
      'Dedicated Support',
      'Bulk Analysis',
      'SSO Integration',
    ],
    cta: 'Contact Us',
    highlighted: false,
  },
]

export function PricingSection() {
  const { user, openAuthModal, setCurrentPage } = useAppStore()

  const handleCtaClick = (planName: string) => {
    if (planName === 'Enterprise') return
    if (user) {
      setCurrentPage('upload')
    } else {
      openAuthModal('register')
    }
  }

  return (
    <section id="pricing" className="py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Simple,{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Transparent
            </span>{' '}
            Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your needs. Start free, upgrade when you&apos;re ready.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`relative h-full transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 dark:border-emerald-600'
                    : 'border-border/50 hover:border-emerald-200 hover:shadow-lg dark:hover:border-emerald-800'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white shadow-md hover:bg-emerald-700">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700'
                        : plan.name === 'Enterprise'
                          ? ''
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/50'
                    }`}
                    variant={plan.highlighted ? 'default' : plan.name === 'Enterprise' ? 'default' : 'outline'}
                    onClick={() => handleCtaClick(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
