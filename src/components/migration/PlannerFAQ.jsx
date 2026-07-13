import ServiceFAQ from "@/components/services/ServiceFAQ";
const faqs = [
  { question:"Do you need my Base44 password?", answer:"No. The planner only analyzes source code you authorize through GitHub or an exported ZIP. It does not access the Base44 editor." },
  { question:"What do I receive for free?", answer:"Your free account includes a migration workload and complexity overview, a professional migration quote, and available payment options for that quote." },
  { question:"What is included in the $25 report?", answer:"You receive the complete architecture inventory, dependency map, target architecture, database and authentication plans, function and integration plans, security remediation, phased roadmap, and testing checklist." },
  { question:"Is my repository changed?", answer:"No. GitHub access is used for repository inspection only. The scanner does not modify source files, create commits, or open pull requests." },
  { question:"How much does professional migration cost?", answer:"Professional migrations start at $2,000. Your deterministic scan creates explainable quote line items; enterprise or unsupported systems require manual review." },
  { question:"Can I return to the report later?", answer:"Yes. After a verified purchase, report access remains available for that repository scan unless access is refunded or administratively revoked." },
];
export default function PlannerFAQ(){return <ServiceFAQ faqs={faqs}/>;}