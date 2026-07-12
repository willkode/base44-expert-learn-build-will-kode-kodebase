import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Single source of truth for Prompt Vault access.
// Access is granted if the user has the one-time Vault product purchase.
const VAULT_PRODUCT_ID = '6a36c8c785752800bd7580be';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // auth.me() throws for anonymous visitors — the vault landing page is
    // public, so treat that as "no access" instead of erroring with a 500.
    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      user = null;
    }
    if (!user) {
      return Response.json({ hasAccess: false, hasPurchase: false, via: null, prompts: [] });
    }

    // A completed one-time vault purchase grants lifetime access.
    const payments = await base44.asServiceRole.entities.Payment.filter(
      { userId: user.id, productId: VAULT_PRODUCT_ID, status: 'completed' },
      '-created_date',
      1
    );
    const hasPurchase = payments.length > 0;
    const hasAccess = hasPurchase;

    // When access is granted, return the published prompts via the service role.
    // VaultPrompt RLS only lets admins / creators read directly, so a regular
    // user granted access (Pro, purchase, or admin grant) needs them served here.
    let prompts = [];
    if (hasAccess) {
      prompts = await base44.asServiceRole.entities.VaultPrompt.filter(
        { published: true },
        'order',
        500
      );
    }

    return Response.json({
      hasAccess,
      hasPurchase,
      via: hasPurchase ? 'purchase' : null,
      prompts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});