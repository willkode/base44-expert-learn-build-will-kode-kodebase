import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const faqs = [
  {
    q: "What does the Launch Ready Audit include?",
    a: "The audit reviews your built app against security best practices and a full QA checklist. Our team tests flows, checks RLS rules, validates integrations, and provides a detailed report with fixes.",
  },
  {
    q: "How much does a Launch Ready Audit cost?",
    a: "Audits start at $500 for small projects. Pro and Agency plans include 1–2 audits per year. Custom pricing available for larger applications.",
  },
  {
    q: "Do you update my app during the audit?",
    a: "No. The audit is a review and reporting service. We identify issues and provide fix prompts you can paste into ForgeBase to resolve them yourself. Optional implementation services are available separately.",
  },
];

export default function FAQ() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 blueprint-grid opacity-[0.35]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[140px]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Questions answered</span>
          </div>
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about audits, services, and building with structure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg bg-card/50 backdrop-blur-sm px-6 transition-all duration-300 data-[state=open]:bg-card data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="py-5 text-left font-medium hover:text-primary transition-colors">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-2">Still have a question?</p>
          <Link to="/contact" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Get in touch →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}