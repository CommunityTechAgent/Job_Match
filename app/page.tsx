"use client"

import { useAuth } from "@/contexts/auth-context"
import { Dashboard } from "@/components/dashboard/dashboard"
import { HeaderWithAuth } from "@/components/header-with-auth"
import { HeroSection } from "@/components/hero-section"
import { SocialProof } from "@/components/social-proof"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturesGrid } from "@/components/features-grid"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (user) {
    return <Dashboard />
  }

  return (
    <div className="min-h-screen bg-white">
      <HeaderWithAuth />
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
