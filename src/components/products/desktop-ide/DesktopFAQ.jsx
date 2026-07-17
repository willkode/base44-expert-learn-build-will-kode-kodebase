import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { FAQS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopFAQ() {
  return (
    <DesktopSection headline="Frequently asked questions" className="bg-card/30">
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border bg-card/60 px-5">
              <AccordionTrigger className="font-sora font-semibold text-left text-sm hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </DesktopSection>
  );
}