import React from "react";
import { Check } from "lucide-react";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { CLASS_INFO } from "./masterClassData";

const INCLUDED = [
  "Live seat in the 20-week core program",
  "Five guided sessions every week — Learn, Inspect, Build, Test, Submit",
  "20+ exercises, 8 portfolio builds, and 3 major capstones",
  "Project reviews and capstone assessment",
  "KodeBase certification path as you complete each phase",
  "Every prompt, template, and checklist used in class",
];

export default function MasterClassEnroll({ id = "enroll" }) {
  return (
    <section id={id} className="max-w-3xl mx-auto px-6 py-20">
      <div className="rounded-2xl border border-primary/40 bg-card/70 p-8 md:p-10 glow-orange">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Reserve your seat
            </p>
            <p className="mt-2 font-sora font-extrabold text-4xl">
              {CLASS_INFO.priceLabel}
              <span className="ml-2 text-base font-medium text-muted-foreground">per seat</span>
            </p>
          </div>
          <div className="text-sm text-muted-foreground text-right">
            <p className="font-semibold text-foreground">{CLASS_INFO.startLabel}</p>
            <p>Only {CLASS_INFO.seats} seats available</p>
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <ServiceCheckoutButton
            serviceId={CLASS_INFO.serviceId}
            label={`Claim your seat — ${CLASS_INFO.priceLabel}`}
          />
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Marketing and Agency add-on courses are sold separately and released after the core
            program. Certificates are issued by KodeBase — not by Base44 or Anthropic.
          </p>
        </div>
      </div>
    </section>
  );
}