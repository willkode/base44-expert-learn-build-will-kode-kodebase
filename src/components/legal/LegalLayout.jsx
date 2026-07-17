import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { trackEvent } from "@/lib/analytics";

export default function LegalLayout({ title, description, path, updated, children }) {
  useEffect(() => {
    trackEvent("legal_page_view", { legal_page: path });
  }, [path]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Seo title={`${title} — KodeBase`} description={description} path={path} />
      <h1 className="font-sora text-3xl md:text-4xl font-bold mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: {updated}</p>
      <div className="space-y-8 text-[15px] leading-relaxed text-foreground/85 [&_h2]:font-sora [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p+p]:mt-3">
        {children}
      </div>
    </div>
  );
}