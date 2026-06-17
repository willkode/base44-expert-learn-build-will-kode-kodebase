import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const promptEngineFaqs = [
  {
    q: "What exactly do I get?",
    a: "An ordered pack of copy-paste-ready prompts grouped into Build, QA, and Security. Each prompt includes its objective, acceptance criteria, dependencies, and a complexity estimate.",
  },
  {
    q: "How much does it cost?",
    a: "Generating your blueprint and previewing the pack is free. Unlocking the full prompt text is a one-time $10 payment per pack — no subscription.",
  },
  {
    q: "Can I come back to my prompts later?",
    a: "Yes. Once you unlock a pack it is saved to your account permanently. Open the Prompt Engine anytime to reopen and copy your prompts.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. You describe your idea in plain English and the engine handles the structure, sequencing, and prompt writing for you.",
  },
  {
    q: "Are the prompts written for Base44?",
    a: "Yes. Every prompt is tailored to the Base44 builder workflow and sequenced foundation-first so your app is built in the right order.",
  },
];

export default function PromptEngineFAQ() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Frequently asked <span className="text-gradient-orange">questions</span>
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {promptEngineFaqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-5">
              <AccordionTrigger className="font-sora font-semibold text-left text-sm md:text-base hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}