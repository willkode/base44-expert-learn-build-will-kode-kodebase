import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is the primary benefit of the Knowledge Kit?",
    a: "Better context. It helps general AI models produce Base44-specific blueprints and prompts instead of generic software plans — less translation, less rework.",
  },
  {
    q: "Can I use the kit with models like Opus or GPT-style assistants?",
    a: "Yes. The kit is most useful when working with general-purpose AI models because it gives them Base44-specific structure, terminology, and planning rules.",
  },
  {
    q: "Does the kit replace testing inside Base44?",
    a: "No. It improves planning and prompt quality, but you should still test the app, review permissions, and validate workflows inside Base44.",
  },
  {
    q: "How does KodeBase relate to the knowledge kit?",
    a: "KodeBase turns app ideas into structured blueprints and copy-paste Base44 prompts, applying the kind of Base44-aware planning that the knowledge kit is designed to support.",
  },
  {
    q: "Is this only for technical users?",
    a: "No. Developers can use it to standardize builds, but founders and operators also benefit because it translates business ideas into clearer app requirements.",
  },
];

export default function KitFAQ() {
  return (
    <div className="max-w-3xl mx-auto mt-24">
      <div className="text-center mb-10">
        <span className="text-sm font-semibold text-primary uppercase tracking-widest">FAQ</span>
        <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4">
          Questions, <span className="text-gradient-orange">answered</span>
        </h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left text-sm font-semibold">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}