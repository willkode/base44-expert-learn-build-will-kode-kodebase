export const CAMPAIGN = "migration-first10-oct2026";
export const LIMIT = 10;
const HOLD_MS = 30 * 60 * 1000;

export function promoError(message, status = 503) {
  return Object.assign(new Error(message), { status });
}
export async function readPromotion(base44) {
  const rows = await base44.asServiceRole.entities.MigrationPromotion.filter({ campaign: CAMPAIGN });
  if (rows.length !== 1 || rows[0].slots?.length !== LIMIT) throw promoError("Offer availability is temporarily unavailable. Please try again.");
  return rows[0];
}
// Conditional revision update serializes allocation across concurrent function instances.
export async function mutatePromotion(base44, change) {
  for (let i = 0; i < 12; i++) {
    const row = await readPromotion(base44);
    const slots = structuredClone(row.slots);
    const result = change(slots);
    if (result === false) return false;
    const update = await base44.asServiceRole.entities.MigrationPromotion.updateMany(
      { id: row.id, campaign: CAMPAIGN, revision: row.revision },
      { $set: { slots, revision: row.revision + 1 } }
    );
    if (update.updated === 1) return result;
  }
  throw promoError("Checkout is busy. Please try again.");
}
export function publicStatus(row) {
  const claimed = row.slots.filter(s => s.state === "paid").length;
  const held = row.slots.filter(s => s.state === "held").length;
  const remaining = row.slots.filter(s => s.state === "available").length;
  return { campaign: CAMPAIGN, total: LIMIT, claimed, held, remaining,
    saleActive: remaining > 0, soldOut: claimed === LIMIT, price: remaining > 0 ? 50 : 199 };
}
export async function square(path, options = {}) {
  const origin = Deno.env.get("SQUARE_ENVIRONMENT") === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
  const response = await fetch(origin + path, {
    ...options,
    headers: { Authorization: "Bearer " + Deno.env.get("SQUARE_ACCESS_TOKEN"), "Content-Type": "application/json", "Square-Version": "2025-01-23" },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json();
  if (!response.ok) throw promoError("Payment provider is temporarily unavailable. Please try again.");
  return body;
}
export async function ensureLink(base44, slot) {
  if (slot.link_id && slot.order_id && slot.checkout_url) return slot;
  // The exact request is saved before the network call. Retry with the same
  // idempotency key after ambiguous provider responses or interrupted requests.
  const body = await square("/v2/online-checkout/payment-links", { method: "POST", body: JSON.stringify(slot.request) });
  const link = body.payment_link;
  if (!link?.id || !link?.url || !link?.order_id) throw promoError("Could not prepare checkout. Please try again.");
  await mutatePromotion(base44, slots => {
    const current = slots.find(s => s.token === slot.token);
    if (!current) return false;
    Object.assign(current, { link_id: link.id, checkout_url: link.url, order_id: link.order_id });
    return true;
  });
  return { ...slot, link_id: link.id, checkout_url: link.url, order_id: link.order_id };
}
export async function completePromotion(base44, payment, metadata = {}) {
  if (payment.status !== "COMPLETED") return;
  const amount = Number(payment.amount_money?.amount);
  if (![5000, 14900].includes(amount) || payment.amount_money?.currency !== "USD") return;
  await mutatePromotion(base44, slots => {
    const slot = slots.find(s => s.state === "held" && (
      (s.order_id && s.order_id === payment.order_id) ||
      (metadata.migrationPromo === CAMPAIGN && s.token === metadata.migrationPromoToken)
    ));
    if (!slot || slot.amount_cents !== amount) return false;
    Object.assign(slot, { state: "paid", payment_id: payment.id, paid_at: new Date().toISOString() });
    delete slot.request;
    return true;
  });
}
async function inspectPayments(order) {
  const ids = [...new Set((order.tenders || []).map(t => t.payment_id).filter(Boolean))];
  const payments = [];
  for (const id of ids) payments.push((await square("/v2/payments/" + encodeURIComponent(id))).payment);
  return { payments, pending: payments.some(p => !p || !["COMPLETED", "CANCELED", "FAILED"].includes(p.status)) };
}
export async function reconcilePromotion(base44) {
  const row = await readPromotion(base44);
  for (const old of row.slots.filter(s => s.state === "held" && s.expires_at <= Date.now())) {
    try {
      const slot = await ensureLink(base44, old);
      let order = (await square("/v2/orders/" + encodeURIComponent(slot.order_id))).order;
      if (!order) continue;
      let check = await inspectPayments(order);
      const paid = check.payments.find(p => p?.status === "COMPLETED");
      if (paid) { await completePromotion(base44, paid, order.metadata); continue; }
      if (check.pending || order.state === "COMPLETED") continue;
      // Deleting a Square payment link cancels its order. Never release a
      // hold until a fresh read confirms cancellation and no pending payment.
      await square("/v2/online-checkout/payment-links/" + encodeURIComponent(slot.link_id), { method: "DELETE" });
      order = (await square("/v2/orders/" + encodeURIComponent(slot.order_id))).order;
      if (!order) continue;
      check = await inspectPayments(order);
      const latePaid = check.payments.find(p => p?.status === "COMPLETED");
      if (latePaid) { await completePromotion(base44, latePaid, order.metadata); continue; }
      if (order.state !== "CANCELED" || check.pending || check.payments.some(p => !["CANCELED", "FAILED"].includes(p.status))) continue;
      await mutatePromotion(base44, slots => {
        const index = slots.findIndex(s => s.token === slot.token && s.state === "held");
        if (index < 0) return false;
        slots[index] = { number: slots[index].number, state: "available" };
        return true;
      });
    } catch (error) {
      // Fail closed: provider uncertainty cannot create an extra discounted slot.
      console.error("[migrationPromotion] Hold reconciliation deferred", old.number, error.message);
    }
  }
  return readPromotion(base44);
}
export async function reservePromotion(base44, buyerEmail, serviceId, request) {
  const buyerKey = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",
    new TextEncoder().encode(buyerEmail.trim().toLowerCase())))).map(b => b.toString(16).padStart(2, "0")).join("");
  const token = crypto.randomUUID();
  await reconcilePromotion(base44);
  const slot = await mutatePromotion(base44, slots => {
    if (slots.some(s => s.buyer_key === buyerKey && s.state === "paid")) throw promoError("This offer is limited to one discounted migration per customer.", 409);
    const existing = slots.find(s => s.buyer_key === buyerKey && s.state === "held");
    if (existing) {
      if (existing.service_id !== serviceId) throw promoError("You already have a checkout hold with different mobile options. Complete that checkout or retry after the 30-minute hold expires.", 409);
      if (existing.expires_at <= Date.now()) throw promoError("Your previous checkout is being released. Please try again shortly.", 409);
      return existing;
    }
    const available = slots.find(s => s.state === "available");
    if (!available) throw promoError("All promotional spots are purchased or temporarily held at checkout. Refresh availability before ordering.", 409);
    const amount = serviceId === "base44_migration_mobile" ? 14900 : 5000;
    request.idempotency_key = token;
    request.order.metadata.migrationPromo = CAMPAIGN;
    request.order.metadata.migrationPromoToken = token;
    Object.assign(available, { state: "held", token, buyer_key: buyerKey, service_id: serviceId,
      amount_cents: amount, expires_at: Date.now() + HOLD_MS, request });
    return structuredClone(available);
  });
  const linked = await ensureLink(base44, slot);
  return { success: true, checkoutUrl: linked.checkout_url, paymentLinkId: linked.link_id,
    orderId: linked.order_id, holdExpiresAt: linked.expires_at };
}
