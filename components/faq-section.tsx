import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does JobMatch AI work?",
    answer:
      "JobMatch AI uses advanced machine learning algorithms to analyze your skills, experience, and preferences, then matches you with relevant job opportunities. Our AI also helps generate personalized cover letters and application materials.",
  },
  {
    question: "Is JobMatch AI free to use?",
    answer:
      "We offer a free tier that includes basic job matching and limited applications per month. Our premium plans provide unlimited applications, advanced matching features, and priority support.",
  },
  {
    question: "How accurate are the job matches?",
    answer:
      "Our AI matching system has a 85%+ accuracy rate based on user feedback. The more you use the platform and provide feedback, the better our AI becomes at understanding your preferences.",
  },
  {
    question: "Can I customize my job preferences?",
    answer:
      "You can set preferences for job type, location, salary range, company size, industry, and more. Our AI learns from your interactions to refine matches over time.",
  },
  {
    question: "How do you protect my personal information?",
    answer:
      "We take privacy seriously. Your data is encrypted, stored securely, and never shared with third parties without your explicit consent. You have full control over your profile visibility.",
  },
  {
    question: "What types of jobs are available?",
    answer:
      "We partner with companies across all industries and job levels, from entry-level positions to executive roles. Our database includes opportunities in tech, healthcare, finance, marketing, and many other fields.",
  },
]

export function FaqSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get answers to common questions about JobMatch AI</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
