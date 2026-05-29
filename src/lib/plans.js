// Central plan configuration. Limits use -1 to mean unlimited.
export const PLANS = {
  free: {
    id: "free",
    name: "Solo",
    price: "$12.99",
    period: "/mo",
    desc: "Perfect for solo builders.",
    projectLimit: 1,
    blueprintLimit: 1,
    promptPack: "full",
    securityReview: true,
    qaChecklist: true,
    markdownExport: true,
    agencyExport: false,
    reusableTemplates: false,
    features: [
      "1 project",
      "1 blueprint",
      "Full prompt packs",
      "Security reviews",
      "QA checklists",
      "Markdown export",
      "Advanced project organization",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "/mo",
    desc: "For serious builders & founders.",
    projectLimit: 25,
    blueprintLimit: 25,
    promptPack: "full",
    securityReview: true,
    qaChecklist: true,
    markdownExport: true,
    agencyExport: false,
    reusableTemplates: false,
    features: [
      "25 projects",
      "25 blueprints / month",
      "Full prompt packs",
      "Security reviews",
      "QA checklists",
      "Markdown export",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: "$149",
    period: "/mo",
    desc: "For teams & client work.",
    projectLimit: -1,
    blueprintLimit: -1,
    promptPack: "full",
    securityReview: true,
    qaChecklist: true,
    markdownExport: true,
    agencyExport: true,
    reusableTemplates: true,
    features: [
      "Everything in Pro",
      "Unlimited projects",
      "Client-ready exports",
      "Reusable templates",
      "Advanced project organization",
    ],
  },
};

export const PLAN_ORDER = ["free", "pro", "agency"];

export function getPlan(planId) {
  return PLANS[planId] || PLANS.free;
}

export function isUnlimited(limit) {
  return limit === -1 || limit === null || limit === undefined;
}

// Returns blueprint usage status for a profile, accounting for monthly reset.
export function getBlueprintUsage(profile) {
  const plan = getPlan(profile?.plan);
  const limit = plan.blueprintLimit;
  let used = profile?.blueprintsUsed || 0;
  if (needsMonthlyReset(profile?.usagePeriodStart)) used = 0;
  return {
    used,
    limit,
    unlimited: isUnlimited(limit),
    reached: !isUnlimited(limit) && used >= limit,
    remaining: isUnlimited(limit) ? Infinity : Math.max(0, limit - used),
  };
}

export function needsMonthlyReset(periodStart) {
  if (!periodStart) return false;
  const start = new Date(periodStart);
  if (isNaN(start.getTime())) return false;
  const now = new Date();
  return (
    now.getUTCFullYear() > start.getUTCFullYear() ||
    (now.getUTCFullYear() === start.getUTCFullYear() && now.getUTCMonth() > start.getUTCMonth())
  );
}