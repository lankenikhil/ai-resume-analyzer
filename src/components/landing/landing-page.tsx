'use client'

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { HowItWorksSection } from './how-it-works-section'
import { TestimonialsSection } from './testimonials-section'
import { PricingSection } from './pricing-section'
import { FaqSection } from './faq-section'
import { FooterSection } from './footer-section'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
      </main>
      <FooterSection />
    </div>
  )
}
