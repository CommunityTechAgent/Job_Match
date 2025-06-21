"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Shield } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      description: "Perfect for testing our AI-powered job matching",
      features: ["3 job matches", "1 AI cover letter", "Basic tracking", "Email support"],
      cta: "Start Free Trial",
      accent: "border-green-200",
      ctaStyle: "bg-white text-green-600 border-green-600 hover:bg-green-50",
    },
    {
      name: "Pro Plan",
      price: "$4.99 per month",
      period: "billed annually",
      description: "Complete AI job search automation for serious professionals",
      features: [
        "Daily job matches",
        "Unlimited AI cover letters",
        "Direct employer emails",
        "Advanced tracking & analytics",
        "Priority support",
        "Interview preparation tips",
      ],
      cta: "Get Started",
      accent: "border-red-200",
      ctaStyle: "bg-red-500 text-white hover:bg-red-600",
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`${plan.accent} border-2 hover:shadow-lg transition-shadow relative`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600 ml-2">/{plan.period}</span>
                </div>
                <p className="text-slate-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.ctaStyle}`}>{plan.cta}</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center text-slate-600 mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <span>Statisfaction Guarantee</span>
          </div>
          <p className="text-slate-500">Get recognized, get hired, be satisfied?</p>
        </div>
      </div>
    </section>
  )
}
