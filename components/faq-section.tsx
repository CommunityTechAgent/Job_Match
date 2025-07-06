"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does JobMatch AI work?",
    answer:
      "JobMatch AI uses advanced algorithms to analyze your skills, experience, and preferences, then matches you with relevant job opportunities in the Washington Metro area. Our AI continuously learns and improves its recommendations based on your feedback.",
  },
  {
    question: "Is JobMatch AI free to use?",
    answer:
      "Yes! We offer a free tier that includes basic job matching and limited applications per month. Our premium plans provide unlimited access, priority matching, and additional features like resume optimization.",
  },
  {
    question: "What types of jobs are available?",
    answer:
      "We focus on professional opportunities in the Washington Metro area, including government positions, tech roles, consulting, healthcare, finance, and more. Our database includes both federal and private sector opportunities.",
  },
  {
    question: "How accurate are the job matches?",
    answer:
      "Our AI matching system has a 85%+ accuracy rate based on user feedback. The more you use the platform and provide feedback, the better our recommendations become for your specific career goals.",
  },
  {
    question: "Can I apply to jobs directly through the platform?",
    answer:
      "Yes! You can apply to most jobs directly through JobMatch AI. We also provide application tracking and status updates to help you manage your job search effectively.",
  },
  {
    question: "How do you protect my personal information?",
    answer:
      "We take privacy seriously. Your data is encrypted, securely stored, and never shared with third parties without your explicit consent. You control what information is visible to employers.",
  },
]

export function FaqSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get answers to common questions about JobMatch AI and how it can help accelerate your career.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                <span className="font-semibold text-slate-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <a href="mailto:support@jobmatchai.com" className="text-red-500 hover:text-red-600 font-semibold">
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  )
}
