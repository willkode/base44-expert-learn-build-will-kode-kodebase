import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, ArrowRight, CheckCircle, ChevronDown, ChevronUp,
  Clock, FileText, Link2, Tag, Globe, Share2, Cpu, Zap,
  Smartphone, Image, Code2, Settings, Search, BarChart2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

const deliverables = [
  "Full SEO audit report",
  "Prioritized issue list",
  "Page-by-page SEO findings",
  "Ready-to-paste Base44 fix prompts",
  "Internal linking recommendations",
  "Metadata and Open Graph recommendations",
  "Indexing and crawlability review",
  "Core Web Vitals and performance checks",
  "Optional implementation by me",
];

const auditAreas = [
  {
    num: "01",
    icon: Tag,
    title: "Title Tags & Meta Descriptions",
    desc: "Your page title is one of the first signals search engines and users see. Weak titles hurt clicks. Duplicate titles confuse search engines. Missing descriptions make your pages look generic in search results.",
    checks: [
      "Unique title tags for every important page",
      "Keyword-focused page titles",
      "Proper title length",
      "Strong meta descriptions",
      "Duplicate or missing metadata",
      "Route-specific metadata inside Base44",
    ],
    why: "If every page says the same thing, Google has less context. If your search preview is weak, fewer people click.",
  },
  {
    num: "02",
    icon: FileText,
    title: "Page Headings & Content Structure",
    desc: "A good page needs a clear structure. That means one strong main heading, clean subheadings, and content that explains the page topic clearly.",
    checks: [
      "Proper H1 usage",
      "H2 and H3 structure",
      "Thin content",
      "Missing page context",
      "Keyword alignment",
      "Repeated or confusing headings",
      "Landing page clarity",
    ],
    why: "Search engines use page structure to better understand the content. Visitors use it to decide if they are in the right place.",
  },
  {
    num: "03",
    icon: Link2,
    title: "Internal Linking",
    desc: "Internal linking is one of the most overlooked SEO problems in Base44 apps. If your pages do not link to each other properly, search engines may struggle to discover your content, understand page relationships, or identify your most important pages.",
    checks: [
      "Navigation links",
      "Footer links",
      "Contextual links inside content",
      "Links between service pages",
      "Links from homepage to important pages",
      "Orphan pages",
      "Broken internal links",
      "Anchor text quality",
    ],
    why: "Internal links help search engines find pages and understand which pages matter most. They also help users move through your site without getting lost.",
  },
  {
    num: "04",
    icon: Globe,
    title: "Canonical Tags & Duplicate Content",
    desc: "Base44 apps can accidentally create duplicate or near-duplicate pages. Canonical tags tell search engines which version of a page should be treated as the main version.",
    checks: [
      "Missing canonical tags",
      "Incorrect canonical URLs",
      "Duplicate route issues",
      "HTTP vs HTTPS conflicts",
      "www vs non-www conflicts",
      "Trailing slash inconsistencies",
      "Parameter-based duplicate pages",
    ],
    why: "If Google sees multiple versions of the same page, ranking signals can get split instead of strengthening one main page.",
  },
  {
    num: "05",
    icon: Search,
    title: "Indexing & Crawlability",
    desc: "Not every page should be indexed. But your important pages absolutely should be.",
    checks: [
      "Robots.txt",
      "Sitemap.xml",
      "Noindex tags",
      "Blocked pages",
      "Crawl errors",
      "Search Console readiness",
      "Important pages missing from sitemap",
      "Pages that should not appear in search",
    ],
    why: "If Google cannot crawl or index your important pages, they will not rank. If Google indexes low-value or private pages, it can weaken your overall search quality.",
  },
  {
    num: "06",
    icon: Share2,
    title: "Open Graph & Social Preview Tags",
    desc: "SEO is not just Google. When someone shares your link on LinkedIn, Facebook, Discord, Slack, or X, your preview should look professional.",
    checks: [
      "Open Graph title",
      "Open Graph description",
      "Open Graph image",
      "Twitter card tags",
      "Social preview image size",
      "Route-specific social previews",
      "Broken or generic previews",
    ],
    why: "Bad previews reduce clicks. Generic previews make your brand look unfinished. Strong previews make your links more clickable and trustworthy.",
  },
  {
    num: "07",
    icon: Cpu,
    title: "Technical SEO",
    desc: "Technical SEO is the foundation. If your site has crawl issues, broken structure, missing files, bad redirects, or weak rendering, content alone will not fix it.",
    checks: [
      "Crawlability",
      "Redirect issues",
      "Broken links",
      "JavaScript rendering concerns",
      "Sitemap setup",
      "Robots.txt setup",
      "Structured data",
      "Route structure",
      "Status codes",
      "Page accessibility signals",
    ],
    why: "Technical SEO helps search engines access, understand, and trust your site.",
  },
  {
    num: "08",
    icon: Zap,
    title: "Core Web Vitals & Page Speed",
    desc: "A slow site loses visitors. Google's Core Web Vitals measure real-world user experience — loading performance, interactivity, and visual stability.",
    checks: [
      "Largest Contentful Paint (LCP)",
      "Interaction to Next Paint (INP)",
      "Cumulative Layout Shift (CLS)",
      "Mobile speed",
      "Image size issues",
      "Render-blocking assets",
      "Layout shifts",
      "Heavy scripts",
      "Slow-loading pages",
    ],
    why: "Better performance helps users stay longer, click more, and convert better. It can also support better search performance when competing pages are similar.",
  },
  {
    num: "09",
    icon: Smartphone,
    title: "Mobile SEO",
    desc: "Most users search from mobile. If your Base44 app looks good on desktop but feels broken on mobile, rankings and conversions can suffer.",
    checks: [
      "Mobile layout issues",
      "Tap target spacing",
      "Text readability",
      "Responsive sections",
      "Mobile navigation",
      "Mobile page speed",
      "Mobile-first content structure",
    ],
    why: "Google primarily evaluates mobile usability because users search heavily on mobile. A poor mobile experience can cost you traffic and leads.",
  },
  {
    num: "10",
    icon: Image,
    title: "Image SEO",
    desc: "Images can help or hurt your SEO. Unoptimized images slow down your site. Missing alt text gives search engines and accessibility tools less context.",
    checks: [
      "Missing alt text",
      "Poor file names",
      "Oversized images",
      "Missing width and height",
      "Lazy loading",
      "Image compression",
      "Hero image performance",
      "Social preview image quality",
    ],
    why: "Good image SEO improves page speed, accessibility, and search clarity.",
  },
  {
    num: "11",
    icon: Code2,
    title: "Structured Data",
    desc: "Structured data gives search engines extra context about your content. Google uses structured data to better understand page content and may use it for enhanced search result features when eligible.",
    checks: [
      "Organization schema",
      "Local business schema",
      "Service schema",
      "Article schema",
      "FAQ schema",
      "Breadcrumb schema",
      "Missing or invalid JSON-LD",
    ],
    why: "Structured data helps search engines understand what your site represents, what services you offer, and how your pages relate to each other.",
  },
  {
    num: "12",
    icon: Settings,
    title: "Base44-Specific SEO Issues",
    desc: "This is where most generic SEO audits fall short. Base44 apps have unique SEO challenges because they are often built as single-page applications.",
    checks: [
      "React Helmet Async setup",
      "Route-based metadata",
      "Dynamic title and description handling",
      "Client-rendered metadata issues",
      "Social preview rendering problems",
      "Sitemap generation",
      "Public page structure",
      "Internal route crawlability",
      "SSR or prerendering need",
      "Search Console validation",
    ],
    why: "A normal SEO audit may tell you what is wrong. This gives you Base44-specific corrections you can actually use.",
  },
];

const bestFit = [
  "Base44 apps that need organic traffic",
  "Local business websites built in Base44",
  "SaaS apps that need better landing pages",
  "Vibe-coded apps launched without SEO",
  "Service businesses trying to rank locally",
  "E-commerce or marketplace apps",
  "Apps preparing for launch",
  "Sites getting impressions but no clicks",
  "Sites with pages that aren't being indexed",
  "Business owners who don't know what's hurting rankings",
];

const plans = [
  {
    title: "SEO Audit",
    subtitle: "Report + fix prompts",
    price: "$50",
    billing: "one-time",
    badge: null,
    features: [
      "Full SEO audit report",
      "Page title and meta review",
      "Heading and content structure review",
      "Internal linking review",
      "Technical SEO review",
      "Mobile SEO review",
      "Core Web Vitals check",
      "Image SEO review",
      "Indexing recommendations",
      "Ready-to-paste Base44 fix prompts",
    ],
    cta: "Get SEO Audit",
    href: "https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4",
  },
  {
    title: "SEO Audit + Fix",
    subtitle: "Audit + I fix it for you",
    price: "$125",
    billing: "one-time",
    badge: "Recommended",
    features: [
      "Everything in SEO Audit",
      "I implement the corrections",
      "Metadata cleaned up",
      "Headings improved",
      "Internal links added or improved",
      "Sitemap and indexing reviewed",
      "Open Graph tags corrected",
      "Image SEO improved",
      "Technical fixes applied where possible",
      "Final verification pass",
    ],
    cta: "Get Audit + Fix",
    href: "https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4",
  },
  {
    title: "SSR / Prerender Setup",
    subtitle: "Better crawler & social visibility",
    price: "$150",
    billing: "one-time",
    badge: null,
    features: [
      "SSR or prerendering setup",
      "Meta tags rendered for crawlers",
      "Open Graph tags rendered properly",
      "Route previews corrected",
      "Crawler testing",
      "Search and social preview verification",
    ],
    cta: "Get SSR Setup",
    href: "https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4",
  },
];

const steps = [
  { num: "01", title: "Choose your package", desc: "Pick SEO Audit, SEO Audit + Fix, or SSR / Prerender Setup." },
  { num: "02", title: "Send your site details", desc: "URL, target keywords, location (for local SEO), and any concerns you already have." },
  { num: "03", title: "I review the site", desc: "Audit from a technical, on-page, and Base44-implementation perspective." },
  { num: "04", title: "You get a prioritized report", desc: "Clear findings ranked by importance. No fluff. No generic checklists." },
  { num: "05", title: "You get fix prompts", desc: "For audit-only clients, ready-to-paste prompts you can use inside Base44." },
  { num: "06", title: "I fix it for you", desc: "For Audit + Fix clients, I apply corrections and run a final verification pass." },
];

const faqs = [
  { q: "What kinds of sites do you audit?", a: "Primarily Base44 apps and websites, but also custom React apps and any JavaScript-heavy site where metadata, crawlability, and performance need a focused review." },
  { q: "Is this only for Base44?", a: "No. While I specialize in Base44-specific SEO challenges (like client-rendered metadata and route-based meta tags), the audit methodology applies to any web app or site." },
  { q: "What is the difference between Audit and Audit + Fix?", a: "SEO Audit gives you the full report and Base44-specific fix prompts you apply yourself. SEO Audit + Fix means I implement the corrections for you and run a final verification pass." },
  { q: "Do you guarantee rankings?", a: "No. No one can ethically guarantee search rankings — Google's algorithm is complex and constantly changing. What I can guarantee is a thorough, accurate audit with real, actionable corrections." },
  { q: "How long does it take?", a: "The audit is delivered within 48–72 hours of receiving your site details. Audit + Fix typically adds 1–2 business days for implementation." },
  { q: "Do you need access to my Base44 app?", a: "Not necessarily. A public URL is enough for most of the audit. If your app requires login to see important pages, providing credentials helps me check route-specific metadata and role-based flows." },
  { q: "Can I upgrade later?", a: "Yes. Start with the Audit, review the findings, then contact me to upgrade to Audit + Fix or SSR setup." },
  { q: "What if my app needs SSR or prerendering?", a: "The audit will flag this clearly if it's a problem. You can then book the SSR / Prerender Setup package as a follow-on." },
];

function AuditArea({ area, i }) {
  const [open, setOpen] = useState(false);
  const Icon = area.icon;
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.2}
      className="rounded-2xl border border-border bg-card/60 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex items-start gap-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="font-sora font-extrabold text-xl text-gradient-orange shrink-0 w-8">{area.num}</span>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">{area.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground mb-4">{area.desc}</p>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">I check</p>
          <ul className="grid md:grid-cols-2 gap-2 mb-4">
            {area.checks.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                {c}
              </li>
            ))}
          </ul>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Why it matters</p>
            <p className="text-sm text-muted-foreground">{area.why}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border border-border rounded-xl p-5 hover:border-primary/40 transition-colors bg-card/60"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-foreground">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>
      {open && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>}
    </button>
  );
}

export default function SeoAudit() {
  useEffect(() => {
    trackEvent("page_view", { page: "seo_audit_service" });
    document.title = "Base44 SEO Audit & Corrections — Stop Guessing, Start Ranking | KodeBase";
  }, []);

  const handleCTA = (label) => {
    trackEvent("service_cta_click", { service: "seo_audit", cta: label });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Base44 SEO Audit & Corrections</span>
            </div>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-sora font-extrabold text-4xl md:text-6xl tracking-tight mb-4"
          >
            Stop Guessing, And<br />
            <span className="text-gradient-orange">Start Ranking.</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Base44 makes it easy to launch fast — but most apps ship like software, not like search-ready websites. I audit your Base44 app, find what's holding it back, and give you ready-to-paste fix prompts or implement the corrections for you.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-6 mb-10">
            {[
              { icon: Clock, label: "Delivered in 48–72 hours" },
              { icon: BarChart2, label: "10+ years of SEO experience" },
              { icon: Settings, label: "Base44-specific fix prompts included" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing" onClick={() => handleCTA("hero_primary")}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Get My SEO Audit <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">The problem</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">Base44 makes it easy to build and launch fast.</h2>
          </div>
          <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
            <p>But most Base44 apps are launched like software, not like search-ready websites.</p>
            <p>That means Google may not clearly understand your pages, your titles may be weak or duplicated, your internal links may be missing, your social previews may be broken, and your best pages may never get the visibility they deserve.</p>
            <p className="font-semibold text-foreground">I fix that.</p>
            <p>With 10+ years of SEO experience, I audit your Base44 app, identify what is holding it back, and either give you ready-to-paste correction prompts or fix the issues for you.</p>
            <p>Google Search relies on crawling, indexing, and ranking systems, so if your pages are hard to crawl, unclear, slow, duplicated, or poorly structured, your visibility can suffer.</p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What you get</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">A full technical SEO audit built specifically for Base44 apps.</h2>
            <p className="text-muted-foreground">Everything you need to understand what's hurting your rankings — and exactly how to fix it.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {deliverables.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why this matters</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">Most site owners think SEO means keywords.</h2>
          </div>
          <p className="text-muted-foreground mb-4">That's only part of it. Search engines need to understand:</p>
          <ul className="space-y-2 mb-6">
            {[
              "What each page is about",
              "Which page is the main version",
              "How pages connect to each other",
              "Which pages should be indexed",
              "Which pages should not be indexed",
              "How fast and usable the site is",
              "What content should appear in search and social previews",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm leading-relaxed">If those signals are missing, messy, or duplicated, your site can look unfinished to search engines even if it looks good to users.</p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-3">For JavaScript-heavy apps, Google provides specific guidance for making sure content, links, metadata, and structured data can be processed correctly. That matters for Base44 apps because they are often built as client-rendered web apps.</p>
        </div>
      </section>

      {/* 12 audit areas */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What this covers — in detail</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">12 areas. Every Base44 SEO failure pattern.</h2>
            <p className="text-muted-foreground">For each area below: what I check, and why it matters for your rankings.</p>
          </div>
          <div className="space-y-3">
            {auditAreas.map((area, i) => (
              <AuditArea key={area.num} area={area} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Best fit */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Best fit</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Built for Base44 apps that need to be found.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bestFit.map((item, i) => (
              <motion.div
                key={item}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.3}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
              >
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-3">Three ways to grow search traffic.</h2>
            <p className="text-muted-foreground">Pay once. Get a prioritized report, a fully corrected site, or proper SSR/prerendering — delivered fast.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className={`relative rounded-2xl border p-8 flex flex-col ${plan.badge ? "border-primary bg-primary/5 glow-orange" : "border-border bg-card/60"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
                  </div>
                )}
                <h3 className="font-sora font-bold text-xl mb-1">{plan.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-sora font-extrabold text-4xl text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.billing}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.href} target="_blank" rel="noopener noreferrer" onClick={() => handleCTA(plan.title)}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" size="lg">
                    {plan.cta}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">From order to ranked.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.4}
                className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/60"
              >
                <span className="font-sora font-extrabold text-2xl text-gradient-orange shrink-0">{step.num}</span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQ key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Free resource */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Free resource</p>
            <h2 className="font-sora font-extrabold text-3xl tracking-tight mb-2">Building a Base44 app? Start here.</h2>
            <p className="text-muted-foreground">Use this free SEO setup prompt before launch so your app doesn't ship with weak titles, missing descriptions, or generic social previews.</p>
          </div>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-1">Free Base44 SEO Setup Prompt</p>
              <p className="text-sm text-muted-foreground">React Helmet Async + meta tag scaffolding</p>
            </div>
            <Link to="/learn/prompt-library" onClick={() => handleCTA("free_resource")}>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                Get Free Prompt <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative">
        <div className="absolute inset-0 blueprint-grid opacity-10" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-sora font-extrabold text-3xl md:text-4xl tracking-tight mb-4">
            Stop guessing what's hurting your rankings.
          </h2>
          <p className="text-muted-foreground mb-8">Get a Base44 SEO Audit and know exactly what needs to be fixed. Choose your package, send your URL, and get a prioritized report with real corrections.</p>
          <a
            href="https://checkout.square.site/merchant/MLYDVQNYZ9YXJ/checkout/6ZFPBTVBBPZUIPKGW44SPJF4"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCTA("final_cta")}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10">
              Get My SEO Audit <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </section>
    </>
  );
}