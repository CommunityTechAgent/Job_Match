"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function SocialProof() {
  const metrics = [
    { number: "15,000+", label: "Jobs Discovered", color: "bg-green-500" },
    { number: "2,500+", label: "Cover Letters Generated", color: "bg-yellow-500" },
    { number: "800+", label: "Connections Made", color: "bg-red-500" },
    { number: "73%", label: "Response Rate", color: "bg-green-500" },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Arlington, VA",
      quote:
        "JobMatch AI found me 3 perfect opportunities in my first week. The AI-generated cover letters were spot-on and got me interviews immediately.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      company: "Bethesda, MD",
      quote:
        "I was skeptical about AI writing my cover letters, but the quality was incredible. Landed my dream job in just 2 weeks!",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Emily Rodriguez",
      role: "Data Analyst",
      company: "Alexandria, VA",
      quote:
        "The direct employer contact feature is a game-changer. No more black hole applications – I actually get responses now.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-4 h-4 ${metric.color} rounded-full mx-auto mb-3`}></div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{metric.number}</div>
                <div className="text-slate-600 text-sm">{metric.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Trusted by Washington Metro Professionals
          </h2>
          <p className="text-xl text-slate-600">See what our users are saying about their success</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm">{testimonial.role}</div>
                    <div className="text-slate-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
