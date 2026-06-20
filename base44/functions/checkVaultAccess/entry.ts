import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Single source of truth for Prompt Vault access.
// Access is granted if the user is a Pro member (subscription) OR has the
// one-time Vault product purchase. Plan is resolved server-side from the
// UserProfile so it can't be spoofed from the client.
const VAULT_PRODUCT_ID = '6a36c8c785752800bd7580be';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Pro members get vault access included.
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId: user.id });
    const isPro = profiles[0]?.plan === 'pro';

    // Otherwise, a completed one-time vault purchase grants lifetime access.
    let hasPurchase = false;
    if (!isPro) {
      const payments = await base44.asServiceRole.entities.Payment.filter(
        { userId: user.id, productId: VAULT_PRODUCT_ID, status: 'completed' },
        '-created_date',
        1
      );
      hasPurchase = payments.length > 0;
    }

    const hasAccess = isPro || hasPurchase;
    return Response.json({
      hasAccess,
      isPro,
      hasPurchase,
      via: isPro ? 'pro' : (hasPurchase ? 'purchase' : null),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});