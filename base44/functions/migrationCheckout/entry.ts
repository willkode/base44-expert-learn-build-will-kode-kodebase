import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { project_id, payment_type, redirect_url, coupon_code } = await req.json();
    const ownedProjects = await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 500);
    const project = ownedProjects.find((p) => p.id === project_id);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id, user_id: user.id }, '-report_version', 1);
    const report = reports[0];
    if (!report) return Response.json({ error: 'Complete the repository scan first.' }, { status: 409 });
    const settingsRows = await base44.asServiceRole.entities.MigrationSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || { report_price: 2500, allow_full_payment_without_approval: false };
    let amount = 0, quote = null, itemName = '';
    if (payment_type === 'report') {
      const grants = await base44.asServiceRole.entities.ReportEntitlement.filter({ project_id, report_id: report.id, user_id: user.id, access_status: 'active' });
      if (grants.length) return Response.json({ already_unlocked: true });
      const normalizedCoupon = String(coupon_code || '').trim().toLowerCase();
      if (normalizedCoupon) {
        if (normalizedCoupon !== 'modfam4life') return Response.json({ error: 'This coupon code is not valid.' }, { status: 400 });
        const payment = await base44.asServiceRole.entities.PaymentRecord.create({ user_id: user.id, project_id, report_id: report.id, payment_type: 'report', provider: 'coupon', amount: 0, currency: 'USD', status: 'completed', webhook_verified: false, paid_at: new Date().toISOString(), metadata: { coupon: 'moderator_full_report' } });
        await base44.asServiceRole.entities.ReportEntitlement.create({ user_id: user.id, project_id, report_id: report.id, payment_id: payment.id, access_status: 'active', granted_at: new Date().toISOString() });
        await base44.asServiceRole.entities.MigrationReport.update(report.id, { access_unlocked: true, unlocked_at: new Date().toISOString() });
        await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id: user.id, project_id, action: 'moderator_coupon_applied', entity_type: 'ReportEntitlement', entity_id: report.id, metadata: { payment_id: payment.id } });
        return Response.json({ already_unlocked: true, coupon_applied: true });
      }
      amount = Math.max(2500, Number(settings.report_price || 2500));
      itemName = `Migration Plan — ${project.application_name}`;
    } else {
      const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ project_id, user_id: user.id }, '-version', 1);
      quote = quotes[0];
      if (!quote) return Response.json({ error: 'Quote not found.' }, { status: 404 });
      if (quote.status === 'expired' || new Date(quote.expiration_date) < new Date()) return Response.json({ error: 'This quote has expired.' }, { status: 409 });
      if (quote.manual_review_required && quote.status !== 'approved') return Response.json({ error: 'This quote requires administrator approval before payment.' }, { status: 409 });
      if (payment_type === 'deposit') amount = Math.max(0, quote.deposit_amount - quote.amount_paid);
      else if (payment_type === 'full') {
        if (!settings.allow_full_payment_without_approval && quote.status !== 'approved') return Response.json({ error: 'Full payment requires quote approval.' }, { status: 409 });
        amount = quote.balance_due;
      } else return Response.json({ error: 'Invalid payment type.' }, { status: 400 });
      itemName = payment_type === 'deposit' ? `Migration Deposit — ${project.application_name}` : `Migration Full Payment — ${project.application_name}`;
    }
    if (!Number.isFinite(amount) || amount <= 0) return Response.json({ error: 'No balance is due.' }, { status: 400 });
    const pending = await base44.asServiceRole.entities.PaymentRecord.filter({ project_id, user_id: user.id, payment_type, status: 'pending' }, '-created_date', 1);
    const idempotencyKey = pending[0]?.idempotency_key || crypto.randomUUID();
    const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
    const api = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const response = await fetch(`${api}/v2/online-checkout/payment-links`, { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' }, body: JSON.stringify({ idempotency_key: idempotencyKey, checkout_options: { redirect_url: redirect_url || undefined, ask_for_shipping_address: false }, pre_populated_data: { buyer_email: user.email }, order: { location_id: Deno.env.get('SQUARE_LOCATION_ID'), metadata: { migrationProjectId: project.id, migrationReportId: report.id, migrationQuoteId: quote?.id || '', migrationUserId: user.id, migrationPaymentType: payment_type, migrationAmount: String(amount) }, line_items: [{ name: itemName, quantity: '1', base_price_money: { amount, currency: 'USD' } }] } }) });
    const data = await response.json();
    if (!response.ok || !data.payment_link?.url) throw new Error(data.errors?.[0]?.detail || 'Could not start checkout.');
    if (pending[0]) await base44.asServiceRole.entities.PaymentRecord.update(pending[0].id, { provider_checkout_id: data.payment_link.id, amount });
    else await base44.asServiceRole.entities.PaymentRecord.create({ user_id: user.id, project_id, report_id: report.id, quote_id: quote?.id || '', payment_type, provider: 'square', provider_checkout_id: data.payment_link.id, amount, currency: 'USD', status: 'pending', idempotency_key: idempotencyKey, webhook_verified: false });
    return Response.json({ checkout_url: data.payment_link.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});