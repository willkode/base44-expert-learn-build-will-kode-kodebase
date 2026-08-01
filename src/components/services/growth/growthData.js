export const IMG = {
  og: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a72817b77_generated_image.png",
  icp: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/b72d9a58a_generated_image.png",
  pricing: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/c9796b347_generated_image.png",
  funnel: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/de7c58a8b_generated_image.png",
  analytics: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/52ae7cbbf_generated_image.png",
  channels: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0e6f66b18_generated_image.png",
  seo: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/207acd6b1_generated_image.png",
  roadmap: "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/bebd9b812_generated_image.png",
};

export const businessQuestions = [
  "Who should actually buy your app?",
  "What should you charge?",
  "How should you position it?",
  "What should your landing page say?",
  "Where do you find your first customers?",
  "Should you run ads or focus on SEO?",
  "What should your free trial look like?",
  "How do you convert free users into paying customers?",
  "Why are users signing up but not paying?",
  "How much can you spend acquiring a customer?",
  "How do you turn traction into predictable growth?",
];

export const pillars = [
  {
    title: "Product Positioning",
    image: IMG.roadmap,
    desc: "We define exactly what your product does, who it's for, what problem it solves, and why someone should choose it instead of doing nothing or using a competitor.",
    items: ["Value proposition", "Category & framing", "Competitive differentiation", "Messaging hierarchy"],
  },
  {
    title: "Target Customer & ICP",
    image: IMG.icp,
    desc: "Stop trying to market to everyone. We identify your ideal customer profile, use cases, pain points, and buying triggers.",
    items: ["Ideal customer profile", "Primary use cases", "Pain points", "Buying triggers", "Highest-intent segments"],
  },
  {
    title: "Pricing & Monetization",
    image: IMG.pricing,
    desc: "The objective isn't simply getting users. It's building profitable users.",
    items: ["Free vs. paid", "Free trials & freemium", "Subscription pricing", "Usage-based pricing", "One-time purchases", "Tier structure", "Feature gating", "Annual plans", "Upsells", "Lifetime value"],
  },
  {
    title: "Landing Page & Conversion",
    image: IMG.funnel,
    desc: "We make sure your site clearly answers: What is this? Why do I need it? Why should I trust you? What do I do next?",
    items: ["Headlines", "Value proposition", "Calls to action", "Pricing page", "Signup flow", "Social proof", "Feature presentation", "Mobile experience", "Conversion funnel"],
  },
  {
    title: "Go-To-Market Strategy",
    image: IMG.channels,
    desc: "You don't need to market everywhere. You need the few channels most likely to produce customers.",
    items: ["Direct outreach", "Communities & Reddit", "LinkedIn", "Partnerships", "Influencers", "Cold email", "Content marketing", "Affiliate & referral programs"],
  },
  {
    title: "SEO & Organic Growth",
    image: IMG.seo,
    desc: "If search makes sense for your product, we build a strategy around the terms your customers are already searching for.",
    items: ["Keyword research", "Competitor analysis", "Programmatic SEO", "Landing pages", "Content strategy", "Technical SEO", "Backlink strategy", "Search intent"],
  },
  {
    title: "Paid Customer Acquisition",
    image: IMG.pricing,
    desc: "When paid advertising makes sense, we determine exactly how to spend it profitably.",
    items: ["Platform selection", "Target audiences", "Campaign structure", "Ad messaging", "Retargeting", "Conversion tracking", "CAC targets", "ROAS targets"],
  },
  {
    title: "Analytics & Growth Metrics",
    image: IMG.analytics,
    desc: "Visitors → Signups → Activated Users → Paid Customers → Retained Customers. Without measurement, you're guessing.",
    items: ["CAC", "LTV", "MRR & ARR", "Churn", "Activation rate", "Trial-to-paid", "Signup conversion", "Retention", "ROAS"],
  },
];

export const steps = [
  { num: "01", title: "Application Review", desc: "I review your app, landing page, pricing, target audience, competition, signup process, existing marketing, and analytics.", image: IMG.icp },
  { num: "02", title: "Growth Strategy Session", desc: "We meet and determine what's working, what's missing, and what's preventing the app from growing.", image: IMG.funnel },
  { num: "03", title: "Growth Roadmap", desc: "A prioritized plan covering positioning → pricing → launch → acquisition → conversion → retention → scale. You leave knowing what to do first, second, and third.", image: IMG.roadmap },
  { num: "04", title: "Ongoing Growth Consulting", desc: "Optional: I work alongside you as your growth advisor while you implement — reviewing results, testing approaches, and improving the funnel.", image: IMG.analytics },
];

export const proofStats = [
  { value: "22+ Years", label: "Digital marketing experience" },
  { value: "$92M+", label: "Inbound lead value generated" },
  { value: "500+", label: "Keywords ranked top 3" },
  { value: "720%", label: "Increase in new business for one campaign" },
];

export const idealFor = [
  "You've built a Base44 app but don't know how to launch it",
  "You've launched but aren't getting customers",
  "You're getting traffic but not registrations",
  "You're getting registrations but nobody is paying",
  "You don't know what to charge",
  "You're unsure who your real target market is",
  "You're spending on marketing without knowing what works",
  "You want to turn a side project into a real SaaS business",
  "You've built something impressive but don't know how to sell it",
];

export const packages = [
  {
    name: "Base44 Growth Session",
    price: "$250",
    tagline: "For founders who need direction.",
    features: [
      "Pre-call review of your app",
      "90-minute strategy session",
      "Positioning & pricing guidance",
      "Marketing & monetization direction",
      "Clear immediate next steps",
    ],
  },
  {
    name: "Base44 Growth Blueprint",
    price: "$750",
    tagline: "For founders preparing to launch or struggling to gain traction.",
    popular: true,
    features: [
      "Full app & business review",
      "Competitor review",
      "ICP development",
      "Positioning strategy",
      "Pricing review",
      "Landing page / CRO review",
      "Customer acquisition strategy",
      "Launch strategy",
      "Growth KPI recommendations",
      "Written prioritized Growth Roadmap",
      "60-minute strategy walkthrough",
    ],
  },
  {
    name: "Fractional Growth Advisor",
    price: "From $1,500/mo",
    tagline: "For founders who want ongoing help growing their product.",
    features: [
      "Regular strategy calls",
      "Funnel analysis",
      "Campaign reviews",
      "Pricing experimentation",
      "SEO & advertising strategy",
      "Conversion optimization",
      "Analytics reviews & growth experiments",
      "Launch planning",
      "Product / marketing alignment",
    ],
  },
];

export const faqs = [
  { q: "Is this marketing consulting or Base44 help?", a: "Both. We look at your actual Base44 application alongside your target customer, competition, business model, and stage of growth — then build a practical strategy for taking it to market." },
  { q: "Do you implement the marketing for me?", a: "The Growth Session and Growth Blueprint are strategy engagements — you get a prioritized plan you can execute. If you want ongoing hands-on guidance while you implement, the Fractional Growth Advisor engagement covers that." },
  { q: "What if my app isn't launched yet?", a: "That's often the best time. We set positioning, pricing, and your launch plan before you spend money or momentum on the wrong audience." },
  { q: "How is this different from hiring a marketing agency?", a: "Most marketing consultants don't understand software development, and most developers don't understand marketing. I work across both, so the strategy accounts for how your product actually works — not just ad copy." },
  { q: "Which package should I start with?", a: "If you need direction fast, start with the $250 Growth Session. If you're launching or stuck without traction, the $750 Growth Blueprint gives you the full review plus a written roadmap." },
  { q: "Do you help with pricing my app?", a: "Yes. Pricing and monetization is one of the core pillars — free vs. paid, trials, freemium, subscription and usage-based models, tiers, feature gating, annual plans, and upsells." },
  { q: "Can you help with SEO and paid ads?", a: "Yes, when they make sense for your product. That includes keyword research, programmatic SEO, content strategy, technical SEO, plus platform selection, campaign structure, retargeting, CAC and ROAS targets for paid." },
  { q: "What do you need from me to start?", a: "Access to your app or a walkthrough, your landing page, current pricing, and whatever analytics you have. Everything else comes out of the strategy session." },
];