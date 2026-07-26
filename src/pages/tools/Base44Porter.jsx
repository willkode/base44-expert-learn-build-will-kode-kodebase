import React, { useEffect } from "react";
import Seo from "@/components/seo/Seo";
import { canonical, SITE } from "@/lib/seo";
import PorterHero from "@/components/tools/porter/PorterHero";
import PorterCardGrid from "@/components/tools/porter/PorterCardGrid";
import PorterList from "@/components/tools/porter/PorterList";
import PorterDownloadGate from "@/components/tools/porter/PorterDownloadGate";
import { PROBLEM, HOW_IT_WORKS, FINDINGS, LIMITATIONS, SAFETY } from "@/components/tools/porter/porterData";
import { trackEvent } from "@/lib/analytics";
import { AlertTriangle, ShieldCheck } from "lucide-react";

const PATH = "/tools/base44-frontend-porter";
const OG_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/fee01d774_generated_image.png";

export default function Base44Porter() {
  useEffect(() => {
    trackEvent("free_tool_view", { tool: "base44_frontend_porter", page_path: PATH });
  }, []);

  return (
    <div>
      <Seo
        title="Free Base44 Frontend Porter — Host Your App Anywhere, Keep the Backend"
        description="Free desktop tool that moves a Base44 frontend to your own domain or CDN while keeping the same Base44 backend, data and auth. No fork, no empty database. Download free."
        path={PATH}
        image={OG_IMAGE}
        type="website"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Base44 Frontend Porter",
            description:
              "Free desktop tool that ports a Base44 frontend to your own hosting while keeping the Base44 backend, data and auth.",
            url: canonical(PATH),
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Windows, macOS",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.domain, logo: SITE.logo },
          },
        ]}
      />
      <PorterHero />
      <PorterCardGrid
        title="The problem"
        subtitle="Base44 gives you a real backend — entities, auth, functions, connectors, realtime — but the frontend has to live on Base44's hosting. The obvious route, base44 eject, gets you your code and loses your data."
        items={PROBLEM}
      />
      <PorterCardGrid title="How it works" items={HOW_IT_WORKS} />
      <PorterDownloadGate />
      <PorterCardGrid
        title="What I had to measure"
        subtitle="The developer docs describe a different CLI than the one that ships, so most of this was measured rather than read. It's all written up in docs/CLI_FINDINGS.md with repro steps and observed values."
        items={FINDINGS}
      />
      <PorterList title="Safety and engineering notes" items={SAFETY} icon={ShieldCheck} />
      <PorterList title="Honest limitations" items={LIMITATIONS} icon={AlertTriangle} />
      <section className="max-w-3xl mx-auto px-4 pb-20 text-center text-sm text-muted-foreground">
        Independent tool built by KodeBase. Not affiliated with, endorsed by, or supported by Base44.
      </section>
    </div>
  );
}