import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, Database, KeyRound, Layers, LockKeyhole, Server, ShieldCheck, SlidersHorizontal } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { faqSchema } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import MigrationCheckout from "@/components/services/migration/MigrationCheckout";
import useMigrationPrice from "@/components/services/migration/useMigrationPrice";
import MigrationSpotCounter from "@/components/services/migration/MigrationSpotCounter";
import { includedSections } from "@/components/services/migration/migrationData";

const pains = [
  { icon: LockKeyhole, pain: "Your app works. But you feel locked in.", benefit: "Choose where your app lives.", detail: "Move to infrastructure you control, with your own hosting, database, and deployment setup." },
  { icon: SlidersHorizontal, pain: "Your next feature needs more control.", benefit: "Build beyond platform boundaries.", detail: "Work directly with your backend and integrations, so your next decision starts with what your business needs." },
  { icon: Layers, pain: "Starting over feels like wasted work.", benefit: "Keep the product you already built.", detail: "Preserve your existing frontend wherever possible while we move the systems that power it." },
];
const outcomes = [
  ["Your data, in your hands", "An independent database and a plan for moving your existing records and users.", Database],
  ["Your business logic, under your control", "Backend functions, payments, integrations, and automations connected to your new stack.", Server],
  ["Your next move, on your terms", "Deployment on your hosting, source code, and handover documentation for continued development.", KeyRound],
];
const steps = [
  ["Share your app", "After checkout, send your app details and add us as a collaborator. Tell us which workflows matter most."],
  ["We handle the migration", "We review dependencies, set up the destination, and move your backend, data, and integrations."],
  ["Test, launch, take control", "We test the key workflows, deploy to your infrastructure, and hand over the code and documentation."],
];

export default function Base44Migration() {
  const { price, saleActive } = useMigrationPrice();
  useEffect(() => { trackEvent("page_view", { page: "base44_migration_service" }); }, []);
  const trackCTA = (cta) => trackEvent("service_cta_click", { service: "base44_migration", cta });
  const faqs = [
    { q: "What does the one-time price cover?", a: `The migration service is $${price} one time. It covers moving your app's backend, database, authentication, storage, integrations, and deployment to infrastructure you control, with your existing frontend preserved wherever possible. Hosting, domains, and third-party provider charges are separate. Mobile conversion is excluded.` },
    { q: "Will I have to rebuild my app from scratch?", a: "In many cases, your existing React frontend can stay. We replace the services behind it. Platform-specific screens or features missing from the exported code may need changes, which we identify during the review." },
    { q: "What happens to my users and data?", a: "We review your export options and target system before moving your data. Existing records and users can usually be migrated when the necessary data is available. Passwords may need a reset or a separate transition because authentication systems do not always support transferring password hashes." },
    { q: "Do I need to know which hosting or database to use?", a: "No. Share your requirements and any preferred providers. We help identify a suitable destination, such as Supabase or a custom Node and PostgreSQL setup. The infrastructure accounts remain under your control." },
    { q: "Is an iOS or Android app included?", a: "No. Mobile app conversion is a separate $99 add-on. It creates an installable mobile wrapper around your web app, not a fully native app." },
    { q: "How long does migration take?", a: "Timing depends on your app's dependencies, data, and integrations. We review those after you share access and confirm the migration scope and timeline. No fixed turnaround is promised before that review." },
    { q: "Can I ask a question before purchasing?", a: "Yes. Use the contact link in the pricing section to share your app URL and migration questions before you order." },
    { q: "How does the first-10 special work?", a: "The first 10 customers get $149 off: migration for $50 instead of $199. One discounted migration per customer. A spot is held for up to 30 minutes while you check out and is marked purchased when payment completes. Unpaid spots return after their payment links are canceled. The counter shows purchases and checkout holds separately. Once all 10 are purchased, standard $199 pricing returns. Mobile conversion remains an optional $99 add-on." },
  ];
  const ctaClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#fb923c] px-6 py-3 text-sm font-bold text-[#111827] transition-colors hover:bg-[#fdba74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300";

  return (
    <div className="pb-12">
      <Seo title="Base44 Migration — Keep Your App. Take Control. | KodeBase"
        description={`Move your Base44 app to infrastructure you own. Done-for-you migration for $${price} one time. Keep your frontend wherever possible. Mobile excluded.`}
        path="/services/base44-migration" jsonLd={[faqSchema(faqs)]} />

      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="absolute inset-0 blueprint-grid opacity-40" />
        <div aria-hidden="true" className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-20">
          <div className="mb-8 rounded-xl border border-orange-300/30 bg-orange-300/10 px-5 py-4 text-sm">
            {saleActive && <p className="mb-4 text-lg font-bold text-orange-200">First 10 customers: $149 off · Migration for $50</p>}
            <MigrationSpotCounter />
            <p className="mt-3 text-xs text-slate-300">One-time fee · Mobile excluded</p>
          </div>
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Done-for-you Base44 migration</p>
              <h1 className="font-sora text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">You built the app.<br /><span className="text-gradient-orange">Now take control.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Ready to move beyond Base44? We migrate your app to infrastructure you own—so you can choose your hosting, control your backend, and keep building on your terms.</p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Keep your existing frontend wherever possible. Let us handle the backend, data, integrations, and deployment.</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a className={ctaClass} href="#checkout" onClick={() => trackCTA("hero_checkout")}>Start My Migration — ${price} <ArrowRight className="h-4 w-4" /></a>
                <a href="#how-it-works" className="rounded text-sm font-semibold text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white">See how it works</a>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">One-time service fee · Mobile excluded · No account required to order</p>
            </div>
            <div className="relative rounded-3xl border border-orange-300/25 bg-card p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your next chapter</p>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">You own the stack</span>
              </div>
              <div className="py-6">
                <div className="mb-3 flex items-center gap-3"><div className="rounded-xl border border-border bg-background p-3"><Layers className="h-6 w-6 text-orange-300" /></div><div><p className="font-sora text-lg font-bold">The app you've already built</p><p className="text-xs text-muted-foreground">Your screens. Your workflows. Your brand.</p></div></div>
                <div className="ml-6 h-8 border-l border-dashed border-orange-300/50" />
                <div className="rounded-2xl border border-orange-300/30 bg-orange-300/5 p-5">
                  <p className="mb-4 font-semibold">A foundation you control</p>
                  <div className="grid grid-cols-2 gap-3">{["Your database", "Your backend", "Your hosting", "Your source code"].map((item) => <div key={item} className="flex items-center gap-2 text-sm text-slate-300"><Check className="h-4 w-4 shrink-0 text-orange-300" />{item}</div>)}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
                <div><p className="text-xs text-muted-foreground">Done-for-you migration</p><p className="mt-1 font-sora text-4xl font-bold">${price} {saleActive && <span className="text-lg font-normal text-muted-foreground line-through">$199</span>}</p></div>
                <p className="text-right text-xs leading-relaxed text-muted-foreground">One-time fee<br />Mobile excluded</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-4 border-b border-border px-5 py-7 text-sm text-slate-300 sm:grid-cols-3 sm:px-6">
        {["Preserve your frontend where possible", "Move the systems behind your app", "Get code, deployment, and handover"].map((text) => <p key={text} className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-orange-300" />{text}</p>)}
      </div>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Sound familiar?</p>
        <h2 className="mt-3 max-w-2xl font-sora text-3xl font-bold tracking-tight sm:text-4xl">Your app is moving forward.<br />You want more room to build.</h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {pains.map(({ icon: Icon, pain, benefit, detail }) => <article key={pain} className="rounded-2xl border border-border bg-card/60 p-6 sm:p-7">
            <Icon className="mb-6 h-6 w-6 text-orange-300" />
            <p className="min-h-12 text-sm leading-relaxed text-muted-foreground">{pain}</p>
            <h3 className="mb-3 mt-5 font-sora text-xl font-semibold">{benefit}</h3>
            <p className="text-sm leading-relaxed text-slate-300">{detail}</p>
          </article>)}
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div><p className="text-xs font-bold uppercase tracking-widest text-orange-300">What you walk away with</p><h2 className="mt-3 font-sora text-3xl font-bold tracking-tight sm:text-4xl">More ownership.<br />More options.</h2><p className="mt-5 text-sm leading-relaxed text-muted-foreground">A migration should give you a working foundation for what comes next, with the access and documentation to keep building.</p><a href="#checkout" onClick={() => trackCTA("benefits_checkout")} className="mt-6 inline-flex items-center gap-2 rounded text-sm font-bold text-orange-300">Make your next move <ArrowRight className="h-4 w-4" /></a></div>
          <div className="space-y-7">{outcomes.map(([title, text, Icon]) => <div key={title} className="flex gap-4"><div className="h-fit rounded-xl bg-orange-300/10 p-3"><Icon className="h-5 w-5 text-orange-300" /></div><div><h3 className="font-sora text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p></div></div>)}</div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-16 sm:px-6 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-300">A clear path from here</p>
        <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight sm:text-4xl">You bring the app. We handle the move.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map(([title, text], i) => <div key={title} className="border-t border-orange-300/30 pt-5"><span className="font-mono text-sm text-orange-300">0{i + 1}</span><h3 className="mb-3 mt-4 font-sora text-xl font-semibold">{title}</h3><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</div>
      </section>

      <section id="pricing" className="scroll-mt-32 border-y border-orange-300/20 bg-gradient-to-br from-orange-300/5 to-card/40">
        <div className="mx-auto grid max-w-6xl scroll-mt-32 items-start gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div><p className="text-xs font-bold uppercase tracking-widest text-orange-300">Ready when you are</p><h2 className="mt-3 font-sora text-3xl font-bold tracking-tight sm:text-4xl">Take the next step.<br />Keep what you've built.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">Get your migration underway for a one-time ${price} fee.</p>
            <ul className="mt-7 space-y-4">{["Backend, database, authentication, and storage", "Integrations and core workflows", "Deployment to infrastructure you control", "Source code and handover documentation"].map((text) => <li key={text} className="flex gap-3 text-sm"><Check className="h-5 w-5 shrink-0 text-orange-300" />{text}</li>)}</ul>
            <div className="mt-8 rounded-xl border border-border bg-background/50 p-5"><p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-5 w-5 text-orange-300" />Know what happens next</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">After payment, you'll share your app details and collaborator access. We review the app and confirm the scope and timeline before the migration work begins.</p></div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">Hosting, domains, and third-party service costs are separate. Mobile conversion is optional and costs an additional $99.</p>
            <p className="mt-5 text-sm text-slate-300">Have questions first? <Link to="/contact" className="rounded font-semibold text-orange-300 underline underline-offset-4">Let's talk about your app</Link>.</p>
          </div>
          <div id="checkout" className="min-w-0 scroll-mt-32"><MigrationCheckout /></div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-orange-300">For a closer look</p>
        <h2 className="mb-3 mt-3 font-sora text-2xl font-bold sm:text-3xl">The details behind the move.</h2>
        <p className="mb-7 text-sm leading-relaxed text-muted-foreground">We review each system your app uses and agree on the migration scope. Expand a category to see what that can involve.</p>
        <div className="divide-y divide-border border-y border-border">{includedSections.map((item) => <details key={item.title} className="group py-1"><summary className="cursor-pointer rounded py-4 pr-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">{item.title}</summary><div className="pb-5 pl-4"><p className="mb-4 text-sm leading-relaxed text-muted-foreground">{item.intro}</p><ul className="grid gap-2 sm:grid-cols-2">{item.items.map((text) => <li key={text} className="flex gap-2 text-xs leading-relaxed text-slate-300"><Check className="h-3.5 w-3.5 shrink-0 text-orange-300" />{text}</li>)}</ul></div></details>)}</div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-6">
        <h2 className="mb-7 font-sora text-3xl font-bold tracking-tight">Before you make the move.</h2>
        <div className="space-y-3">{faqs.map(({ q, a }) => <details key={q} className="rounded-xl border border-border bg-card/50 p-5"><summary className="cursor-pointer rounded pr-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300">{q}</summary><p className="mt-4 text-sm leading-relaxed text-slate-300">{a}</p></details>)}</div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="rounded-3xl border border-orange-300/25 bg-card px-6 py-12 text-center sm:px-12">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-300">Built by you. Owned by you.</p>
          <h2 className="mx-auto mb-5 mt-4 max-w-2xl font-sora text-3xl font-bold tracking-tight sm:text-4xl">Give your app room for what's next.</h2>
          <p className="mx-auto mb-7 max-w-xl text-sm leading-relaxed text-muted-foreground">Keep the work you've put in. Move to a foundation you control. We'll help you get there.</p>
          <a className={ctaClass} href="#checkout" onClick={() => trackCTA("final_checkout")}>Start My Migration — ${price} <ArrowRight className="h-4 w-4" /></a>
          <p className="mt-4 text-xs text-muted-foreground">One-time fee · Mobile excluded</p>
        </div>
      </section>
    </div>
  );
}
