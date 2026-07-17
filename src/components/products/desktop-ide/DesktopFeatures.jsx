import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { FEATURES } from "@/components/products/desktop-ide/desktopIdeData";

const IMAGES = [
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fea57ee44_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/638f40ecc_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/72ba228c3_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/56149b803_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/998043f9e_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/d975c36b1_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/05bd07b69_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b3bdfcd75_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a6a0061a8_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bc21f9df4_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7e2a4282a_generated_image.png",
];

export default function DesktopFeatures() {
  return (
    <div id="features">
      <DesktopSection
        eyebrow="A Complete Base44 Development Environment"
        headline="Built around the way serious Base44 projects are actually managed."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.name} className="rounded-2xl border border-border bg-card/60 overflow-hidden">
              <img src={IMAGES[i]} alt={f.name} className="w-full aspect-video object-cover" />
              <div className="p-6">
                <h3 className="font-sora font-semibold text-lg leading-tight">{f.name}</h3>
                <p className="text-xs text-primary mb-3">{f.tagline}</p>
                <p className="text-sm text-muted-foreground mb-4">{f.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.items.map((item) => (
                    <span key={item} className="text-[11px] rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DesktopSection>
    </div>
  );
}