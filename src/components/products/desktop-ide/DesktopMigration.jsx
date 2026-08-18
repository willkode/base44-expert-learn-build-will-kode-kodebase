import React from "react";
import DesktopSection from "@/components/products/desktop-ide/DesktopSection";
import DesktopShot from "@/components/products/desktop-ide/DesktopShot";
import { SHOTS, MIGRATION_STEPS } from "@/components/products/desktop-ide/desktopIdeData";

export default function DesktopMigration() {
  return (
    <DesktopSection eyebrow="Migration" headline="Take the frontend, keep the backend" className="bg-card/30">
      <DesktopShot
        src={SHOTS.migrate}
        alt="The optional Migrate tab showing the plan, extract, rewrite, review and apply steps"
        caption="The Migrate tab: five steps, a deploy target, an output folder — and nothing written until you approve the diff."
      />
      <div className="max-w-3xl mx-auto space-y-5 mt-12">
        <p className="text-muted-foreground">
          This is the part most people are nervous about, so it is worth being precise. Migration downloads your app's
          code as an export. It does not eject, detach, fork or delete anything. Your app remains in Base44, fully
          editable, and the exported copy is wired to talk to that same live backend — the same database, the same
          users, the same functions.
        </p>
        <p className="text-muted-foreground">
          You keep building in Base44 and pull the changes down when you want them. The export is a real git repository
          with stable commit hashes, so updates merge rather than overwrite, and your own edits survive.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {MIGRATION_STEPS.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card/60 p-6">
            <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-sora font-semibold text-base mt-2 mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="max-w-3xl mx-auto space-y-5 mt-10">
        <p className="text-muted-foreground">
          Nothing is written until you approve the diff, and everything can be rolled back afterwards. Hardcoded app
          IDs and backend URLs are replaced with environment variables, so the same build can target different backends
          without editing code.
        </p>
        <p className="text-sm text-muted-foreground rounded-2xl border border-primary/40 bg-card p-6">
          <span className="text-foreground font-semibold">The detail that breaks most hand-rolled exports:</span>{" "}
          Base44's SDK builds its sign-in URL from a setting most apps never pass. Left empty, the login link becomes
          relative — harmless while Base44 serves the page, and an infinite redirect loop the moment anything else does.
          The migration sets it explicitly, so sign-in still goes to Base44 from your host.
        </p>
      </div>
    </DesktopSection>
  );
}