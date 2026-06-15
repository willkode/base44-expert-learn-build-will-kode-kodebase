// Field definitions, suggested seed data, and completeness logic for the
// Security Lockdown Pro registry setup workflow.

export const ACCESS_OPTIONS = [
  "Public",
  "Authenticated",
  "Owner Only",
  "Role Restricted",
  "Admin Only",
  "Premium Only",
  "Internal Only",
];

// Boolean toggle fields shown per item type, in display order.
export const TOGGLES_BY_TYPE = {
  Route: [
    { key: "is_public", label: "Public" },
    { key: "is_admin_only", label: "Admin only" },
    { key: "is_authenticated_only", label: "Authenticated only" },
    { key: "is_premium_only", label: "Premium only" },
  ],
  Entity: [
    { key: "is_sensitive_data", label: "Sensitive data" },
    { key: "is_public_readable", label: "Public readable" },
    { key: "is_public_writable", label: "Public writable" },
    { key: "is_owner_scoped", label: "Owner scoped" },
    { key: "is_admin_only", label: "Admin only" },
  ],
  Role: [
    { key: "is_admin_role", label: "Is admin role" },
    { key: "can_access_admin", label: "Can access admin" },
    { key: "can_manage_users", label: "Can manage users" },
    { key: "can_view_billing", label: "Can view billing" },
    { key: "can_manage_security", label: "Can manage security" },
  ],
  Action: [
    { key: "is_dangerous_action", label: "Dangerous action" },
    { key: "requires_admin", label: "Requires admin" },
    { key: "requires_owner", label: "Requires owner" },
    { key: "requires_premium", label: "Requires premium" },
  ],
};

// Returns a unique key used to dedupe registry items of a given type.
export function dedupeKey(item) {
  const v = (s) => (s || "").trim().toLowerCase();
  switch (item.item_type) {
    case "Route":
      return `route:${v(item.path)}`;
    case "Entity":
      return `entity:${v(item.entity_name || item.name)}`;
    case "Role":
      return `role:${v(item.role_name || item.name)}`;
    case "Action":
      return `action:${v(item.action_name || item.name)}`;
    default:
      return `${item.item_type}:${v(item.name)}`;
  }
}

// Starter registry for "Auto-Generate Suggested Registry".
export const SUGGESTED_REGISTRY = [
  // Routes
  { item_type: "Route", name: "Home", path: "/", expected_access: "Public", is_public: true },
  { item_type: "Route", name: "Login", path: "/login", expected_access: "Public", is_public: true },
  { item_type: "Route", name: "Register", path: "/register", expected_access: "Public", is_public: true },
  { item_type: "Route", name: "Dashboard", path: "/dashboard", expected_access: "Authenticated", is_authenticated_only: true },
  { item_type: "Route", name: "Settings", path: "/settings", expected_access: "Authenticated", is_authenticated_only: true },
  { item_type: "Route", name: "Checkout", path: "/checkout", expected_access: "Authenticated", is_authenticated_only: true },
  { item_type: "Route", name: "Projects", path: "/projects", expected_access: "Authenticated", is_authenticated_only: true },
  { item_type: "Route", name: "Admin", path: "/admin", expected_access: "Admin Only", is_admin_only: true, is_authenticated_only: true },
  { item_type: "Route", name: "Admin Users", path: "/admin/users", expected_access: "Admin Only", is_admin_only: true, is_authenticated_only: true },
  { item_type: "Route", name: "Admin Security", path: "/admin/security", expected_access: "Admin Only", is_admin_only: true, is_authenticated_only: true },
  { item_type: "Route", name: "Admin Settings", path: "/admin/settings", expected_access: "Admin Only", is_admin_only: true, is_authenticated_only: true },

  // Entities
  { item_type: "Entity", name: "User", entity_name: "User", expected_access: "Admin Only", is_sensitive_data: true, is_admin_only: true },
  { item_type: "Entity", name: "Payment", entity_name: "Payment", expected_access: "Owner Only", is_sensitive_data: true, is_owner_scoped: true },
  { item_type: "Entity", name: "Project", entity_name: "Project", expected_access: "Owner Only", is_sensitive_data: true, is_owner_scoped: true },
  { item_type: "Entity", name: "ContactMessage", entity_name: "ContactMessage", expected_access: "Admin Only", is_sensitive_data: true, is_admin_only: true },
  { item_type: "Entity", name: "SecurityScan", entity_name: "SecurityScan", expected_access: "Admin Only", is_sensitive_data: true, is_admin_only: true },
  { item_type: "Entity", name: "SecurityIssue", entity_name: "SecurityIssue", expected_access: "Admin Only", is_sensitive_data: true, is_admin_only: true },
  { item_type: "Entity", name: "SecurityCheck", entity_name: "SecurityCheck", expected_access: "Admin Only", is_sensitive_data: true, is_admin_only: true },

  // Roles
  { item_type: "Role", name: "guest", role_name: "guest", description: "Logged-out visitor", expected_access: "Public" },
  { item_type: "Role", name: "user", role_name: "user", description: "Standard authenticated user", expected_access: "Authenticated" },
  { item_type: "Role", name: "admin", role_name: "admin", description: "Full administrator", expected_access: "Admin Only", is_admin_role: true, can_access_admin: true, can_manage_users: true, can_view_billing: true, can_manage_security: true },

  // Actions
  { item_type: "Action", name: "Delete user", action_name: "Delete user", related_route: "/admin/users", related_entity: "User", expected_role: "admin", is_dangerous_action: true, requires_admin: true },
  { item_type: "Action", name: "Change roles", action_name: "Change roles", related_route: "/admin/users", related_entity: "User", expected_role: "admin", is_dangerous_action: true, requires_admin: true },
  { item_type: "Action", name: "Run security scan", action_name: "Run security scan", related_route: "/admin/security", related_entity: "SecurityScan", expected_role: "admin", is_dangerous_action: true, requires_admin: true },
  { item_type: "Action", name: "Delete project", action_name: "Delete project", related_route: "/projects", related_entity: "Project", expected_role: "user", is_dangerous_action: true, requires_owner: true },
  { item_type: "Action", name: "Modify admin settings", action_name: "Modify admin settings", related_route: "/admin/settings", related_entity: "AppSetting", expected_role: "admin", is_dangerous_action: true, requires_admin: true },
];

// Checks the registry has the minimum coverage. Returns array of warning strings.
export function reviewCompleteness(items) {
  const warnings = [];
  const routes = items.filter((i) => i.item_type === "Route");
  const entities = items.filter((i) => i.item_type === "Entity");
  const roles = items.filter((i) => i.item_type === "Role");
  const actions = items.filter((i) => i.item_type === "Action");

  if (!routes.some((r) => r.is_admin_only || r.expected_access === "Admin Only"))
    warnings.push("No admin route is registered.");
  if (!routes.some((r) => r.is_authenticated_only || r.expected_access === "Authenticated"))
    warnings.push("No authenticated route is registered.");
  if (!routes.some((r) => r.is_public || r.expected_access === "Public"))
    warnings.push("No public route is registered.");
  if (!roles.some((r) => !r.is_admin_role))
    warnings.push("No standard (non-admin) user role is registered.");
  if (!roles.some((r) => r.is_admin_role))
    warnings.push("No admin role is registered.");
  if (!entities.some((e) => e.is_sensitive_data))
    warnings.push("No sensitive entity is registered.");
  if (!actions.some((a) => a.is_dangerous_action))
    warnings.push("No dangerous action is registered.");

  return warnings;
}