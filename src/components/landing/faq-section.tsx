'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF, DOCX, DOC, and plain text (TXT) files. For best results, we recommend uploading your resume as a PDF or DOCX file, as these formats preserve formatting and allow for the most accurate analysis.',
  },
  {
    question: 'How accurate is the AI analysis?',
    answer:
      'Our AI analysis achieves over 95% accuracy in identifying key resume elements, skills, and ATS compatibility issues. The system is trained on millions of successful resumes and continuously improves through machine learning. However, we always recommend using the analysis as a guide alongside your own judgment.',
  },
  {
    question: 'Is my resume data secure?',
    answer:
      'Absolutely. We take data security very seriously. Your resume is encrypted both in transit and at rest. We never share your personal data with third parties, and you can delete your data at any time. We are fully compliant with GDPR and other privacy regulations.',
  },
  {
    question: 'Can I analyze multiple resumes?',
    answer:
      'Yes! Free users can analyze up to 3 resumes. Pro users enjoy unlimited resume analyses, making it easy to tailor different versions of your resume for different job applications. Enterprise users can also analyze resumes in bulk via our API.',
  },
  {
    question: 'What is ATS compatibility?',
    answer:
      'ATS stands for Applicant Tracking System — software used by employers to filter and rank job applications. ATS compatibility means your resume is formatted and written in a way that these systems can correctly parse and understand. Our tool checks for common ATS issues like complex formatting, missing keywords, and unreadable file structures.',
  },
  {
    question: 'How do I improve my resume score?',
    answer:
      'After each analysis, you\'ll receive a detailed breakdown of your scores and specific, actionable suggestions for improvement. Common improvements include: adding missing keywords from the job description, simplifying formatting for ATS readability, quantifying achievements with metrics, and strengthening your professional summary. Following these suggestions typically raises scores by 30-50 points.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking
            for, feel free to reach out to our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium hover:text-emerald-600 hover:no-underline dark:hover:text-emerald-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
