import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Are your products certified organic?",
    answer: "Yes, all our organic products are certified by recognized organic certification bodies. We maintain strict quality standards and regular inspections to ensure authenticity."
  },
  {
    question: "What is your delivery policy?",
    answer: "We offer free delivery for orders above ₹500 within city limits. For other areas, delivery charges apply. We maintain cold chain for perishable items to ensure freshness."
  },
  {
    question: "How do you ensure product freshness?",
    answer: "We source directly from farms and maintain a cold chain supply system. Products are packed fresh and delivered within 24-48 hours of harvest for maximum freshness."
  },
  {
    question: "Do you accept returns?",
    answer: "Yes, we have a 7-day return policy for non-perishable items. For fresh produce, please contact us within 24 hours if you're not satisfied with the quality."
  },
  {
    question: "Can I track my order?",
    answer: "Absolutely! Once your order is dispatched, you'll receive a tracking number via SMS and email. You can track your order in real-time through our website."
  },
  {
    question: "Do you offer bulk discounts?",
    answer: "Yes, we offer attractive discounts for bulk orders. Please contact our customer service team for customized pricing on large quantity orders."
  }
];

export default function FAQSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Get answers to common questions about our organic products and services
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card rounded-lg px-6 border border-border"
            >
              <AccordionTrigger className="text-left font-semibold text-primary hover:text-primary/80">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}