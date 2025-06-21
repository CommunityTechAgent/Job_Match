"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, Globe, FileText, Mail, BarChart, Bell } from "lucide-react"

export function FeaturesGrid() {
  const features = [
    {
      icon: Brain,
      title: "AI Resume Parsing",
      description: "Advanced AI extracts and analyzes your skills, experience, and preferences",
      borderColor: "border-green-200",
    },
    {
      icon: Globe,
      title: "Multi-Source Discovery",
      description: "Scans 500+ job boards, company sites, and hidden opportunities",
      borderColor: "border-yellow-200",
    },
    {
      icon: FileText,
      title: "Personalized Cover Letters",
      description: "AI writes unique, compelling cover letters for each opportunity",
      borderColor: "border-red-200",
    },
    {
      icon: Mail,
      title: "Direct Employer Email",
      description: "Skip applications and email directly to hiring managers",
      borderColor: "border-green-200",
    },
    {
      icon: BarChart,
      title: "Real-Time Tracking",
      description: "Monitor email opens, responses, and interview requests",
      borderColor: "border-yellow-200",
    },
    {
      icon: Bell,
      title: "Daily Match Notifications",
      description: "Get notified instantly when new relevant opportunities are found",
      borderColor: "border-red-200",
    },
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Powerful Features for Modern Job Seekers
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to transform your job search from manual to automated
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`${feature.borderColor} border-2 hover:shadow-lg transition-shadow`}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
