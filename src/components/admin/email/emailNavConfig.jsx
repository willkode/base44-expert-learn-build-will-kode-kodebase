import {
  LayoutDashboard,
  Users,
  ListChecks,
  Filter,
  Send,
  Sparkles,
  CalendarDays,
  Workflow,
  BarChart3,
  Cog,
  Ban,
  ScrollText,
} from "lucide-react";

export const emailNav = [
  { label: "Dashboard", to: "/admin/marketing/email", icon: LayoutDashboard, end: true },
  { label: "Contacts", to: "/admin/marketing/email/contacts", icon: Users },
  { label: "Lists", to: "/admin/marketing/email/lists", icon: ListChecks },
  { label: "Segments", to: "/admin/marketing/email/segments", icon: Filter },
  { label: "Campaigns", to: "/admin/marketing/email/campaigns", icon: Send },
  { label: "Email Studio", to: "/admin/marketing/email/studio", icon: Sparkles },
  { label: "Calendar", to: "/admin/marketing/email/calendar", icon: CalendarDays },
  { label: "Automations", to: "/admin/marketing/email/automations", icon: Workflow },
  { label: "Analytics", to: "/admin/marketing/email/analytics", icon: BarChart3 },
  { label: "Suppression", to: "/admin/marketing/email/suppression", icon: Ban },
  { label: "Logs", to: "/admin/marketing/email/logs", icon: ScrollText },
  { label: "Resend Settings", to: "/admin/marketing/email/settings", icon: Cog },
];