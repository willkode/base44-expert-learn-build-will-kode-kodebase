export const KODEMAIL_PRODUCT_ID = "6aa0381df8463d7623eed1d9";
export const KODEMAIL_PRICE = 8.96; // 86% off Birthday Sale price
export const KODEMAIL_LIST_PRICE = 64;
export const KODEMAIL_OG_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a56ad78ac_generated_image.png";
export const KODEMAIL_HERO_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0637cd36f_generated_image.png";

const IMG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/";

export const inboxFeatures = [
  { label: "Send and receive from your own domain, so you stop emailing clients from a Gmail address", image: `${IMG}0925ec4da_generated_image.png` },
  { label: "Spin up hello@, billing@, support@ — as many addresses as you want, with no per-user fee", image: `${IMG}a22d9d5aa_generated_image.png` },
  { label: "Inbox, Sent, Drafts, Archive — familiar folders, so nothing feels like a downgrade", image: `${IMG}d4ec79962_generated_image.png` },
  { label: "Compose, reply, reply all and forward — the full daily workflow, not a stripped-down demo", image: `${IMG}3d5e23b13_generated_image.png` },
  { label: "Find any message, contact or attachment in seconds instead of scrolling", image: `${IMG}7ab84eb0c_generated_image.png` },
  { label: "Drafts save themselves, so a closed tab never costs you a written reply", image: `${IMG}2e904f8cb_generated_image.png` },
  { label: "Run every brand and mailbox you own from one inbox instead of juggling logins", image: `${IMG}187f4ff47_generated_image.png` },
  { label: "See delivered, bounced and failed status, so you know when a client never got your email", image: `${IMG}e1bbc9157_generated_image.png` },
  { label: "Answer from your laptop or your phone — your inbox goes where you go", image: `${IMG}6e31198c2_generated_image.png` },
  { label: "An AI assistant that sets up addresses and fixes broken email settings for you", image: `${IMG}7ee45515d_generated_image.png` },
];

export const setupSteps = [
  { num: "01", title: "Buy once, get instant access", desc: "The full prompt series lands in your account immediately — already ordered, already tested, nothing for you to figure out." },
  { num: "02", title: "Paste the prompts in order", desc: "Each prompt builds the next piece of your inbox. No coding, no architecture decisions, no dead ends." },
  { num: "03", title: "Point your domain with the guide", desc: "Follow the Cloudflare steps exactly as written and your domain's mail starts flowing into the inbox you just built." },
  { num: "04", title: "Email clients like a real company", desc: "Send from hello@yourbusiness.com from an inbox you own — and never pay a mailbox subscription again." },
];

export const securityPoints = [
  "Your mail lives in your system, not on someone else's server",
  "Cloudflare setup uses scoped API access — you never hand over your account password",
  "Every DNS change is explained before you make it, so you're never guessing",
  "A pre-switch checklist so you don't break email that's already working",
  "Access-control instructions included, so only the right people can read your inbox",
];

export const builtFor = [
  "Entrepreneurs",
  "Agencies",
  "Freelancers",
  "Startups",
  "Creators",
  "Small businesses",
];

export const faqs = [
  {
    q: "What exactly do I get for my money?",
    a: "The complete, ordered prompt series that builds a working inbox system for your own domain — plus the exact Cloudflare steps to route your business email into it. Everything you need to go from no email system to sending from your domain.",
  },
  {
    q: "Is KodeMail a hosted email service?",
    a: "No — and that's the point. Hosted services rent you a mailbox forever. KodeMail hands you the blueprint: the prompts build the inbox, you own and host it, and there's nothing left to subscribe to.",
  },
  {
    q: "Do I need to be a developer?",
    a: "No. You paste the prompts into your AI builder in the order given and follow the Cloudflare steps. If you can copy and paste, you can finish this.",
  },
  {
    q: "What do I need before I start?",
    a: "An AI app builder (Base44 works great), a Cloudflare account, and a domain you manage there. That's it.",
  },
  {
    q: "Do I have to edit DNS records myself?",
    a: "You make the changes in Cloudflare, but the guide walks you through every record and explains what it does — so you're never guessing at mail-server settings or hoping it works.",
  },
  {
    q: "Can I create more than one address?",
    a: "As many as you want. hello@, billing@, support@, addresses across multiple domains — all from one inbox, and not one of them adds to your bill.",
  },
  {
    q: "What if I already use another email provider?",
    a: "The guide includes a pre-switch checklist so you can build and test without breaking the email already reaching your current provider. You only cut over when you're ready.",
  },
  {
    q: "Is this a subscription?",
    a: `No. One payment of $${KODEMAIL_PRICE} for lifetime access to the prompts and instructions — no monthly bill, no per-user fees, no renewal email a year from now.`,
  },
  {
    q: "How is this different from Google Workspace or Microsoft 365?",
    a: "They charge you every month, per person, forever — and you own nothing. KodeMail is a one-time payment for the prompts to build your own inbox on your own domain, where extra addresses cost you nothing.",
  },
];