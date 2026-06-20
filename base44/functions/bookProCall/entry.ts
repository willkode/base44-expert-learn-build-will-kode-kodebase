import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Pro members get one free 1-hour call per month. This function is the source of
// truth for that credit. Two actions:
//   action: "status"  -> returns { isPro, hasFreeCredit, used, limit, paidPriceCents }
//   action: "book"    -> if a free credit is available, consumes it and returns
//                        { free: true }. Otherwise returns { free: false,
//                        checkoutUrl } for the discounted $75 paid call.
// Monthly reset mirrors the blueprint-usage reset (UTC month boundary).

const FREE_CALLS_PER_MONTH = 1;
const PAID_CALL_CENTS = 7500; // $75 — already the Pro (40% off) rate for a 1hr call

function needsMonthlyReset(periodStart) {
  if (!periodStart) return true;
  const start = new Date(periodStart);
  if (isNaN(start.getTime())) return true;
  const now = new Date();
  return (
    now.getUTCFullYear() > start.getUTCFullYear() ||
    (now.getUTCFullYear() === start.getUTCFullYear() && now.getUTCMonth() > start.getUTCMonth())
  );
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action = 'status', redirectUrl } = await req.json().catch(() => ({}));

    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ userId: user.id });
    const profile = profiles[0] || null;
    const isPro = profile?.plan === 'pro';

    // Reset the monthly call-credit counter if we've crossed into a new month.
    let used = profile?.callCreditsUsed || 0;
    if (needsMonthlyReset(profile?.callCreditPeriodStart)) used = 0;
    const hasFreeCredit = isPro && used < FREE_CALLS_PER_MONTH;

    if (action === 'status') {
      return Response.json({
        isPro,
        hasFreeCredit,
        used,
        limit: FREE_CALLS_PER_MONTH,
        paidPriceCents: PAID_CALL_CENTS,
      });
    }

    if (action === 'book') {
      if (!isPro) return Response.json({ error: 'Pro membership required.' }, { status: 403 });

      // Free credit available — consume it and let the client proceed to booking.
      if (hasFreeCredit) {
        const updateData = {
          callCreditsUsed: used + 1,
          callCreditPeriodStart: needsMonthlyReset(profile?.callCreditPeriodStart)
            ? new Date().toISOString()
            : (profile?.callCreditPeriodStart || new Date().toISOString()),
        };
        if (profile) {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, updateData);
        } else {
          await base44.asServiceRole.entities.UserProfile.create({
            userId: user.id, email: user.email || '', plan: 'pro', ...updateData,
          });
        }
        return Response.json({ free: true });
      }

      // No free credit left — create a discounted $75 paid checkout link.
      const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
      const baseUrl = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
      const itemName = 'Pro 1-Hour Call (40% off)';
      const metadata = {
        base44UserId: user.id,
        base44UserEmail: user.email,
        itemName,
        serviceId: 'kode_session_1hr',
      };

      const res = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
          'Square-Version': '2025-01-23',
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          checkout_options: { redirect_url: redirectUrl || undefined, ask_for_shipping_address: false },
          pre_populated_data: { buyer_email: user.email },
          payment_note: `${itemName} — ${user.email}`,
          order: {
            location_id: Deno.env.get('SQUARE_LOCATION_ID'),
            metadata,
            line_items: [{ name: itemName, quantity: '1', base_price_money: { amount: PAID_CALL_CENTS, currency: 'USD' } }],
          },
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.payment_link?.url) {
        const detail = body.errors?.[0]?.detail || 'Could not start checkout.';
        return Response.json({ error: detail }, { status: 502 });
      }
      return Response.json({ free: false, checkoutUrl: body.payment_link.url });
    }

    return Response.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});