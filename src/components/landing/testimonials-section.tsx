'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Computer Science Graduate',
    initials: 'SC',
    quote:
      'I was struggling to get interviews after graduation. After using ResumeAI, my ATS score jumped from 45 to 92. I landed my first developer job within two weeks!',
    rating: 5,
  },
  {
    name: 'Michael Torres',
    role: 'Career Switcher — Sales to UX',
    initials: 'MT',
    quote:
      'Switching careers felt impossible until this tool showed me exactly how to reframe my experience. The job matching feature helped me tailor every application. Now I\'m a UX designer!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Fresh Graduate — Data Analyst',
    initials: 'PS',
    quote:
      'As a fresher, my resume was too generic. The AI suggestions helped me highlight relevant projects and skills. My resume score went from 38 to 88 — and I started getting callbacks!',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Loved by{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Hear from people who transformed their job search with AI-powered resume analysis.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:border-emerald-800">
                <CardContent className="pt-6">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-emerald-500 text-emerald-500"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-emerald-200 dark:border-emerald-800">
                      <AvatarFallback className="bg-emerald-50 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
