import React from "react";
import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const WHATSAPP_URL = "https://wa.me/13343929401";

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Will on WhatsApp"
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/40 hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}