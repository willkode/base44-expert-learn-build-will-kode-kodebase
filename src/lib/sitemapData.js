// Complete sitemap tree derived from App.jsx routes + navigation configs.
// Each node: { label, path, type, children?, navSource? }
// type: public | auth | admin | layout | wildcard | dynamic
// navSource: where this page is linked from (navbar, sidebar, footer, etc.)

export const sitemapTree = [
  {
    label: "Home (Landing)",
    path: "/",
    type: "public",
    navSources: ["navbar-logo", "footer-logo"],
  },
  {
    label: "Auth Pages",
    type: "layout",
    children: [
      { label: "Login", path: "/login", type: "public", navSources: ["navbar", "redirect"] },
      { label: "Register", path: "/register", type: "public", navSources: ["navbar", "hero", "final-cta"] },
      { label: "Forgot Password", path: "/forgot-password", type: "public", navSources: ["login-page"] },
      { label: "Reset Password", path: "/reset-password", type: "public", navSources: ["email-link"] },
    ],
  },
  {
    label: "Public Marketing (PublicLayout)",
    type: "layout",
    children: [
      { label: "Features", path: "/features", type: "public", navSources: ["footer"] },
      { label: "Products", path: "/products", type: "public", navSources: ["navbar", "footer", "final-cta"] },
      { label: "Product Detail", path: "/products/:slug", type: "dynamic", navSources: ["products-page"] },
      { label: "Contact", path: "/contact", type: "public", navSources: ["navbar"] },
      { label: "Prompt Vault (Public)", path: "/vault", type: "public", navSources: ["navbar", "sidebar"] },
    ],
  },
  {
    label: "Learn Hub (PublicLayout)",
    type: "layout",
    children: [
      { label: "Learn Index", path: "/learn", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Blog", path: "/learn/blog", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Blog Category", path: "/learn/blog/category/:slug", type: "dynamic", navSources: ["blog-sidebar"] },
      { label: "Blog Tag", path: "/learn/blog/tag/:slug", type: "dynamic", navSources: ["blog-sidebar"] },
      { label: "Blog Post", path: "/learn/blog/:slug", type: "dynamic", navSources: ["blog-card"] },
      { label: "Prompt Library", path: "/learn/prompt-library", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Prompt Post Detail", path: "/learn/prompt-library/:slug", type: "dynamic", navSources: ["prompt-card"] },
      { label: "Agent Skills", path: "/learn/agent-skills", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Super Agent Guide", path: "/learn/superagent", type: "public", navSources: ["learn-index"] },
      { label: "AI Controls", path: "/learn/ai-controls", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Videos", path: "/learn/videos", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "LLM Guide", path: "/learn/llm-guide", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
    ],
  },
  {
    label: "Services (PublicLayout)",
    type: "layout",
    children: [
      { label: "Kode Sessions", path: "/services/kode-sessions", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "ER Service", path: "/services/er-service", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "Security Audit", path: "/services/security-audit", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
      { label: "SEO Audit", path: "/services/seo-audit", type: "public", navSources: ["navbar-dropdown", "mobile-menu"] },
    ],
  },
  {
    label: "Tools",
    type: "layout",
    children: [
      { label: "Prompt Generator (Public)", path: "/tools/prompt-generator", type: "public", navSources: ["navbar-dropdown"] },
      { label: "Prompt Engine (Auth)", path: "/tools/prompt-engine", type: "auth", navSources: ["sidebar"] },
    ],
  },
  {
    label: "Authenticated App (ProtectedRoute)",
    type: "layout",
    children: [
      { label: "Dashboard", path: "/dashboard", type: "auth", navSources: ["sidebar", "navbar-button"] },
      { label: "Bundle Downloads", path: "/bundle-downloads", type: "auth", navSources: ["my-products"] },
      { label: "Checkout", path: "/checkout", type: "auth", navSources: ["products-page", "cart"] },
      { label: "Download", path: "/download/:productId", type: "dynamic", navSources: ["my-products", "checkout"] },
      { label: "Service Onboarding", path: "/service-onboarding", type: "auth", navSources: ["service-pages"] },
      { label: "Buy Me a Coffee", path: "/coffee", type: "auth", navSources: ["dashboard"] },
      { label: "Vault Access", path: "/vault/access", type: "auth", navSources: ["sidebar"] },
      { label: "Settings", path: "/settings", type: "auth", navSources: ["sidebar"] },
      { label: "Help / Resources", path: "/help", type: "auth", navSources: ["sidebar"] },
      { label: "Projects", path: "/projects", type: "auth", navSources: ["sidebar"] },
      { label: "New Project", path: "/projects/new", type: "auth", navSources: ["sidebar", "modal"] },
      {
        label: "Project Detail (AppLayout)",
        path: "/projects/:id",
        type: "dynamic",
        navSources: ["projects-list"],
        children: [
          { label: "Overview", path: "/projects/:id/overview", type: "auth", navSources: ["project-tabs"] },
          { label: "Prompt Pack", path: "/projects/:id/prompts", type: "auth", navSources: ["project-tabs"] },
          { label: "Optimization Prompts", path: "/projects/:id/optimize", type: "auth", navSources: ["project-tabs"] },
          { label: "Security Review", path: "/projects/:id/security", type: "auth", navSources: ["project-tabs"] },
          { label: "QA Checklist", path: "/projects/:id/qa", type: "auth", navSources: ["project-tabs"] },
          { label: "Launch Audit", path: "/projects/:id/launch-audit", type: "auth", navSources: ["project-tabs"] },
        ],
      },
    ],
  },
  {
    label: "Admin Console (AdminRoute + AppLayout)",
    type: "layout",
    children: [
      { label: "Admin Dashboard", path: "/admin", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Users", path: "/admin/users", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Admin Projects", path: "/admin/projects", type: "admin", navSources: ["admin-sidebar"] },
      { label: "AI Usage Logs", path: "/admin/logs", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Templates", path: "/admin/templates", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Videos", path: "/admin/videos", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Marketing Hub", path: "/admin/marketing", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Prompt Library Mgmt", path: "/admin/marketing/prompt-library", type: "admin", navSources: ["admin-marketing"] },
      {
        label: "Blog Marketing (BlogMarketingLayout)",
        path: "/admin/marketing/blog",
        type: "admin",
        navSources: ["admin-sidebar"],
        children: [
          { label: "Blog Dashboard", path: "/admin/marketing/blog", type: "admin", navSources: ["blog-nav"] },
          { label: "Blog Posts", path: "/admin/marketing/blog/posts", type: "admin", navSources: ["blog-nav"] },
          { label: "New Post Editor", path: "/admin/marketing/blog/posts/new", type: "admin", navSources: ["blog-nav"] },
          { label: "Edit Post Editor", path: "/admin/marketing/blog/posts/:id/edit", type: "dynamic", navSources: ["blog-posts-list"] },
          { label: "Approvals", path: "/admin/marketing/blog/approvals", type: "admin", navSources: ["blog-nav"] },
          { label: "AI Generator", path: "/admin/marketing/blog/generator", type: "admin", navSources: ["blog-nav"] },
          { label: "Calendar", path: "/admin/marketing/blog/calendar", type: "admin", navSources: ["blog-nav"] },
          { label: "Content Plans", path: "/admin/marketing/blog/plans", type: "admin", navSources: ["blog-nav"] },
          { label: "Keywords", path: "/admin/marketing/blog/keywords", type: "admin", navSources: ["blog-nav"] },
          { label: "Categories & Tags", path: "/admin/marketing/blog/taxonomy", type: "admin", navSources: ["blog-nav"] },
          { label: "Internal Linking", path: "/admin/marketing/blog/internal-linking", type: "admin", navSources: ["blog-nav"] },
          { label: "Content Refresh", path: "/admin/marketing/blog/refresh", type: "admin", navSources: ["blog-nav"] },
          { label: "Analytics", path: "/admin/marketing/blog/analytics", type: "admin", navSources: ["blog-nav"] },
          { label: "Logs", path: "/admin/marketing/blog/logs", type: "admin", navSources: ["blog-nav"] },
          { label: "Settings", path: "/admin/marketing/blog/settings", type: "admin", navSources: ["blog-nav"] },
        ],
      },
      {
        label: "Email Marketing (EmailMarketingLayout)",
        path: "/admin/marketing/email",
        type: "admin",
        navSources: ["admin-sidebar"],
        children: [
          { label: "Email Dashboard", path: "/admin/marketing/email", type: "admin", navSources: ["email-nav"] },
          { label: "Contacts", path: "/admin/marketing/email/contacts", type: "admin", navSources: ["email-nav"] },
          { label: "Contact Profile", path: "/admin/marketing/email/contacts/:id", type: "dynamic", navSources: ["contacts-list"] },
          { label: "Lists", path: "/admin/marketing/email/lists", type: "admin", navSources: ["email-nav"] },
          { label: "Segments", path: "/admin/marketing/email/segments", type: "admin", navSources: ["email-nav"] },
          { label: "Campaigns", path: "/admin/marketing/email/campaigns", type: "admin", navSources: ["email-nav"] },
          { label: "Email Studio", path: "/admin/marketing/email/studio", type: "admin", navSources: ["email-nav"] },
          { label: "Calendar", path: "/admin/marketing/email/calendar", type: "admin", navSources: ["email-nav"] },
          { label: "Automations", path: "/admin/marketing/email/automations", type: "admin", navSources: ["email-nav"] },
          { label: "Analytics", path: "/admin/marketing/email/analytics", type: "admin", navSources: ["email-nav"] },
          { label: "Suppression", path: "/admin/marketing/email/suppression", type: "admin", navSources: ["email-nav"] },
          { label: "Logs", path: "/admin/marketing/email/logs", type: "admin", navSources: ["email-nav"] },
          { label: "Resend Settings", path: "/admin/marketing/email/settings", type: "admin", navSources: ["email-nav"] },
        ],
      },
      {
        label: "Social Marketing (Wildcard)",
        path: "/admin/marketing/social/*",
        type: "admin",
        navSources: ["admin-sidebar"],
        children: [
          { label: "Social Dashboard", path: "/admin/marketing/social", type: "admin", navSources: ["social-nav"] },
          { label: "Brand Profile", path: "/admin/marketing/social/brand", type: "admin", navSources: ["social-nav"] },
          { label: "Campaigns", path: "/admin/marketing/social/campaigns", type: "admin", navSources: ["social-nav"] },
          { label: "Content Studio", path: "/admin/marketing/social/studio", type: "admin", navSources: ["social-nav"] },
          { label: "Approvals", path: "/admin/marketing/social/approvals", type: "admin", navSources: ["social-nav"] },
          { label: "Calendar", path: "/admin/marketing/social/calendar", type: "admin", navSources: ["social-nav"] },
          { label: "Connections", path: "/admin/marketing/social/connections", type: "admin", navSources: ["social-nav"] },
          { label: "Analytics", path: "/admin/marketing/social/analytics", type: "admin", navSources: ["social-nav"] },
          { label: "Logs", path: "/admin/marketing/social/logs", type: "admin", navSources: ["social-nav"] },
          { label: "Settings", path: "/admin/marketing/social/settings", type: "admin", navSources: ["social-nav"] },
        ],
      },
      { label: "Security Dashboard", path: "/admin/security", type: "admin", navSources: ["admin-sidebar"] },
      { label: "System Settings", path: "/admin/settings", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Sales & Orders", path: "/admin/sales", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Products & Downloads", path: "/admin/products", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Coupons", path: "/admin/coupons", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Prompt Vault Mgmt", path: "/admin/prompt-vault", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Agent Skills Mgmt", path: "/admin/agent-skills", type: "admin", navSources: ["admin-sidebar"] },
      { label: "Analytics Plan", path: "/admin/analytics", type: "admin", navSources: ["admin-sidebar"] },
    ],
  },
  { label: "404 — Page Not Found", path: "*", type: "wildcard", navSources: [] },
];

// Nav links that exist in the Navbar but have NO matching route in App.jsx.
export const brokenNavLinks = [
  { label: "Sentinel Pro", path: "/services/sentinel-pro", source: "navbar-dropdown, mobile-menu" },
  { label: "KodeCare", path: "/services/kodecare", source: "navbar-dropdown, mobile-menu" },
];

export const typeStyles = {
  public: { label: "Public", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  auth: { label: "Auth Required", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" },
  admin: { label: "Admin Only", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", dot: "bg-primary" },
  layout: { label: "Section", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400" },
  dynamic: { label: "Dynamic Route", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", dot: "bg-purple-400" },
  wildcard: { label: "Wildcard", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", dot: "bg-rose-400" },
};

export function countPages(nodes = sitemapTree) {
  let total = 0;
  let publicCount = 0;
  let authCount = 0;
  let adminCount = 0;
  let dynamicCount = 0;
  for (const node of nodes) {
    if (node.type !== "layout") {
      total++;
      if (node.type === "public") publicCount++;
      if (node.type === "auth") authCount++;
      if (node.type === "admin") adminCount++;
      if (node.type === "dynamic") dynamicCount++;
    }
    if (node.children) {
      const child = countPages(node.children);
      total += child.total;
      publicCount += child.publicCount;
      authCount += child.authCount;
      adminCount += child.adminCount;
      dynamicCount += child.dynamicCount;
    }
  }
  return { total, publicCount, authCount, adminCount, dynamicCount };
}