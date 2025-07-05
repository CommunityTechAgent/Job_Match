import { HeaderWithAuth } from "@/components/header-with-auth"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { HowItWorks } from "@/components/how-it-works"
import { SocialProof } from "@/components/social-proof"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import FinalCTA from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderWithAuth />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <SocialProof />
        <PricingSection />
        <FaqSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
