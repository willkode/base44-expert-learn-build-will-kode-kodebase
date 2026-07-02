import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public, safe Prompt Vault preview — returns titles/categories/descriptions
// ONLY (never prompt bodies), resolved with the service role so the /vault
// landing page preview works for logged-out visitors without exposing the
// paid content through entity RLS.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const prompts = await base44.asServiceRole.entities.VaultPrompt.filter({ published: true }, 'order', 200);
    const previews = prompts.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category || 'Other',
      description: p.description || '',
    }));
    return Response.json({ previews, total: prompts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});