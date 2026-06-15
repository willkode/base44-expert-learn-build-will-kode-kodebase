// Security Lockdown Pro — scan engine.
// Pure functions that analyze the SecurityRegistry and produce checks + issues.
// Registry-based heuristics only — does NOT change real route/entity protection.

export const SCAN_DISCLAIMER =
  "This scan reviews the configured app registry and known access patterns. It helps identify likely security risks but should be paired with manual testing using logged-out, regular user, premium user, and admin accounts.";

const SEVERITY_PENALTY = { Critical: 20, High: 10, Medium: 5, Low: 2, Info: 0 };

// Path keywords that suggest a route is sensitive unless intentionally public.
export const SENSITIVE_ROUTE_WORDS = [
  "admin", "dashboard", "settings", "billing", "payment", "checkout",
  "account", "profile", "users", "messages", "inbox", "projects",
  "contracts", "files", "reports", "support", "security", "revenue",
  "payouts", "api", "integrations",
];

export function scoreLabel(score) {
  if (score >= 90) return "Launch Ready";
  if (score >= 75) return "Mostly Secure";
  if (score >= 60) return "Needs Review";
  if (score >= 40) return "High Risk";
  return "Critical Risk";
}

export function computeScore(issues) {
  let score = 100;
  for (const i of issues) score -= SEVERITY_PENALTY[i.severity] || 0;
  return Math.max(0, score);
}

function lower(s) {
  return (s || "").toLowerCase();
}

function isPublicRoute(r) {
  return r.is_public || r.expected_access === "Public";
}

function matchedSensitiveWords(path) {
  const p = lower(path);
  return SENSITIVE_ROUTE_WORDS.filter((w) => p.includes(w));
}

// Standard route retest steps required by the spec.
const ROUTE_RETEST = [
  "Test as a logged-out user (direct URL).",
  "Test as a regular authenticated user.",
  "Test as a premium user if the route is premium-gated.",
  "Test as an admin.",
  "Test by pasting the direct URL into the browser.",
  "Test by navigating through the app's navigation menus.",
].join("\n");

// Builds a structured, copyable fix prompt.
function buildFixPrompt({ title, severity, risk, fix, implementation, testing }) {
  return [
    `Issue: ${title}`,
    `Severity: ${severity}`,
    `Risk: ${risk}`,
    `Required fix: ${fix}`,
    `Implementation instructions: ${implementation}`,
    `Testing steps:\n${testing}`,
    "What to return after fixing: Confirm the route/entity is now protected, list the files changed, and report the access level enforced for logged-out, regular, premium, and admin users.",
  ].join("\n\n");
}

// Role / data-isolation fix prompt in the exact format required by the spec.
function buildRoleFixPrompt({ title, severity, risk, fix }) {
  return [
    "Fix this Base44 security issue.",
    `Issue:\n${title}`,
    `Severity:\n${severity}`,
    `Risk:\n${risk}`,
    `Required Fix:\n${fix}`,
    [
      "Instructions:",
      "1. Review the affected role/entity/feature/action.",
      "2. Confirm who should be allowed to view, create, edit, delete, or manage it.",
      "3. Add or verify access checks using the authenticated user, owner field, role, plan, or admin status.",
      "4. Ensure users cannot access records they do not own unless intentionally shared.",
      "5. Hide restricted navigation and buttons from unauthorized users.",
      "6. Prevent unauthorized actions even if the user reaches the route directly.",
      "7. Do not change unrelated UI, copy, layout, entities, or business logic.",
      "8. Test as logged-out user, regular user, second regular user, premium user if relevant, and admin.",
    ].join("\n"),
    [
      "Return:",
      "- What was changed",
      "- What access rule was added",
      "- What roles were tested",
      "- What data isolation was verified",
      "- Any remaining risks",
    ].join("\n"),
  ].join("\n\n");
}

// Entity name keywords that imply private / user-owned data.
const OWNER_SCOPED_NAME_WORDS = [
  "message", "messages", "chat", "file", "document", "project", "contract",
  "contact", "customer", "lead", "supportticket", "ticket", "invoice", "transaction",
];

// Retest steps for role / data-isolation issues.
const DATA_RETEST = [
  "Test as a logged-out user.",
  "Test as a regular authenticated user.",
  "Test as a second regular user (confirm no cross-user data access).",
  "Test as a premium user if the feature is plan-gated.",
  "Test as an admin.",
].join("\n");

function nameSuggestsOwned(n) {
  return OWNER_SCOPED_NAME_WORDS.some((w) => n.includes(w));
}

function issue(partial) {
  return {
    issue_id: `iss_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "Open",
    ...partial,
  };
}

// ---- Route Protection (deep detection) ----
function checkRoutes(routes, addCheck) {
  const issues = [];

  for (const r of routes) {
    const path = r.path || r.name || "(unnamed route)";
    const p = lower(r.path);
    const access = r.expected_access;
    const sensitiveWords = matchedSensitiveWords(r.path);
    const isAdminPath = p === "/admin" || p.startsWith("/admin/");
    const isSecurityDash = p.startsWith("/admin/security");
    const isUserMgmt = p.includes("users");
    const isBillingAdmin = isAdminPath && (p.includes("billing") || p.includes("payment"));
    const pub = isPublicRoute(r);

    let failed = false;
    const flag = (data) => { failed = true; issues.push(issue(data)); };

    const base = {
      category: "Route Protection",
      location: `Route registry: ${path}`,
      affected_route: r.path || path,
      retest_steps: ROUTE_RETEST,
    };

    // CRITICAL — admin / security / user-mgmt / billing public
    if (isAdminPath && pub) {
      flag({
        ...base, category: "Admin Lockdown", severity: "Critical",
        title: `Admin route "${path}" is marked public`,
        description: `The admin route ${path} is classified as public in the registry. Admin routes must be admin-only.`,
        risk_summary: "An admin area is exposed to unauthenticated visitors.",
        potential_impact: "Anyone could reach admin functionality, exposing or modifying sensitive data and settings.",
        recommended_fix: "Mark this route Admin Only and guard it with an admin route wrapper.",
        fix_prompt: buildFixPrompt({
          title: `Admin route "${path}" is public`, severity: "Critical",
          risk: "Unauthenticated users may reach admin functionality.",
          fix: "Set expected access to Admin Only and enforce an admin guard on the route.",
          implementation: `Wrap ${path} in the app's AdminRoute guard so only users with the admin role can load it, and update its registry classification to Admin Only.`,
          testing: ROUTE_RETEST,
        }),
      });
    } else if (isSecurityDash && pub) {
      flag({
        ...base, category: "Admin Lockdown", severity: "Critical",
        title: "Security dashboard is marked public",
        description: "The security dashboard route is classified as public. It must be admin-only.",
        risk_summary: "The security dashboard would be reachable by anyone.",
        potential_impact: "Security findings, registry, and scan controls could be viewed or triggered by unauthorized users.",
        recommended_fix: "Mark the security dashboard route Admin Only and guard it with an admin wrapper.",
        fix_prompt: buildFixPrompt({
          title: "Security dashboard is public", severity: "Critical",
          risk: "Security tooling exposed to unauthorized users.",
          fix: "Set Admin Only and enforce an admin route guard.",
          implementation: "Ensure /admin/security is wrapped in the AdminRoute guard and classified Admin Only in the registry.",
          testing: ROUTE_RETEST,
        }),
      });
    } else if (isUserMgmt && pub) {
      flag({
        ...base, severity: "Critical",
        title: `User management route "${path}" is public`,
        description: `${path} manages users but is classified public.`,
        risk_summary: "User management exposed publicly.",
        potential_impact: "User records could be listed, edited, or deleted by anyone.",
        recommended_fix: "Mark Admin Only and guard with an admin wrapper.",
        fix_prompt: buildFixPrompt({
          title: `User management route "${path}" is public`, severity: "Critical",
          risk: "User records exposed to the public.",
          fix: "Set Admin Only and enforce an admin guard.",
          implementation: `Guard ${path} with AdminRoute and classify it Admin Only.`,
          testing: ROUTE_RETEST,
        }),
      });
    } else if (isBillingAdmin && pub) {
      flag({
        ...base, severity: "Critical",
        title: `Billing/payment admin route "${path}" is public`,
        description: `${path} handles billing/payments at admin level but is public.`,
        risk_summary: "Billing administration exposed publicly.",
        potential_impact: "Financial records could be viewed or altered by unauthorized users.",
        recommended_fix: "Mark Admin Only and guard with an admin wrapper.",
        fix_prompt: buildFixPrompt({
          title: `Billing admin route "${path}" is public`, severity: "Critical",
          risk: "Financial data exposed publicly.",
          fix: "Set Admin Only and enforce an admin guard.",
          implementation: `Guard ${path} with AdminRoute and classify it Admin Only.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // HIGH — private dashboards / settings / profile / messages / files / projects public
    const highWords = ["dashboard", "settings", "profile", "messages", "inbox", "files", "projects", "account"];
    const matchedHigh = highWords.filter((w) => p.includes(w));
    if (!failed && pub && matchedHigh.length > 0 && !isAdminPath) {
      flag({
        ...base, severity: "High",
        title: `Private route "${path}" is marked public`,
        description: `${path} (${matchedHigh.join(", ")}) holds user-specific content but is public.`,
        risk_summary: "Private user area exposed without authentication.",
        potential_impact: "Another person's personal data or workspace could be viewed by anyone.",
        recommended_fix: "Mark Authenticated only (or Owner Only) and require login.",
        fix_prompt: buildFixPrompt({
          title: `Private route "${path}" is public`, severity: "High",
          risk: "Personal/private content exposed without login.",
          fix: "Require authentication and scope data to the owner.",
          implementation: `Place ${path} behind the authenticated route guard and classify it Authenticated only.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // HIGH — authenticated-only route missing access classification
    if (!failed && !pub && !r.is_authenticated_only && !r.is_admin_only && !r.is_premium_only &&
        (access === "Authenticated" || access === "Owner Only")) {
      flag({
        ...base, severity: "High",
        title: `Route "${path}" is missing an access-control classification`,
        description: `${path} is expected to be ${access} but has no access toggle set.`,
        risk_summary: "Route lacks an explicit access classification.",
        potential_impact: "Without a clear classification, the route may not be guarded consistently.",
        recommended_fix: "Set the Authenticated-only toggle (or the correct access level).",
        fix_prompt: buildFixPrompt({
          title: `Route "${path}" missing access classification`, severity: "High",
          risk: "Inconsistent or missing route protection.",
          fix: "Add the correct access toggle and guard.",
          implementation: `Mark ${path} as Authenticated only in the registry and confirm it sits behind the authenticated route guard.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // MEDIUM — admin route not marked admin-only
    if (!failed && isAdminPath && !r.is_admin_only && access !== "Admin Only") {
      flag({
        ...base, category: "Admin Lockdown", severity: "Medium",
        title: `Admin route "${path}" is not marked admin-only`,
        description: `${path} is under /admin but is not classified Admin Only.`,
        risk_summary: "Admin route classification is weaker than expected.",
        potential_impact: "The route may be reachable by non-admin authenticated users.",
        recommended_fix: "Mark Admin Only and guard with an admin wrapper.",
        fix_prompt: buildFixPrompt({
          title: `Admin route "${path}" not admin-only`, severity: "Medium",
          risk: "Non-admins may reach an admin route.",
          fix: "Set Admin Only and enforce an admin guard.",
          implementation: `Classify ${path} Admin Only and ensure it is wrapped by AdminRoute.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // MEDIUM — premium route not marked premium-only
    if (!failed && (access === "Premium Only" || p.includes("premium")) && !r.is_premium_only) {
      flag({
        ...base, severity: "Medium",
        title: `Premium route "${path}" is not marked premium-only`,
        description: `${path} appears to be a premium feature but is not classified premium-only.`,
        risk_summary: "Premium gating may be missing.",
        potential_impact: "Free users could access paid-only functionality.",
        recommended_fix: "Mark Premium Only and gate by plan.",
        fix_prompt: buildFixPrompt({
          title: `Premium route "${path}" not premium-only`, severity: "Medium",
          risk: "Free users access premium features.",
          fix: "Add premium plan gating to the route.",
          implementation: `Classify ${path} Premium Only and gate access by the user's plan.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // MEDIUM — role-restricted route missing role restriction classification
    if (!failed && access === "Role Restricted" && !r.is_admin_only && !r.is_premium_only) {
      flag({
        ...base, category: "Role-Based Access", severity: "Medium",
        title: `Role-specific route "${path}" is missing a role restriction`,
        description: `${path} expects role-restricted access but no restricting toggle is set.`,
        risk_summary: "Role restriction is undefined.",
        potential_impact: "Users outside the intended role may reach the route.",
        recommended_fix: "Define the required role and enforce it.",
        fix_prompt: buildFixPrompt({
          title: `Role route "${path}" missing restriction`, severity: "Medium",
          risk: "Wrong-role users may access the route.",
          fix: "Enforce the required role on the route.",
          implementation: `Add a role guard to ${path} and document the required role in the registry notes.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    // LOW — sensitive route, looks intentional but missing notes / unclear
    if (!failed && sensitiveWords.length > 0 && !pub && !r.notes) {
      flag({
        ...base, severity: "Low",
        title: `Sensitive route "${path}" is missing notes`,
        description: `${path} matches sensitive keyword(s) (${sensitiveWords.join(", ")}) but has no notes describing its intended access.`,
        risk_summary: "Route intent is undocumented.",
        potential_impact: "Future changes may misclassify this route without documented intent.",
        recommended_fix: "Add notes describing who should access this route and why.",
        fix_prompt: buildFixPrompt({
          title: `Sensitive route "${path}" missing notes`, severity: "Low",
          risk: "Undocumented access intent.",
          fix: "Document the intended access in the registry notes.",
          implementation: `Add a note to ${path} describing the intended access level and audience.`,
          testing: ROUTE_RETEST,
        }),
      });
    } else if (!failed && !access) {
      flag({
        ...base, severity: "Low",
        title: `Route "${path}" classification is unclear`,
        description: `${path} has no expected access set and needs manual review.`,
        risk_summary: "Route access classification is unclear.",
        potential_impact: "Unclassified routes may be guarded incorrectly.",
        recommended_fix: "Set an expected access level for this route.",
        fix_prompt: buildFixPrompt({
          title: `Route "${path}" unclear`, severity: "Low",
          risk: "Unclassified route.",
          fix: "Set an expected access level.",
          implementation: `Classify ${path} with the correct expected access in the registry.`,
          testing: ROUTE_RETEST,
        }),
      });
    }

    addCheck({
      check_name: `Route protection: ${path}`,
      category: "Route Protection",
      status: failed ? "Failed" : "Passed",
      result_summary: failed ? "One or more route protection risks detected." : "Route classification looks consistent.",
      details: `Expected access: ${access || "unset"}. Sensitive keywords: ${sensitiveWords.join(", ") || "none"}.`,
      severity_if_failed: "High",
    });
  }

  // Admin Lockdown: /admin missing entirely
  const hasAdminRoute = routes.some((r) => lower(r.path) === "/admin" || lower(r.path).startsWith("/admin/"));
  addCheck({
    check_name: "Admin route present in registry",
    category: "Admin Lockdown",
    status: hasAdminRoute ? "Passed" : "Failed",
    result_summary: hasAdminRoute ? "An /admin route is registered." : "No /admin route found in the registry.",
    severity_if_failed: "Medium",
  });
  if (!hasAdminRoute) {
    issues.push(issue({
      category: "Admin Lockdown", severity: "Medium",
      title: "/admin route is missing from the registry",
      description: "No /admin route is registered, so admin lockdown cannot be verified.",
      location: "Route registry",
      affected_route: "/admin",
      risk_summary: "Admin area is not tracked by the security registry.",
      potential_impact: "Admin protection gaps may go undetected by future scans.",
      recommended_fix: "Register the /admin route and mark it Admin Only.",
      retest_steps: ROUTE_RETEST,
      fix_prompt: buildFixPrompt({
        title: "/admin missing from registry", severity: "Medium",
        risk: "Admin lockdown unverifiable.",
        fix: "Add /admin to the registry as Admin Only.",
        implementation: "Open the Routes tab and add /admin classified Admin Only.",
        testing: ROUTE_RETEST,
      }),
    }));
  }

  return issues;
}

// ---- Entity Exposure + User Data Isolation ----
function checkEntities(entities, addCheck) {
  const issues = [];
  const securityEntityNames = ["securityscan", "securityissue", "securitycheck", "securitysetting", "securityregistry"];
  const userBillingNames = ["user", "payment", "subscription", "billing"];

  for (const e of entities) {
    const name = e.entity_name || e.name || "(unnamed entity)";
    const n = lower(name);
    let failed = false;
    const flag = (data) => { failed = true; issues.push(issue(data)); };
    const base = {
      category: "Entity Exposure",
      location: `Entity registry: ${name}`,
      affected_entity: name,
      retest_steps: "Verify the entity's RLS read/write rules in its schema, then test reads/writes as logged-out, regular, and admin users.",
    };

    if (e.is_sensitive_data && e.is_public_readable) {
      flag({ ...base, severity: "Critical",
        title: `Sensitive entity "${name}" is publicly readable`,
        description: `${name} holds sensitive data but is marked public readable.`,
        risk_summary: "Sensitive records readable without authentication.",
        potential_impact: "Private/personal data could be read by anyone.",
        recommended_fix: "Restrict read access via RLS (owner-scoped or admin-only).",
        fix_prompt: buildFixPrompt({ title: `Sensitive entity "${name}" publicly readable`, severity: "Critical", risk: "Public read of sensitive data.", fix: "Tighten RLS read rules.", implementation: `Update ${name} RLS so reads require ownership or admin role.`, testing: base.retest_steps }) });
    } else if (e.is_sensitive_data && e.is_public_writable) {
      flag({ ...base, severity: "Critical",
        title: `Sensitive entity "${name}" is publicly writable`,
        description: `${name} holds sensitive data but is marked public writable.`,
        risk_summary: "Sensitive records writable without authentication.",
        potential_impact: "Anyone could create or tamper with sensitive records.",
        recommended_fix: "Restrict write access via RLS.",
        fix_prompt: buildFixPrompt({ title: `Sensitive entity "${name}" publicly writable`, severity: "Critical", risk: "Public write of sensitive data.", fix: "Tighten RLS write rules.", implementation: `Update ${name} RLS so writes require ownership or admin role.`, testing: base.retest_steps }) });
    }

    if (!failed && securityEntityNames.includes(n) && !e.is_admin_only) {
      flag({ ...base, category: "Entity Exposure", severity: "High",
        title: `Security entity "${name}" is not marked admin-only`,
        description: `${name} is a security entity but is not classified admin-only.`,
        risk_summary: "Security data not locked to admins.",
        potential_impact: "Security findings could be visible to non-admins.",
        recommended_fix: "Mark admin-only and enforce admin RLS.",
        fix_prompt: buildFixPrompt({ title: `Security entity "${name}" not admin-only`, severity: "High", risk: "Security data exposed to non-admins.", fix: "Enforce admin-only RLS.", implementation: `Set ${name} RLS read/write to admin role.`, testing: base.retest_steps }) });
    }

    if (!failed && e.is_sensitive_data && !e.is_owner_scoped && !e.is_admin_only) {
      flag({ ...base, category: "User Data Isolation", severity: "High",
        title: `Sensitive entity "${name}" is missing owner scoping`,
        description: `${name} holds sensitive data but is neither owner-scoped nor admin-only.`,
        risk_summary: "User data isolation is undefined.",
        potential_impact: "Users could read each other's records.",
        recommended_fix: "Add owner scoping (created_by_id) or admin-only RLS.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Sensitive entity "${name}" is missing owner scoping`, severity: "High", risk: "Without owner scoping, one user may read or modify another user's sensitive records.", fix: "Add owner-scoped RLS on " + name + " (e.g. created_by_id == user.id) or restrict to admin." }) });
    }

    // CRITICAL — user-owned private data marked public readable/writable
    if (!failed && nameSuggestsOwned(n) && (e.is_public_readable || e.is_public_writable)) {
      flag({ ...base, category: "User Data Isolation", severity: "Critical",
        title: `User-owned entity "${name}" appears public`,
        description: `${name} typically holds user-owned private data but is marked publicly ${e.is_public_writable ? "writable" : "readable"}.`,
        risk_summary: "Another user's private data may be publicly accessible.",
        potential_impact: "Any visitor could read or alter another user's private records.",
        recommended_fix: "Scope access to the record owner (or admin) and remove public access.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `User-owned entity "${name}" appears public`, severity: "Critical", risk: "Private, user-owned data is exposed to the public, allowing access to other users' records.", fix: "Remove public read/write on " + name + " and scope access to the owner (created_by_id) or admin role." }) });
    }

    // HIGH — owner-suggesting entity not owner-scoped or role-restricted
    if (!failed && nameSuggestsOwned(n) && !e.is_owner_scoped && !e.is_admin_only) {
      flag({ ...base, category: "User Data Isolation", severity: "High",
        title: `Entity "${name}" is not owner-scoped or role-restricted`,
        description: `${name} (messages/files/projects/contracts/contacts/tickets style data) is not owner-scoped, admin-only, or otherwise restricted.`,
        risk_summary: "Shared user data lacks clear ownership/role restriction.",
        potential_impact: "Users may access records belonging to other users.",
        recommended_fix: "Scope to the owner (created_by_id), or add a role restriction if the data is intentionally shared.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Entity "${name}" is not owner-scoped or role-restricted`, severity: "High", risk: "Records may be readable by users who do not own them.", fix: "Add owner scoping on " + name + " (created_by_id), or a clear role restriction if the data is intentionally shared." }) });
    }

    // MEDIUM — entity ownership/access classification unclear
    if (!failed && !e.is_owner_scoped && !e.is_admin_only && !e.is_public_readable && !e.is_public_writable && !e.is_sensitive_data) {
      flag({ ...base, category: "User Data Isolation", severity: "Medium",
        title: `Entity "${name}" has unclear data ownership`,
        description: `${name} has no ownership, admin, public, or sensitivity classification set.`,
        risk_summary: "Entity ownership is unclear and needs review.",
        potential_impact: "Access intent is ambiguous and may be enforced inconsistently.",
        recommended_fix: "Classify the entity: owner-scoped, role-restricted, admin-only, or intentionally public.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Entity "${name}" has unclear data ownership`, severity: "Medium", risk: "Ambiguous ownership can lead to inconsistent access enforcement.", fix: "Set a clear access classification for " + name + " and align its RLS accordingly." }) });
    }

    if (!failed && userBillingNames.includes(n) && !e.is_sensitive_data) {
      flag({ ...base, severity: "Medium",
        title: `Entity "${name}" is not marked sensitive`,
        description: `${name} typically holds personal/financial data but is not marked sensitive.`,
        risk_summary: "Sensitive entity not classified as sensitive.",
        potential_impact: "Scans may under-report exposure for this entity.",
        recommended_fix: "Mark the entity as sensitive data.",
        fix_prompt: buildFixPrompt({ title: `Entity "${name}" not marked sensitive`, severity: "Medium", risk: "Misclassified sensitivity.", fix: "Toggle sensitive data on.", implementation: `Mark ${name} as sensitive in the Entities tab.`, testing: base.retest_steps }) });
    }

    addCheck({
      check_name: `Entity exposure: ${name}`,
      category: "Entity Exposure",
      status: failed ? "Failed" : "Passed",
      result_summary: failed ? "Entity exposure risk detected." : "Entity access classification looks consistent.",
      severity_if_failed: "High",
    });
  }

  return issues;
}

// ---- Features displaying user-specific data ----
function checkFeatures(features, addCheck) {
  const issues = [];
  const userDataWords = ["dashboard", "profile", "account", "messages", "inbox", "files", "projects", "billing", "payment", "orders", "settings"];
  for (const f of features) {
    const fn = f.name || f.action_name || "(unnamed feature)";
    const blob = lower(`${fn} ${f.description || ""} ${f.related_route || ""} ${f.related_entity || ""}`);
    const showsUserData = userDataWords.some((w) => blob.includes(w));
    const tiedToAuth = f.is_authenticated_only || f.is_admin_only || f.is_owner_scoped || f.requires_admin || f.requires_owner || f.is_premium_only;
    const flagged = showsUserData && !tiedToAuth && !f.is_public;
    if (flagged) {
      issues.push(issue({
        category: "Role-Based Access", severity: "Medium",
        title: `Feature "${fn}" displays user-specific data without access binding`,
        description: `${fn} appears to surface user-specific data but is not tied to an authenticated user, owner, role, or admin.`,
        location: `Feature registry: ${fn}`,
        affected_route: f.related_route,
        affected_entity: f.related_entity,
        risk_summary: "User-specific feature is not bound to authenticated access.",
        potential_impact: "The feature may show one user's data to another, or render without login.",
        recommended_fix: "Bind the feature to the authenticated user (owner/role/admin) and hide it from unauthorized users.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Feature "${fn}" displays user-specific data without access binding`, severity: "Medium", risk: "A user-specific feature without access binding can leak data across users.", fix: "Tie " + fn + " to the authenticated user (owner field / role / admin) and hide its UI from unauthorized users." }),
      }));
    }
    addCheck({
      check_name: `Feature access: ${fn}`,
      category: "Role-Based Access",
      status: flagged ? "Failed" : "Passed",
      result_summary: flagged ? "Feature may surface user data without access binding." : "Feature access binding looks consistent.",
      severity_if_failed: "Medium",
    });
  }
  return issues;
}

// ---- Role-Based Access ----
function checkRoles(roles, actions, addCheck) {
  const issues = [];
  const adminRoles = roles.filter((r) => r.is_admin_role);

  addCheck({
    check_name: "Admin role defined",
    category: "Role-Based Access",
    status: adminRoles.length > 0 ? "Passed" : "Failed",
    result_summary: adminRoles.length > 0 ? "At least one admin role is defined." : "No admin role is defined.",
    severity_if_failed: "High",
  });
  if (adminRoles.length === 0 && roles.length > 0) {
    issues.push(issue({
      category: "Role-Based Access", severity: "High",
      title: "No admin role is defined",
      description: "The role registry has no role marked as an admin role.",
      location: "Role registry",
      risk_summary: "Admin access cannot be verified.",
      potential_impact: "Admin-only protections may not map to any real role.",
      recommended_fix: "Register an admin role and mark it as admin.",
      retest_steps: "Confirm the admin role exists and can reach admin areas; confirm non-admins cannot.",
      fix_prompt: buildFixPrompt({ title: "No admin role defined", severity: "High", risk: "Admin access unverifiable.", fix: "Add an admin role.", implementation: "Add an admin role in the Roles tab with admin access enabled.", testing: "Verify admin vs non-admin access." }),
    }));
  }

  for (const r of roles) {
    const rn = r.role_name || r.name || "(unnamed role)";
    let failed = false;
    const flag = (data) => { failed = true; issues.push(issue(data)); };
    const base = {
      category: "Role-Based Access",
      location: `Role registry: ${rn}`,
      affected_role: rn,
      retest_steps: "Sign in as this role and confirm it can reach exactly the areas it should — no more, no less.",
    };

    if (r.is_admin_role && !r.can_access_admin) {
      flag({ ...base, severity: "High",
        title: `Admin role "${rn}" cannot access admin`,
        description: `${rn} is an admin role but "can access admin" is off.`,
        risk_summary: "Admin role lacks admin access.",
        potential_impact: "Admins may be locked out of admin areas.",
        recommended_fix: "Enable admin access for this role.",
        fix_prompt: buildFixPrompt({ title: `Admin role "${rn}" lacks admin access`, severity: "High", risk: "Broken admin access.", fix: "Enable can access admin.", implementation: `Toggle "can access admin" on for ${rn}.`, testing: base.retest_steps }) });
    } else if (!r.is_admin_role && r.can_access_admin) {
      flag({ ...base, severity: "High",
        title: `Non-admin role "${rn}" has admin access`,
        description: `${rn} is not an admin role but "can access admin" is on.`,
        risk_summary: "Privilege escalation risk.",
        potential_impact: "Non-admins could reach admin areas.",
        recommended_fix: "Disable admin access for this role.",
        fix_prompt: buildFixPrompt({ title: `Non-admin role "${rn}" has admin access`, severity: "High", risk: "Privilege escalation.", fix: "Disable can access admin.", implementation: `Toggle "can access admin" off for ${rn}.`, testing: base.retest_steps }) });
    }

    // CRITICAL — non-admin can manage users / security
    if (!failed && !r.is_admin_role && r.can_manage_users) {
      flag({ ...base, severity: "Critical",
        title: `User management allowed for non-admin role "${rn}"`,
        description: `${rn} is not an admin role but can manage users.`,
        risk_summary: "Privilege escalation: non-admins can manage user accounts.",
        potential_impact: "A non-admin could view, edit, promote, or delete other users.",
        recommended_fix: "Restrict user management to admin roles.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `User management allowed for non-admin role "${rn}"`, severity: "Critical", risk: "Non-admins managing users is a role-escalation path.", fix: "Disable user management for " + rn + " and gate all user-management actions behind an admin check." }) });
    } else if (!failed && !r.is_admin_role && r.can_manage_security) {
      flag({ ...base, severity: "Critical",
        title: `Security management allowed for non-admin role "${rn}"`,
        description: `${rn} is not an admin role but can manage security.`,
        risk_summary: "Privilege escalation: security controls exposed to non-admins.",
        potential_impact: "Non-admins could alter security configuration or suppress findings.",
        recommended_fix: "Restrict security management to admin roles.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Security management allowed for non-admin role "${rn}"`, severity: "Critical", risk: "Non-admins managing security is a role-escalation path.", fix: "Disable security management for " + rn + " and gate it behind an admin check." }) });
    }

    // High — non-admin can view billing (admin billing features)
    if (!failed && !r.is_admin_role && r.can_view_billing) {
      flag({ ...base, severity: "High",
        title: `Billing access allowed for non-admin role "${rn}"`,
        description: `${rn} is not an admin role but can view billing data.`,
        risk_summary: "Financial data exposed to non-admins.",
        potential_impact: "Non-admins could view billing/revenue information intended for admins.",
        recommended_fix: "Restrict billing visibility to admin roles (or the data owner).",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Billing access allowed for non-admin role "${rn}"`, severity: "High", risk: "Billing/revenue data may be visible to users who should not see it.", fix: "Restrict billing views for " + rn + " to admins, or scope to the paying user only." }) });
    }

    // Medium — role defined but no expected permissions configured
    const hasAnyPerm = r.is_admin_role || r.can_access_admin || r.can_manage_users ||
      r.can_view_billing || r.can_manage_security;
    if (!failed && !hasAnyPerm && r.expected_access !== "Public") {
      flag({ ...base, severity: "Medium",
        title: `Role "${rn}" has no defined permissions`,
        description: `${rn} exists but no expected permissions (admin, user management, billing, security, admin access) are defined.`,
        risk_summary: "Role permission matrix is incomplete.",
        potential_impact: "Without a defined permission set, this role's access cannot be verified.",
        recommended_fix: "Define what this role can do, or remove it if unused.",
        retest_steps: DATA_RETEST,
        fix_prompt: buildRoleFixPrompt({ title: `Role "${rn}" has no defined permissions`, severity: "Medium", risk: "An undefined role permission matrix makes access impossible to verify.", fix: "Document and configure the expected permissions for " + rn + ", or remove the role if it is unused." }) });
    }

    addCheck({
      check_name: `Role access: ${rn}`,
      category: "Role-Based Access",
      status: failed ? "Failed" : "Passed",
      result_summary: failed ? "Role access risk detected." : "Role access looks consistent.",
      severity_if_failed: "High",
    });
  }

  // Dangerous actions assigned to weak roles
  const adminRoleNames = new Set(adminRoles.map((r) => lower(r.role_name || r.name)));
  for (const a of actions) {
    const an = a.action_name || a.name || "(unnamed action)";
    const expected = lower(a.expected_role);
    const weak = a.is_dangerous_action && a.requires_admin && expected && !adminRoleNames.has(expected) && expected !== "admin";
    if (weak) {
      issues.push(issue({
        category: "Dangerous Action", severity: "High",
        title: `Dangerous action "${an}" is assigned to a weak role`,
        description: `${an} requires admin but its expected role "${a.expected_role}" is not an admin role.`,
        location: `Action registry: ${an}`,
        affected_route: a.related_route,
        affected_entity: a.related_entity,
        risk_summary: "Destructive action available to a weak role.",
        potential_impact: "A non-admin could perform a destructive action.",
        recommended_fix: "Require an admin role for this action.",
        retest_steps: "Attempt the action as the expected role and as a non-admin; confirm it is blocked for non-admins.",
        fix_prompt: buildFixPrompt({ title: `Dangerous action "${an}" weak role`, severity: "High", risk: "Destructive action by non-admin.", fix: "Require admin role.", implementation: `Set ${an} expected role to an admin role and enforce an admin check.`, testing: "Test as non-admin and admin." }),
      }));
    }
    addCheck({
      check_name: `Action guard: ${an}`,
      category: "Dangerous Action",
      status: weak ? "Failed" : "Passed",
      result_summary: weak ? "Dangerous action may be under-protected." : "Action role expectation looks consistent.",
      severity_if_failed: "High",
    });
  }

  return issues;
}

// Main entry: analyze the registry, return { checks, issues, score, label, counts }.
export function runRegistryScan(registry) {
  const routes = registry.filter((i) => i.item_type === "Route");
  const entities = registry.filter((i) => i.item_type === "Entity");
  const roles = registry.filter((i) => i.item_type === "Role");
  const actions = registry.filter((i) => i.item_type === "Action");
  const features = registry.filter((i) => i.item_type === "Feature");

  const checks = [];
  const addCheck = (c) => checks.push(c);

  const issues = [
    ...checkRoutes(routes, addCheck),
    ...checkEntities(entities, addCheck),
    ...checkRoles(roles, actions, addCheck),
    ...checkFeatures(features, addCheck),
  ];

  const score = computeScore(issues);
  const counts = {
    critical: issues.filter((i) => i.severity === "Critical").length,
    high: issues.filter((i) => i.severity === "High").length,
    medium: issues.filter((i) => i.severity === "Medium").length,
    low: issues.filter((i) => i.severity === "Low").length,
  };

  return { checks, issues, score, label: scoreLabel(score), counts };
}