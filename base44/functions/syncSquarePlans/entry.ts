import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Source of truth — must match lib/plans.js and createSquarePayment.
const PLANS = [
  { planId: 'free', name: 'Solo', amountCents: 1299 },
  { planId: 'pro', name: 'Pro', amountCents: 3900 },
  { planId: 'agency', name: 'Agency', amountCents: 14900 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const headers = {
      Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
      'Content-Type': 'application/json',
      'Square-Version': '2025-01-23',
    };

    const results = [];

    for (const plan of PLANS) {
      // Skip plans already synced for this environment
      const existing = await base44.asServiceRole.entities.SquarePlan.filter({ planId: plan.planId, environment: env });
      if (existing.length > 0 && existing[0].squareVariationId) {
        results.push({ planId: plan.planId, status: 'already_synced', squareVariationId: existing[0].squareVariationId });
        continue;
      }

      const upsertRes = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          batches: [{
            objects: [
              {
                type: 'SUBSCRIPTION_PLAN',
                id: `#${plan.planId}-plan`,
                subscription_plan_data: { name: `ForgeBase ${plan.name}` },
              },
              {
                type: 'SUBSCRIPTION_PLAN_VARIATION',
                id: `#${plan.planId}-monthly`,
                subscription_plan_variation_data: {
                  name: `ForgeBase ${plan.name} — Monthly`,
                  subscription_plan_id: `#${plan.planId}-plan`,
                  phases: [{
                    cadence: 'MONTHLY',
                    ordinal: 0,
                    pricing: {
                      type: 'STATIC',
                      price_money: { amount: plan.amountCents, currency: 'USD' },
                    },
                  }],
                },
              },
            ],
          }],
        }),
      });
      const body = await upsertRes.json();
      if (!upsertRes.ok) {
        return Response.json({ error: `Square error for ${plan.planId}: ${body.errors?.[0]?.detail || 'unknown'}`, results }, { status: 502 });
      }

      const mappings = body.id_mappings || [];
      const planObjId = mappings.find((m) => m.client_object_id === `#${plan.planId}-plan`)?.object_id;
      const variationId = mappings.find((m) => m.client_object_id === `#${plan.planId}-monthly`)?.object_id;

      const record = {
        planId: plan.planId,
        planName: plan.name,
        amountCents: plan.amountCents,
        currency: 'USD',
        cadence: 'MONTHLY',
        squarePlanId: planObjId,
        squareVariationId: variationId,
        environment: env,
      };
      if (existing.length > 0) {
        await base44.asServiceRole.entities.SquarePlan.update(existing[0].id, record);
      } else {
        await base44.asServiceRole.entities.SquarePlan.create(record);
      }
      results.push({ planId: plan.planId, status: 'created', squarePlanId: planObjId, squareVariationId: variationId });
    }

    return Response.json({ environment: env, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});