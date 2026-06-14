import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Validates a BlogSettings payload. Returns blocking errors (prevent publishing /
// saving invalid config) and non-blocking warnings. Safe to call standalone or
// reuse from updateBlogSettings.
export function validate(input) {
  const errors = [];
  const warnings = [];

  if (input.blogEnabled) {
    if (!input.blogName || !String(input.blogName).trim()) {
      errors.push('Blog name is required when the blog is enabled.');
    }
    if (!input.publicBlogRoute || !String(input.publicBlogRoute).startsWith('/')) {
      errors.push('Public blog route must start with "/".');
    }
    if (!input.defaultMetaTitleTemplate || !String(input.defaultMetaTitleTemplate).trim()) {
      errors.push('A default meta title template is required for SEO.');
    }
    if (!input.defaultAuthorName || !String(input.defaultAuthorName).trim()) {
      warnings.push('No default author name set — posts may display without an author.');
    }
    if (!input.defaultOgImageUrl) {
      warnings.push('No default Open Graph image set — social shares may lack a preview image.');
    }
  }

  const ppp = Number(input.postsPerPage);
  if (input.postsPerPage != null && (!Number.isInteger(ppp) || ppp < 1 || ppp > 100)) {
    errors.push('Posts per page must be a whole number between 1 and 100.');
  }

  if (input.enableAutoPublishing && input.requireApprovalBeforePublish) {
    warnings.push('Auto-publishing is on while approval is required — posts will still wait for approval.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json();
    const input = payload?.settings || {};
    return Response.json({ success: true, ...validate(input) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});