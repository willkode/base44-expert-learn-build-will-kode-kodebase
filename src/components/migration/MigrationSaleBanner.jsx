import { BadgePercent } from "lucide-react";

export default function MigrationSaleBanner() {
  return (
    <div className="rounded-2xl border border-primary/40 bg-gradient-to-r from-[#f87171]/15 via-[#fb923c]/10 to-[#facc15]/10 p-4 md:p-5 flex items-center gap-4 glow-orange">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#f87171] to-[#fb923c] flex items-center justify-center">
        <BadgePercent className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-sora font-bold text-sm md:text-base">
          Limited time: <span className="text-gradient-orange">50% off migration quotes & the report unlock</span>
        </p>
        <p className="text-xs md:text-sm text-muted-foreground">
          Unlock your full migration plan for $12.50 (reg. $25) and every quote is automatically discounted by half — no code needed.
        </p>
      </div>
    </div>
  );
}