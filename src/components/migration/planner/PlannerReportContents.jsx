import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PlannerSection from "./PlannerSection";
import { reportSections } from "./plannerData";

export default function PlannerReportContents() {
  return (
    <PlannerSection eyebrow="$25 one-time unlock" title="What You Get for $25" intro="Your complete migration report includes:">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto rounded-[1.5rem] border border-border bg-card/60 px-4 md:px-8 py-2 md:py-4"
      >
        <Accordion type="single" collapsible defaultValue={reportSections[0].title}>
          {reportSections.map((section, idx) => (
            <AccordionItem key={section.title} value={section.title} className="border-border/70">
              <AccordionTrigger className="text-left hover:no-underline gap-4 py-5">
                <span className="flex items-center gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-sora text-xs font-bold text-primary">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sora font-semibold text-base md:text-lg">{section.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="md:pl-12">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">{section.intro}</p>
                {section.items && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-3">
                    {section.items.map((item, i) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-start gap-2.5">
                        {section.ordered
                          ? <span className="text-primary font-sora font-semibold text-xs mt-0.5">{i + 1}.</span>
                          : <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-400 shrink-0" />}
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.outro && <p className="text-sm text-muted-foreground">{section.outro}</p>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </PlannerSection>
  );
}