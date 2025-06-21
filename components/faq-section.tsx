"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "How does the AI job matching work?",
      answer:
        "Our AI analyzes your resume, skills, and preferences to automatically scan 500+ job boards and company websites. It identifies relevant opportunities based on your profile and career goals, then ranks them by compatibility score.",
    },
    {
      question: "Are the AI-generated cover letters personalized?",
      answer:
        "Yes! Each cover letter is uniquely written for the specific job and company. Our AI analyzes the job description, company culture, and your background to create compelling, personalized letters that highlight your relevant experience.",
    },
    {
      question: "How do you find hiring manager email addresses?",
      answer:
        "We use advanced web scraping and professional network analysis to identify decision-makers at target companies. Our success rate for finding the right contact is over 85%, significantly higher than generic applications.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption and follow strict data privacy protocols. Your information is never shared with third parties, and you maintain full control over your data at all times.",
    },
    {
      question: "What makes this different from other job search tools?",
      answer:
        "Unlike passive job boards, we actively work for you 24/7. We find jobs, write personalized applications, and contact employers directly - all automatically. It's like having a personal recruiter powered by AI.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time with no penalties. Your account will remain active until the end of your current billing period, and you'll retain access to all generated content.",
    },
  ]

  return (
    <section className="bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-600">Everything you need to know about JobMatch AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
