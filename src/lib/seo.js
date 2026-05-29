// Central SEO configuration for ForgeBase.
export const SITE = {
  name: "ForgeBase",
  domain: "https://forgebase.us",
  email: "hello@forgebase.us",
  twitter: "@ForgeBaseAI",
  ogImage:
    "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/2d2767ff4_generated_image.png",
  logo:
    "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a18072b1d_generated_image.png",
  description:
    "Turn your app idea into a complete, builder-ready blueprint — data model, roles, security rules, and copy-paste build prompts.",
};

// Absolute canonical URL for a given path.
export function canonical(path = "/") {
  if (path === "/") return SITE.domain;
  return `${SITE.domain}${path.startsWith("/") ? "" : "/"}${path}`;
}

// SoftwareApplication schema — used on all indexable pages.
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    description: SITE.description,
    url: SITE.domain,
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    sameAs: [`https://x.com/${SITE.twitter.replace("@", "")}`],
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.domain,
      logo: SITE.logo,
    },
  };
}

// FAQPage schema from an array of { q, a } items.
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}