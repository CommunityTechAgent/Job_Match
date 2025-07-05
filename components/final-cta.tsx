"use client"

import { Button } from "@/components/ui/button"
import { Shield, MapPin, Lock } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to Transform Your Job Search?</h2>
        <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
          Join hundreds of Washington Metro professionals who've streamlined their career growth with AI-powered job
          matching.
        </p>

        <div className="mb-12">
          <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-12 py-4 text-lg">
            Get Started Free
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-slate-600">
          <div className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            <span className="text-sm">SSL Secured</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            <span className="text-sm">GDPR Compliant</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <span className="text-sm">DC Metro Focused</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA;
