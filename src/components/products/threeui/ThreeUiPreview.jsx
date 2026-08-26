import React from "react";
import { Boxes, Plus, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

// Lightweight visual mockups of each catalog element — enough to show what the
// prompt builds, rendered with pure Tailwind/CSS (no heavy 3D in a dialog).
const STAGE = "relative w-full h-56 rounded-xl overflow-hidden bg-[#0d1326] flex items-center justify-center";
const GRID =
  "absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:32px_32px]";

function Stage({ children }) {
  return (
    <div className={STAGE}>
      <div className={GRID} />
      <div className="relative">{children}</div>
    </div>
  );
}

const PREVIEWS = {
  "glass-depth-card": (
    <div
      className="w-56 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-2xl"
      style={{ transform: "perspective(900px) rotateY(-14deg) rotateX(8deg)" }}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <Boxes className="w-5 h-5 text-orange-300 mb-3" />
      <div className="h-2.5 w-24 rounded bg-white/60 mb-2" />
      <div className="h-2 w-40 rounded bg-white/20 mb-1.5" />
      <div className="h-2 w-32 rounded bg-white/15" />
    </div>
  ),
  "orbit-hero-object": (
    <div className="relative w-40 h-40">
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] blur-md opacity-70" />
      <div className="absolute inset-6 rounded-full border border-white/30" />
      <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_12s_linear_infinite]" />
      <div className="absolute left-1/2 top-0 w-2 h-2 -ml-1 rounded-full bg-amber-300 shadow-[0_0_12px_2px_rgba(250,204,21,0.7)]" />
    </div>
  ),
  "extruded-button": (
    <div className="relative">
      <div className="absolute inset-x-0 top-1 h-full rounded-xl bg-[#7f1d1d]" />
      <div className="relative rounded-xl px-7 py-3 font-semibold text-[#0a0f1e] bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] border-t border-white/40">
        Press me
      </div>
    </div>
  ),
  "depth-navbar": (
    <div className="relative w-72">
      <div className="absolute inset-x-4 top-3 h-10 rounded-full bg-black/60 blur-xl" />
      <div className="relative flex items-center gap-4 rounded-full border border-white/10 bg-white/10 backdrop-blur-xl px-5 py-2.5">
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-[#f87171] to-[#facc15]" />
        <span className="text-[11px] text-white/90 rounded-full bg-white/15 px-2.5 py-1">Home</span>
        <span className="text-[11px] text-white/50">Docs</span>
        <span className="text-[11px] text-white/50">Pricing</span>
      </div>
    </div>
  ),
  "tilt-product-shot": (
    <div className="relative">
      <div
        className="w-52 h-28 rounded-lg border border-white/15 bg-gradient-to-br from-slate-700 to-slate-900 shadow-[0_0_40px_-8px_rgba(248,113,113,0.6)]"
        style={{ transform: "perspective(1200px) rotateY(-18deg) rotateX(6deg)" }}
      />
      <div
        className="w-52 h-14 mt-1 rounded-lg bg-gradient-to-b from-slate-700/40 to-transparent blur-[2px] opacity-40"
        style={{ transform: "perspective(1200px) rotateY(-18deg) scaleY(-1)" }}
      />
    </div>
  ),
  "toggle-switch-3d": (
    <div className="flex items-center gap-4">
      <div className="w-14 h-8 rounded-full bg-gradient-to-r from-[#fb923c] to-[#facc15] shadow-inner flex items-center justify-end px-1">
        <div className="w-6 h-6 rounded-full bg-white border-t border-white/70 shadow-md" />
      </div>
      <div className="w-14 h-8 rounded-full bg-white/10 border border-white/10 shadow-inner flex items-center px-1">
        <div className="w-6 h-6 rounded-full bg-slate-300 shadow-lg" />
      </div>
    </div>
  ),
  "stacked-modal": (
    <div className="relative w-56">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[88%] h-20 rounded-2xl bg-white/5 border border-white/10" />
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[94%] h-20 rounded-2xl bg-white/10 border border-white/10" />
      <div className="relative rounded-2xl border border-white/15 bg-[#141b30] p-4 shadow-2xl">
        <div className="h-2.5 w-24 rounded bg-white/60 mb-2" />
        <div className="h-2 w-40 rounded bg-white/20 mb-4" />
        <div className="h-7 w-20 rounded-lg bg-gradient-to-r from-[#f87171] to-[#facc15]" />
      </div>
    </div>
  ),
  "gradient-mesh-backdrop": (
    <div className="relative w-64 h-36 rounded-xl overflow-hidden border border-white/10">
      <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-[#f87171] blur-2xl opacity-50" />
      <div className="absolute right-0 top-4 w-24 h-24 rounded-full bg-[#fb923c] blur-2xl opacity-50" />
      <div className="absolute left-16 bottom-0 w-28 h-28 rounded-full bg-[#facc15] blur-2xl opacity-40" />
    </div>
  ),
  "carousel-coverflow": (
    <div className="flex items-center gap-3">
      <ChevronLeft className="w-4 h-4 text-white/40" />
      <div className="w-16 h-24 rounded-lg bg-white/10 border border-white/10" style={{ transform: "perspective(800px) rotateY(35deg) scale(0.86)" }} />
      <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-[#fb923c] to-[#f87171] shadow-xl" />
      <div className="w-16 h-24 rounded-lg bg-white/10 border border-white/10" style={{ transform: "perspective(800px) rotateY(-35deg) scale(0.86)" }} />
      <ChevronRight className="w-4 h-4 text-white/40" />
    </div>
  ),
  "metric-tile-3d": (
    <div className="w-52 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] p-4 shadow-2xl">
      <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Revenue</div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white tabular-nums">$12,480</span>
        <span className="flex items-center gap-0.5 text-[10px] text-green-400"><TrendingUp className="w-3 h-3" />12%</span>
      </div>
      <svg viewBox="0 0 100 24" className="w-full h-8 mt-2">
        <path d="M0 20 L20 14 L40 17 L60 8 L80 11 L100 3 L100 24 L0 24 Z" fill="url(#g)" opacity="0.5" />
        <path d="M0 20 L20 14 L40 17 L60 8 L80 11 L100 3" fill="none" stroke="#fb923c" strokeWidth="1.5" />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  ),
  "pricing-column-3d": (
    <div className="flex items-end gap-3">
      <div className="w-20 h-28 rounded-xl border border-white/10 bg-white/5" />
      <div className="w-24 h-36 rounded-xl p-[1.5px] bg-gradient-to-b from-[#f87171] to-[#facc15] shadow-[0_0_30px_-6px_rgba(248,113,113,0.7)]">
        <div className="w-full h-full rounded-[10px] bg-[#141b30] flex items-center justify-center text-white font-bold">$25</div>
      </div>
      <div className="w-20 h-28 rounded-xl border border-white/10 bg-white/5" />
    </div>
  ),
  "floating-action-orb": (
    <div className="relative w-40 h-40">
      <div className="absolute right-2 top-2 w-8 h-8 rounded-full bg-white/10 border border-white/15" />
      <div className="absolute right-10 top-6 w-8 h-8 rounded-full bg-white/10 border border-white/15" />
      <div className="absolute right-2 bottom-2 w-14 h-14 rounded-full bg-[radial-gradient(circle_at_30%_25%,#facc15,#f87171)] shadow-[0_0_30px_-4px_rgba(251,146,60,0.8)] flex items-center justify-center">
        <Plus className="w-6 h-6 text-[#0a0f1e] rotate-45" />
      </div>
    </div>
  ),
};

export default function ThreeUiPreview({ elementId }) {
  return <Stage>{PREVIEWS[elementId] || <Boxes className="w-12 h-12 text-orange-300" />}</Stage>;
}