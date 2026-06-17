import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  CalendarDays,
  Plug,
  BarChart3,
  ScrollText,
  Palette,
  CheckSquare,
  Settings2,
} from "lucide-react";

export const socialNav = [
  { label: "Dashboard", to: "/admin/marketing/social", icon: LayoutDashboard, end: true },
  { label: "Brand Profile", to: "/admin/marketing/social/brand", icon: Palette },
  { label: "Campaigns", to: "/admin/marketing/social/campaigns", icon: Megaphone },
  { label: "Content Studio", to: "/admin/marketing/social/studio", icon: Sparkles },
  { label: "Approvals", to: "/admin/marketing/social/approvals", icon: CheckSquare },
  { label: "Calendar", to: "/admin/marketing/social/calendar", icon: CalendarDays },
  { label: "Connections", to: "/admin/marketing/social/connections", icon: Plug },
  { label: "Analytics", to: "/admin/marketing/social/analytics", icon: BarChart3 },
  { label: "Logs", to: "/admin/marketing/social/logs", icon: ScrollText },
  { label: "Settings", to: "/admin/marketing/social/settings", icon: Settings2 },
];