export const KODEMAIL_PRODUCT_ID = "6aa0381df8463d7623eed1d9";
export const KODEMAIL_PRICE = 8.96; // 86% off Birthday Sale price
export const KODEMAIL_LIST_PRICE = 64;
export const KODEMAIL_OG_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/a56ad78ac_generated_image.png";
export const KODEMAIL_HERO_IMAGE =
  "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/0637cd36f_generated_image.png";

const IMG = "https://media.base44.com/images/public/6a1905a0bc76553d6c934574/";

export const inboxFeatures = [
  { label: "Send and receive email from your custom domain", image: `${IMG}0925ec4da_generated_image.png` },
  { label: "Create multiple professional email addresses", image: `${IMG}a22d9d5aa_generated_image.png` },
  { label: "Organize conversations into familiar inbox folders", image: `${IMG}d4ec79962_generated_image.png` },
  { label: "Compose, reply, reply all, and forward", image: `${IMG}3d5e23b13_generated_image.png` },
  { label: "Search messages, contacts, and attachments", image: `${IMG}7ab84eb0c_generated_image.png` },
  { label: "Save drafts automatically", image: `${IMG}2e904f8cb_generated_image.png` },
  { label: "Manage multiple domains and mailboxes", image: `${IMG}187f4ff47_generated_image.png` },
  { label: "Track delivery, bounce, and sending status", image: `${IMG}e1bbc9157_generated_image.png` },
  { label: "Access your inbox from desktop or mobile", image: `${IMG}6e31198c2_generated_image.png` },
  { label: "An AI assistant that helps configure and repair email settings", image: `${IMG}7ee45515d_generated_image.png` },
];

export const setupSteps = [
  { num: "01", title: "Get the prompt pack", desc: "Instant access to the full series of expertly crafted prompts, ordered exactly the way they should be run." },
  { num: "02", title: "Paste the prompts in order", desc: "Run them one by one in your AI builder — each prompt builds the next piece of your inbox system." },
  { num: "03", title: "Follow the Cloudflare guide", desc: "Step-by-step instructions to route email from your domain into the system you just built." },
  { num: "04", title: "Start sending and receiving", desc: "Email hello@yourbusiness.com from an inbox you own and control." },
];

export const securityPoints = [
  "You build and host the inbox yourself — nobody else stores your mail",
  "The Cloudflare guide uses scoped API access, never your account password",
  "Every DNS change is explained before you make it",
  "Includes what to check before replacing an existing email provider",
  "Prompts include security and access-control instructions for your inbox",
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
    q: "What exactly do I get?",
    a: "A complete, ordered series of expertly crafted prompts that build a full inbox system for hosting and managing your email — plus step-by-step instructions for configuring Cloudflare to route your domain's email into it.",
  },
  {
    q: "Is KodeMail a hosted email service?",
    a: "No. KodeMail is the blueprint: the prompts build the inbox system, and you own and host it. That's why there's nothing to subscribe to.",
  },
  {
    q: "Do I need to be a developer?",
    a: "No. You paste the prompts into your AI builder in the order provided and follow the Cloudflare instructions. Everything is written in plain steps.",
  },
  {
    q: "What do I need before I start?",
    a: "An AI app builder (Base44 works great), a Cloudflare account, and a domain you manage there.",
  },
  {
    q: "Do I have to edit DNS records myself?",
    a: "You make the Cloudflare changes, but the guide walks you through each one and explains exactly what it does — no guesswork about mail-server settings.",
  },
  {
    q: "Can I create more than one address?",
    a: "Yes. The system you build supports multiple professional addresses across multiple domains, all managed from one inbox.",
  },
  {
    q: "What happens if I already use another email provider?",
    a: "The guide covers what to check before you switch, so you don't accidentally break email that's already flowing to another provider.",
  },
  {
    q: "Is this a subscription?",
    a: `No. KodeMail is a one-time $${KODEMAIL_PRICE} payment for lifetime access to the prompts and instructions — no monthly bill, no per-user fees.`,
  },
  {
    q: "How is this different from Google Workspace or Microsoft 365?",
    a: "Those providers rent you a mailbox monthly, per user. KodeMail hands you the prompts to build your own inbox system on your own domain — you pay once, and the addresses you create don't cost extra.",
  },
];