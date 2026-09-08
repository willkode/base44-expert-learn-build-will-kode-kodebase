export const KODEMAIL_PRODUCT_ID = "6aa0381df8463d7623eed1d9";
export const KODEMAIL_PRICE = 25;
export const KODEMAIL_LIST_PRICE = 35;
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
  { label: "Get AI-powered help configuring or repairing email settings", image: `${IMG}7ee45515d_generated_image.png` },
];

export const setupSteps = [
  { num: "01", title: "Connect Cloudflare", desc: "Authorize securely with limited permissions — your Cloudflare password is never shared." },
  { num: "02", title: "Pick your domain", desc: "Choose any domain you already manage in Cloudflare." },
  { num: "03", title: "Choose your address", desc: "hello@, support@, or your own name — created in seconds." },
  { num: "04", title: "Open your inbox", desc: "Send, receive, organize and reply in a clean modern inbox." },
];

export const securityPoints = [
  "Your Cloudflare password is never shared with the platform",
  "Access is granted through Cloudflare with limited permissions",
  "Sensitive credentials stay protected on the server",
  "Important DNS changes require your confirmation",
  "You're warned before replacing an existing email provider",
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
    q: "Do I need to edit DNS records myself?",
    a: "No. There are no DNS records to copy and no mail-server settings to figure out. Connect Cloudflare, choose your email address, and KodeMail handles the technical configuration for you.",
  },
  {
    q: "What do I need before I start?",
    a: "A Cloudflare account and a domain you manage there. That's it — everything else is configured for you.",
  },
  {
    q: "Can I create more than one address?",
    a: "Yes. Create multiple professional addresses across multiple domains and manage every mailbox from the same inbox.",
  },
  {
    q: "What does the AI assistant do?",
    a: "It can create new addresses, check your email configuration, diagnose delivery problems, and safely repair supported settings — always with your approval.",
  },
  {
    q: "What happens if I already use another email provider?",
    a: "KodeMail warns you before replacing an existing email provider, and any important DNS change requires your explicit confirmation.",
  },
  {
    q: "Is this a subscription?",
    a: `No. KodeMail is a one-time $${KODEMAIL_PRICE} payment for lifetime access.`,
  },
];