import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Check, FileText, ScanSearch, Map, ShieldCheck, Download, ShoppingCart, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import Seo from "@/components/seo/Seo";
import ServiceFAQ from "@/components/services/ServiceFAQ";
import ServiceCheckoutButton from "@/components/services/ServiceCheckoutButton";
import { faqSchema } from "@/lib/seo";
import { useCart } from "@/components/cart/CartContext";
import { trackViewItem, trackSelectItem, trackAddToCart } from "@/lib/analytics";
import { isSummerSaleActive, getProductSalePriceCents, formatUsd, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";

const stages = [
  { icon: ScanSearch, title: "Scan your app", text: "Use the guided prompts with ChatGPT or Claude to understand your app's pages, data, authentication, backend functions, and integrations." },
  { icon: Map, title: "Map your migration", text: "Turn the findings into a practical migration plan: what moves, what needs replacing, and what to tackle first." },
  { icon: ShieldCheck, title: "Migrate and verify", text: "Work through the prompts in order, review the changes, and test your app before switching to your new setup." },
];
const faqs = [
  { q: "What do I receive?", a: "A downloadable document with instructions and an ordered series of prompts for scanning your Base44 app and working through its migration with ChatGPT or Claude." },
  { q: "Does this migrate my app automatically?", a: "This is a self-guided migration product. You use the document with ChatGPT or Claude, provide access to your app's code, review the proposed changes, and test the result." },
  { q: "Can I use ChatGPT or Claude?", a: "Yes. The workflow is designed for either assistant. Your chosen assistant needs access to the relevant app files or a connected coding environment; a public app URL alone does not expose its backend code." },
  { q: "Are hosting and AI subscriptions included?", a: "The purchase covers the migration document and prompts. Any AI subscription, hosting, database, domain, or other third-party service costs are separate." },
  { q: "Is this a recurring payment?", a: "No. Kode Migration is a one-time purchase. The Birthday special is applied automatically while the promotion is active." },
];

export default function KodeMigration() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    let active = true;
    base44.entities.Product.filter({ slug: "kode-migration", active: true }).then((items) => {
      if (!active) return;
      const item = items[0] || null;
      setProduct(item);
      if (item) trackViewItem({ id: item.id, name: item.name, category: item.category, price: getProductSalePriceCents(item.priceCents, item.slug) / 100 });
    }).catch(() => { if (active) setError("We couldn't load this product. Please refresh and try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const regularCents = product?.priceCents ?? 12500;
  const sale = isSummerSaleActive();
  const priceCents = getProductSalePriceCents(regularCents, "kode-migration");
  const price = formatUsd(priceCents);
  const buy = async () => {
    if (!product || buying) return;
    setBuying(true);
    setError("");
    try {
      trackSelectItem({ id: product.id, name: product.name, category: product.category, price: priceCents / 100 });
      const authenticated = await base44.auth.isAuthenticated();
      navigate(authenticated ? `/checkout?product=${product.id}` : "/register?next=/products/kode-migration");
    } catch {
      setError("We couldn't open checkout. Please try again.");
    } finally { setBuying(false); }
  };
  const cart = () => {
    if (!product) return;
    trackAddToCart({ id: product.id, name: product.name, category: product.category, price: priceCents / 100 });
    addItem(product.id);
    openCart();
  };

  const buyButton = (
    <Button size="lg" onClick={buy} disabled={!product || loading || buying}
      className="w-full sm:w-auto h-auto whitespace-normal py-4 px-7 font-bold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90">
      {loading || buying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2 shrink-0" />}
      {loading ? "Loading product…" : `Get Kode Migration — ${price}`}
    </Button>
  );

  return (
    <div className="relative overflow-hidden">
      <Seo title="Kode Migration — Migrate Your Base44 App | KodeBase"
        description="Take your Base44 app to its next home. Get the downloadable migration guide and ordered prompts for ChatGPT or Claude. One-time purchase."
        path="/products/kode-migration" type="product" jsonLd={[faqSchema(faqs)]} />
      <div aria-hidden="true" className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10">
          <ArrowLeft className="w-4 h-4" /> All products
        </Link>
        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center pb-16 sm:pb-24">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-[0.2em]">Kode Migration</span>
            <h1 className="font-sora font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight mt-5 mb-6">
              Your app.<br />Your next chapter.<br /><span className="text-gradient-orange">Beyond Base44.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              A clear path from the app you built to the platform you choose. Download the instructions and step-by-step prompts to scan your Base44 app with ChatGPT or Claude and work through your migration.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {["Works with ChatGPT", "Works with Claude", "One-time purchase"].map((label) => (
                <span key={label} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">{label}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {buyButton}
              <Button size="lg" variant="outline" onClick={cart} disabled={!product || loading} className="h-auto py-4">
                <ShoppingCart className="w-4 h-4 mr-2" /> Add to cart
              </Button>
            </div>
            {error && <p role="alert" className="text-sm text-red-400 mt-3">{error}</p>}
            {!loading && !product && !error && <p className="text-sm text-muted-foreground mt-3">This product is being prepared. Check back soon.</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-4"><Lock className="w-3.5 h-3.5" /> Secure checkout via Square</p>
          </div>
          <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-8 shadow-[0_0_80px_rgba(251,146,60,0.08)]">
            {sale && <div className="rounded-xl bg-primary/10 border border-primary/25 px-4 py-3 mb-7">
              <p className="text-primary font-bold text-sm">Will's Birthday special · 86% off</p>
              <p className="text-xs text-muted-foreground mt-1">Ends {SUMMER_SALE_END_LABEL}</p>
            </div>}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10"><FileText className="w-7 h-7 text-primary" /></div>
              <div><p className="font-sora font-bold text-xl">Kode Migration</p><p className="text-xs text-muted-foreground mt-1">THE GUIDE + THE PROMPTS</p></div>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-sora font-extrabold text-5xl">{price}</span>
              {sale && <span className="text-xl text-muted-foreground line-through">{formatUsd(regularCents)}</span>}
              <span className="text-sm text-muted-foreground">one time</span>
            </div>
            {sale && <p className="text-primary text-sm mt-2">Save {formatUsd(regularCents - priceCents)} with the Birthday special.</p>}
            <div className="h-px bg-border my-7" />
            <ul className="space-y-4">
              {["Downloadable migration document", "Instructions for ChatGPT or Claude", "Prompts to scan and understand your app", "A guided sequence for planning and migration"].map((text) => (
                <li key={text} className="flex gap-3 text-sm"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />{text}</li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground leading-relaxed mt-7">A self-guided workflow. You stay in control of your code, your migration decisions, and your final testing.</p>
          </div>
        </section>

        <section aria-labelledby="done-for-you-heading" className="rounded-3xl border border-primary/30 bg-card p-7 sm:p-10 mb-16">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Want us to handle it?</p>
              <h2 id="done-for-you-heading" className="font-sora font-bold text-2xl sm:text-3xl mb-4">Done for you Migration</h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">Let us migrate your Base44 app to infrastructure you control. We handle the backend, database, authentication, storage, integrations, and deployment, preserving your existing frontend wherever possible.</p>
              <p className="text-sm text-muted-foreground mt-4">After checkout, send your app details and add us as a collaborator to get started.</p>
              <Link to="/services/base44-migration" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4">See what's included <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="md:w-72 rounded-2xl border border-border bg-background/60 p-6">
              <p className="font-sora font-extrabold text-4xl mb-2">$199 <span className="font-normal font-inter text-sm text-muted-foreground">one time</span></p>
              <p className="text-xs text-muted-foreground mb-5">Fixed service price. The 86% Birthday discount does not apply.</p>
              <ServiceCheckoutButton serviceId="base44_migration" label="Get Done for you Migration — $199" redirectPath="/services/base44-migration/next" className="h-auto py-3 whitespace-normal" />
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16 sm:py-24">
          <div className="max-w-2xl mb-10">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">From questions to a plan</p>
            <h2 className="font-sora font-bold text-3xl sm:text-4xl tracking-tight mb-4">Know what needs to move.<br />Then take it one step at a time.</h2>
            <p className="text-muted-foreground leading-relaxed">Migration starts with understanding what your app depends on. Kode Migration gives your AI assistant a structured workflow, so you can make informed decisions before changing your app.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {stages.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-border bg-card/80 p-7">
                <div className="flex justify-between items-center mb-7"><Icon className="w-7 h-7 text-primary" /><span className="font-mono text-sm text-muted-foreground">0{i + 1}</span></div>
                <h3 className="font-sora font-bold text-xl mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border py-16 grid md:grid-cols-2 gap-10">
          <div><p className="text-xs text-primary font-bold uppercase tracking-widest mb-3">Built for app owners</p>
            <h2 className="font-sora font-bold text-3xl mb-4">Keep the work.<br />Choose what comes next.</h2>
            <p className="text-muted-foreground leading-relaxed">For Base44 builders who want to understand their app, explore a new setup, and guide their own migration with AI assistance.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-7">
            <h3 className="font-sora font-bold text-lg mb-4">What to have ready</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3"><ArrowRight className="w-4 h-4 shrink-0 text-primary mt-0.5" />Access to your Base44 app's source code and configuration.</li>
              <li className="flex gap-3"><ArrowRight className="w-4 h-4 shrink-0 text-primary mt-0.5" />ChatGPT or Claude, with the relevant files or coding tools available.</li>
              <li className="flex gap-3"><ArrowRight className="w-4 h-4 shrink-0 text-primary mt-0.5" />Time to review the plan, set up your destination, and test the migrated app.</li>
            </ul>
          </div>
        </section>

        <section className="border-t border-border py-16 max-w-3xl mx-auto">
          <h2 className="font-sora font-bold text-3xl text-center mb-9">Before you make the move.</h2>
          <ServiceFAQ faqs={faqs} />
        </section>
        <section className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-8 sm:p-14 text-center mb-8">
          <h2 className="font-sora font-bold text-3xl sm:text-4xl mb-4">Your next move starts here.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-7">Get the guide. Open ChatGPT or Claude. Start understanding what it takes to bring your app to its next home.</p>
          {buyButton}
          <p className="text-xs text-muted-foreground mt-4">Downloadable document · One-time purchase{sale ? " · Birthday special: 86% off" : ""}</p>
        </section>
      </div>
    </div>
  );
}
