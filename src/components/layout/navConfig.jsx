import {
  LayoutDashboard,
  FolderPlus,
  FolderKanban,
  FileText,
  Wand2,
  ShieldCheck,
  ClipboardCheck,
  Settings,
  Users,
  Boxes,
  ScrollText,
  LayoutTemplate,
  Cog,
  LayoutPanelLeft,
  GraduationCap,
  Sparkles,
  Video,
  Megaphone,
} from "lucide-react";

export const userNav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "New Project", to: "/projects/new", icon: FolderPlus, action: "newProject" },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Resources/Learn", to: "/help", icon: GraduationCap },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const projectNav = [
  { label: "Overview", to: "overview", icon: LayoutPanelLeft },
  { label: "Blueprint", to: "blueprint", icon: FileText },
  { label: "Prompt Pack", to: "prompts", icon: Wand2 },
  { label: "Optimization Prompts", to: "optimize", icon: Sparkles },
  { label: "Security Review", to: "security", icon: ShieldCheck },
  { label: "QA Checklist", to: "qa", icon: ClipboardCheck },
];

export const adminNav = [
  { label: "Admin Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Projects", to: "/admin/projects", icon: FolderKanban },
  { label: "Blueprints", to: "/admin/blueprints", icon: Boxes },
  { label: "AI Usage Logs", to: "/admin/logs", icon: ScrollText },
  { label: "Templates", to: "/admin/templates", icon: LayoutTemplate },
  { label: "Videos", to: "/admin/videos", icon: Video },
  { label: "Marketing", to: "/admin/marketing", icon: Megaphone },
  { label: "System Settings", to: "/admin/settings", icon: Cog },
];