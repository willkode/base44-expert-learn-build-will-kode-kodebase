import ServiceFAQ from "@/components/services/ServiceFAQ";
const faqs = [
  { question: "Does the $25 fee include the migration?", answer: "No. The $25 fee unlocks your complete technical migration plan, readiness report, roadmap, security findings, architecture recommendation, and preliminary professional quote. Professional migration services start at $2,000." },
  { question: "Can I use the report to migrate the app myself?", answer: "Yes. The report is designed to be useful for application owners, internal developers, freelancers, and software agencies." },
  { question: "Can I give the report to another developer?", answer: "Yes. The report provides the technical inventory, migration phases, risks, and testing requirements another qualified developer would need to evaluate the project." },
  { question: "Will the scanner modify my repository?", answer: "No. The assessment uses read-only access and does not automatically change your code." },
  { question: "Do I need to provide my Base44 login?", answer: "No. The planner analyzes your authorized GitHub repository or uploaded export." },
  { question: "What happens if my application is too complex for an automatic quote?", answer: "The project will be marked for manual review. You can schedule a call or request a custom estimate." },
  { question: "Can my existing frontend remain unchanged?", answer: "In many cases, most of the React frontend can remain in place. The migration may replace the Base44 client layer while preserving pages and components. Some applications still require frontend changes, especially when they depend on hosted authentication, platform-specific interfaces, or unsupported functionality." },
  { question: "Can my existing users be migrated?", answer: "User records can often be migrated. Passwords may require special handling because authentication providers do not always allow password hashes to be exported or transferred. Some users may need to create a new password after migration." },
  { question: "Can payments and subscriptions be migrated?", answer: "Yes, depending on the current payment provider and implementation. The assessment identifies payment dependencies, provider IDs, webhooks, subscriptions, checkout flows, refunds, and reconciliation requirements." },
  { question: "Can AI agents be migrated?", answer: "Yes. AI agents can be rebuilt using direct LLM APIs, tool permissions, conversation storage, backend functions, and realtime messaging. These migrations are usually more complex than standard AI prompts." },
  { question: "Can files be migrated?", answer: "Yes. The report identifies public files, private files, signed URLs, storage dependencies, and record references that need to be transferred." },
  { question: "How long does a migration take?", answer: "The timeline depends on the application. A small application may require only a few weeks. A complex application with payments, large datasets, realtime messaging, AI agents, or multiple integrations may require a longer phased migration. Your report includes a preliminary timeline." },
];
export const plannerFaqs = faqs;
export default function PlannerFAQ(){return <ServiceFAQ faqs={faqs}/>;}