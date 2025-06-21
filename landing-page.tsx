"use client"

import { Header } from "./components/header"
import { HeroSection } from "./components/hero-section"
import { SocialProof } from "./components/social-proof"
import { HowItWorks } from "./components/how-it-works"
import { FeaturesGrid } from "./components/features-grid"
import { PricingSection } from "./components/pricing-section"
import { FAQSection } from "./components/faq-section"
import { FinalCTA } from "./components/final-cta"
import { Footer } from "./components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <SocialProof />
      <HowItWorks />
      <FeaturesGrid />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  )
}
