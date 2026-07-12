import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <button
          key={idx}
          onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          className="w-full text-left border border-border rounded-xl p-5 hover:border-primary/40 transition-colors bg-card/60"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-foreground">{faq.q}</span>
            {openIndex === idx ? (
              <ChevronUp className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
          {openIndex === idx && (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
          )}
        </button>
      ))}
    </div>
  );
}