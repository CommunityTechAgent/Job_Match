"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Upload, Search, FileText, Send } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload & Analyze",
      description: "Upload resume, AI extracts skills",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Search,
      title: "Discover & Match",
      description: "AI scans 500+ boards, matches jobs",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      icon: FileText,
      title: "Generate & Personalize",
      description: "AI writes cover letters and emails",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      icon: Send,
      title: "Send & Track",
      description: "One-click delivery, track responses",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ]

  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How JobMatch AI Works</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our AI-powered platform automates your entire job search process in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow relative">
              <CardContent className="p-8">
                <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
