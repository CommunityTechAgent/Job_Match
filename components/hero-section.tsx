"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, Mail, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Stop Searching. <br />
            Start Getting Found.
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI-powered job discovery that finds opportunities, writes cover letters, and emails your resume directly to
            employers – all automatically.
          </p>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Job Discovery</h3>
                <p className="text-slate-600">Automatically finds relevant jobs from 500+ sources</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Cover Letters</h3>
                <p className="text-slate-600">Personalized letters written by AI for each job</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Direct Employer Contact</h3>
                <p className="text-slate-600">Skip applications – email resume directly to hiring managers</p>
              </CardContent>
            </Card>
          </div>

          {/* Main CTA */}
          <div className="mb-8">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg">
              Get Your First 3 Matches Free
            </Button>
          </div>

          {/* Trust Indicator */}
          <div className="flex items-center justify-center text-slate-600">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span>Join 500+ professionals who've found better opportunities</span>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 shadow-2xl">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Your Job Matches</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  3 New Matches
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Senior Software Engineer", company: "Tech Corp", match: "95%" },
                  { title: "Product Manager", company: "Innovation Labs", match: "88%" },
                  { title: "Data Scientist", company: "Analytics Pro", match: "92%" },
                ].map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{job.title}</h4>
                      <p className="text-slate-600">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold">{job.match} Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
