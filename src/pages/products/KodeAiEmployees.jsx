import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Bot, Download, ShoppingCart, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import { faqSchema } from "@/lib/seo";
import { useCart } from "@/components/cart/CartContext";
import { trackViewItem, trackSelectItem, trackAddToCart } from "@/lib/analytics";
import { isSummerSaleActive, getProductSalePriceCents, formatUsd, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";

const slug = "kode-ai-employees";
const roles = [
  ["GTM Engineer", "Turn market research into a focused launch plan, positioning, and outreach drafts.", "8 routines"],
  ["SEO/AEO Specialist", "Organize search research, content briefs, and technical recommendations.", "8 routines"],
  ["Web Development Analyst", "Triage issues, propose changes, and prepare QA plans for your app.", "8 routines"],
  ["Social Media Manager", "Build content calendars, draft posts, and review channel performance.", "7 routines"],
  ["Paid Ads Analyst", "Analyze campaign data and prepare creative and budget recommendations.", "7 routines"],
  ["Sales Development Specialist", "Organize qualified prospects, draft follow-ups, and track pipeline work.", "7 routines"],
  ["Customer Success Specialist", "Triage support, prepare replies, and surface retention and onboarding needs.", "8 routines"],
  ["Chief of Staff", "Bring role reports together into priorities, decisions, and a clear operating brief.", "7 routines"],
];
const included = ["8 role-specific knowledge.md files", "53 ordered Base44 build prompts", "60 operating routine prompts", "8 native-agent configuration examples", "Shared architecture and acceptance checklists", "One ZIP with a step-by-step start guide"];
const faqs = [
  { q: "What exactly am I buying?", a: "A downloadable implementation kit: Markdown guides, build prompts, role knowledge files, routine prompts, and agent configuration examples. You use these with the Base44 builder to create the employees in your own app." },
  { q: "Are these already installed or ready to run?", a: "You build and configure them using the included prompts. Each role needs your business context, supported integrations or imported data, and testing. The kit includes acceptance checks; it is not a hosted employee service or a one-click installer." },
  { q: "Can I start with one employee?", a: "Yes. Start with the shared foundation, then run the six build prompts for the role you need. Add other roles as your workflow grows. The Chief of Staff can consolidate reports from roles you have enabled." },
  { q: "How do the knowledge files work?", a: "Each role has its own knowledge.md for the Base44 builder to reference. The build prompts also explain how to store approved knowledge and provide it to the runtime agent through context tools. A file alone does not automatically become agent memory." },
  { q: "Will agents send messages or spend money automatically?", a: "The workflows start with drafts, review, and human approvals. Paid ads analysis is read-only, and web development produces proposals. External actions require configured integrations and the approval controls described in the kit." },
  { q: "Are Base44 and other service costs included?", a: "No. This one-time purchase covers the downloadable kit. Your Base44 plan, AI usage, and any external provider accounts or integrations are separate. Availability depends on your plan and current platform support." },
];

export default function KodeAiEmployees() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);
  useEffect(() => {
    let active = true;
    base44.entities.Product.filter({ slug, active: true }).then(items => {
      if (!active) return;
      const item = items[0] || null;
      setProduct(item);
      if (item) trackViewItem({ id: item.id, name: item.name, category: item.category, price: getProductSalePriceCents(item.priceCents, slug) / 100 });
    }).catch(() => { if (active) setError("We couldn't load this product. Please refresh and try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const regular = product?.priceCents ?? 25000;
  const cents = getProductSalePriceCents(regular, slug);
  const price = formatUsd(cents);
  const sale = isSummerSaleActive();
  const buy = async () => {
    if (!product || buying) return;
    setBuying(true); setError("");
    try {
      trackSelectItem({ id: product.id, name: product.name, category: product.category, price: cents / 100 });
      const checkout = `/checkout?product=${product.id}`;
      navigate(await base44.auth.isAuthenticated() ? checkout : `/login?next=${encodeURIComponent(checkout)}`);
    } catch { setError("We couldn't open checkout. Please try again."); }
    finally { setBuying(false); }
  };
  const cart = () => {
    if (!product) return;
    trackAddToCart({ id: product.id, name: product.name, category: product.category, price: cents / 100 });
    addItem(product.id); openCart();
  };
  const buyButton = <Button size="lg" onClick={buy} disabled={loading || buying || !product} className="h-auto py-4 px-6 whitespace-normal font-bold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90">
    {loading || buying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 shrink-0" />}
    {loading ? "Loading…" : `Get the full package — ${price}`}
  </Button>;
  return <div className="relative overflow-hidden">
    <Seo title="Kode AI Employees — Build Your AI Team in Base44 | KodeBase" description="Eight AI employee roles. 53 build prompts, eight knowledge files, and 60 routine prompts to build your team in Base44. One downloadable package." path="/products/kode-ai-employees" type="product" jsonLd={[faqSchema(faqs)]} />
    <div aria-hidden="true" className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
    <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10"><ArrowLeft className="w-4 h-4" />All products</Link>
      <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16 items-center pb-16">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Kode AI Employees</p>
          <h1 className="font-sora font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight mt-5 mb-6">Build your team.<br /><span className="text-gradient-orange">Inside Base44.</span></h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Give your AI employees a clear job, useful knowledge, and a repeatable workflow. Get the prompts to build eight business roles in your own Base44 app.</p>
          <div className="flex flex-wrap gap-2 mt-6">{["8 employee roles", "53 build prompts", "60 routines"].map(t => <span key={t} className="text-xs border border-border rounded-full px-3 py-2 bg-card">{t}</span>)}</div>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">{buyButton}<Button size="lg" variant="outline" className="h-auto py-4" onClick={cart} disabled={loading || !product}><ShoppingCart className="w-4 h-4 mr-2" />Add to cart</Button></div>
          {error && <p role="alert" className="text-red-400 text-sm mt-3">{error}</p>}
          {!loading && !product && !error && <p className="text-sm text-muted-foreground mt-3">This package is being prepared. Check back soon.</p>}
          <p className="text-xs text-muted-foreground flex gap-2 items-center mt-4"><Lock className="w-3.5 h-3.5" />Secure checkout via Square · One-time purchase</p>
        </div>
        <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 shadow-[0_0_80px_rgba(251,146,60,0.08)]">
          {sale && <div className="rounded-xl border border-primary/25 bg-primary/10 p-4 mb-6"><p className="font-bold text-primary text-sm">Will's Birthday special · 86% off</p><p className="text-xs text-muted-foreground mt-1">Ends {SUMMER_SALE_END_LABEL}</p></div>}
          <Bot className="w-9 h-9 text-primary mb-4" /><h2 className="font-sora font-bold text-xl mb-4">The complete employee package</h2>
          <div className="flex flex-wrap gap-3 items-baseline"><span className="font-sora font-extrabold text-5xl">{price}</span>{sale && <span className="line-through text-xl text-muted-foreground">{formatUsd(regular)}</span>}<span className="text-sm text-muted-foreground">one time</span></div>
          {sale && <p className="text-sm text-primary mt-2">Save {formatUsd(regular - cents)} with the Birthday special.</p>}
          <ul className="space-y-3 border-t border-border mt-6 pt-6">{included.map(t => <li key={t} className="flex gap-3 text-sm"><Check className="w-4 h-4 shrink-0 text-primary mt-0.5" />{t}</li>)}</ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-6">Downloadable build kit. Setup and testing required. Base44 and third-party usage costs are separate.</p>
        </div>
      </section>
      <section className="py-16 border-t border-border">
        <p className="text-primary text-xs uppercase tracking-widest font-bold mb-3">Meet the roles</p>
        <h2 className="font-sora font-bold text-3xl sm:text-4xl mb-4">One package. Eight areas of your business.</h2>
        <p className="text-muted-foreground max-w-2xl mb-9">Start with one role or build the whole team. Each comes with its own knowledge file, six build prompts, and a catalog of operating routines.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{roles.map(([name,desc,count],i) => <article key={name} className="rounded-2xl border border-border bg-card/80 p-6"><div className="flex items-center justify-between mb-6"><span className="font-mono text-primary text-sm">0{i+1}</span><span className="text-xs text-muted-foreground">{count}</span></div><h3 className="font-sora font-bold text-lg mb-3">{name}</h3><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></article>)}</div>
      </section>
      <section className="py-16 border-t border-border grid md:grid-cols-2 gap-10">
        <div><p className="text-primary text-xs uppercase tracking-widest font-bold mb-3">A build sequence you can follow</p><h2 className="font-sora font-bold text-3xl mb-5">From a blank prompt<br />to a defined workflow.</h2><p className="text-muted-foreground leading-relaxed">The shared prompts establish your Employee Center, knowledge, approvals, and run history. Then each role gets its own data, agent, workbench, integrations, routines, and acceptance checks.</p></div>
        <ol className="space-y-5">{[
          ["Open START-HERE", "Unzip the package, choose your first role, and collect your business context."],
          ["Build the foundation", "Run the shared prompts in order with the Base44 builder. Review each result before continuing."],
          ["Give your employee its knowledge", "Use its knowledge.md and six role prompts to build and configure the workflow."],
          ["Test, then expand", "Run the acceptance checks with sample data. Connect approved services and add roles when ready."]
        ].map(([title,desc],i)=><li key={title} className="flex gap-4"><span className="shrink-0 rounded-full bg-primary/10 text-primary w-9 h-9 flex items-center justify-center text-sm font-bold">{i+1}</span><div><h3 className="font-bold mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{desc}</p></div></li>)}</ol>
      </section>
      <section className="rounded-3xl border border-border bg-card p-7 sm:p-10 my-8"><h2 className="font-sora font-bold text-2xl mb-4">You set the context. You keep the decisions.</h2><p className="text-muted-foreground leading-relaxed max-w-3xl">The kit guides you through knowledge approval, human review, access control, and honest run status. It includes manual workflows when an integration or scheduler is unavailable, so you can start with your existing data and connect more later.</p></section>
      <section className="py-16 max-w-3xl mx-auto"><h2 className="font-sora font-bold text-3xl text-center mb-8">Before you build your team.</h2><ServiceFAQ faqs={faqs} /></section>
      <section className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-8 sm:p-14 text-center"><h2 className="font-sora font-bold text-3xl sm:text-4xl mb-4">Give every role a starting point.</h2><p className="text-muted-foreground mb-7">Get all eight roles in one downloadable package.</p>{buyButton}<p className="text-xs text-muted-foreground mt-4">Markdown guides + prompts + configuration examples</p><Link to="/products" className="inline-flex gap-2 items-center text-sm text-primary mt-6">Explore all products<ArrowRight className="w-4 h-4" /></Link></section>
    </div>
  </div>;
}
