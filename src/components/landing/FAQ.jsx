import React from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How long does blueprint generation take?",
    a: "Most blueprints are generated in 2–5 minutes depending on project complexity. Our AI agents work in parallel, and you can monitor progress in real time.",
  },
  {
    q: "What happens if I need to change something in my blueprint?",
    a: "Blueprints are living documents. You can regenerate at any time, adjust the intake form, and the agents will produce an updated architecture. All previous versions are archived.",
  },
  {
    q: "Can I use the blueprint with frameworks other than Base44?",
    a: "Our blueprints are tailored specifically for Base44's architecture, entities, and backend functions. However, the core planning (data model, workflows, security rules) can inform development on other platforms.",
  },
  {
    q: "What does the Launch Ready Audit include?",
    a: "The audit reviews your built app against the blueprint's security plan, QA checklist, and best practices. Our team tests flows, checks RLS rules, validates integrations, and provides a detailed report with fixes.",
  },
  {
    q: "How much does a Launch Ready Audit cost?",
    a: "Audits start at $500 for small projects. Pro and Agency plans include 1–2 audits per year. Custom pricing available for larger applications.",
  },
  {
    q: "Do you update my app during the audit?",
    a: "No. The audit is a review and reporting service. We identify issues and provide fix prompts you can paste into Base44 to resolve them yourself. Optional implementation services are available separately.",
  },
  {
    q: "Can I export the blueprint as a PDF or document?",
    a: "Yes. Each blueprint section (architecture, entity plan, security plan, etc.) can be copied or exported. The full blueprint is also available as markdown.",
  },
  {
    q: "What if my project doesn't need all sections of the blueprint?",
    a: "You can skip any section during intake. The agents will focus on what matters — e.g., a public app might skip advanced admin workflows, or a simple MVP might have a minimal security plan.",
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
            Everything you need to know about blueprints, audits, and building with structure.
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
          <a href="mailto:hello@kodearchitect.com" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Get in touch →
          </a>
        </motion.div>
      </div>
    </section>
  );
}