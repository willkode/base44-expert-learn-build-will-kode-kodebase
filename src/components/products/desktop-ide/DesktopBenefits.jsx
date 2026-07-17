import React from "react";
import { Check } from "lucide-react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import { BENEFITS } from "@/components/products/desktop-ide/desktopIdeData";

const IMAGES = [
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/e31c85d59_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/03db57fc5_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b4a0925c5_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/72da964a2_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/947af649e_generated_image.png",
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/81f7f654a_generated_image.png",
];

export default function DesktopBenefits() {
  return (
    <DesktopSection
      eyebrow="One Workspace. Complete Control."
      headline="Everything you need to move a Base44 app from idea to production."
      copy="Base44 Desktop gives you a structured development environment around the Base44 platform, helping you build faster, reduce mistakes, and understand exactly what is happening inside every project."
      className="bg-card/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENEFITS.map((b, i) => (
          <div key={b.title} className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col">
            <img src={IMAGES[i]} alt={b.title} className="w-full aspect-video object-cover" />
            <div className="p-6 flex flex-col flex-1">
              <h3 className="font-sora font-semibold text-lg mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground flex-1">{b.body}</p>
              <p className="mt-4 flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="font-medium">{b.benefit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </DesktopSection>
  );
}