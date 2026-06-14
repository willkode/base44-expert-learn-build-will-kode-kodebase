import {
  LayoutDashboard,
  FileText,
  Sparkles,
  CalendarDays,
  ClipboardList,
  Search,
  Tags,
  Link2,
  RefreshCw,
  BarChart3,
  Cog,
  ScrollText,
} from "lucide-react";

export const blogNav = [
  { label: "Dashboard", to: "/admin/marketing/blog", icon: LayoutDashboard, end: true },
  { label: "Posts", to: "/admin/marketing/blog/posts", icon: FileText },
  { label: "AI Generator", to: "/admin/marketing/blog/generator", icon: Sparkles },
  { label: "Calendar", to: "/admin/marketing/blog/calendar", icon: CalendarDays },
  { label: "Content Plans", to: "/admin/marketing/blog/plans", icon: ClipboardList },
  { label: "Keywords", to: "/admin/marketing/blog/keywords", icon: Search },
  { label: "Categories & Tags", to: "/admin/marketing/blog/taxonomy", icon: Tags },
  { label: "Internal Linking", to: "/admin/marketing/blog/internal-linking", icon: Link2 },
  { label: "Content Refresh", to: "/admin/marketing/blog/refresh", icon: RefreshCw },
  { label: "Analytics", to: "/admin/marketing/blog/analytics", icon: BarChart3 },
  { label: "Logs", to: "/admin/marketing/blog/logs", icon: ScrollText },
  { label: "Settings", to: "/admin/marketing/blog/settings", icon: Cog },
];