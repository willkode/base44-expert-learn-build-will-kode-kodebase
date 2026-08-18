import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    if (user.role !== 'admin') return Response.json({ error:'Forbidden' }, { status:403 });
    const body = await req.json();
    if (body.action === 'overview') {
      const [projects,reports,quotes,payments,consultations,rules,settings] = await Promise.all([base44.asServiceRole.entities.MigrationProject.list('-created_date',500),base44.asServiceRole.entities.MigrationReport.list('-created_date',500),base44.asServiceRole.entities.MigrationQuote.list('-created_date',500),base44.asServiceRole.entities.PaymentRecord.list('-created_date',500),base44.asServiceRole.entities.ConsultationRequest.list('-created_date',500),base44.asServiceRole.entities.PricingRule.list('sort_order',500),base44.asServiceRole.entities.MigrationSettings.filter({key:'global'})]);
      const completed = projects.filter(p=>p.scan_status==='completed').length, purchased = reports.filter(r=>r.access_unlocked).length;
      return Response.json({ projects,reports,quotes,payments,consultations,rules,settings:settings[0]||null,stats:{ total_assessments:projects.length, completed_scans:completed, locked_reports:reports.length-purchased, purchased_reports:purchased, report_revenue:payments.filter(p=>p.payment_type==='report'&&p.status==='completed').reduce((s,p)=>s+p.amount,0), quoted_value:quotes.reduce((s,q)=>s+q.total,0), deposits_paid:payments.filter(p=>p.payment_type==='deposit'&&p.status==='completed').reduce((s,p)=>s+p.amount,0), full_payments:payments.filter(p=>p.payment_type==='full'&&p.status==='completed').reduce((s,p)=>s+p.amount,0), consultation_requests:consultations.length, conversion_rate:reports.length?Math.round(purchased/reports.length*100):0, average_quote:quotes.length?Math.round(quotes.reduce((s,q)=>s+q.total,0)/quotes.length):0, reports_requiring_review:projects.filter(p=>p.manual_review_required).length } });
    }
    if (body.action === 'quote_leads') {
      const all = await base44.asServiceRole.entities.ContactMessage.list('-created_date', 500);
      const leads = all.filter((m) => String(m.subject || '').toLowerCase().includes('migration quote'));
      return Response.json({ leads });
    }
    if (body.action === 'send_quote_link') {
      const rows = await base44.asServiceRole.entities.ContactMessage.filter({ id: body.lead_id });
      const lead = rows[0];
      if (!lead) return Response.json({ error: 'Lead not found.' }, { status: 404 });
      const amount = Math.round(Number(body.amount_cents));
      if (!Number.isFinite(amount) || amount < 100 || amount > 5000000) {
        return Response.json({ error: 'Amount must be between $1 and $50,000.' }, { status: 400 });
      }
      const note = String(body.message || '').trim().slice(0, 3000);
      const itemName = String(body.item_name || 'Base44 App Migration — Custom Quote').slice(0, 120);
      const appUrl = Deno.env.get('APP_PUBLIC_URL') || '';
      const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
      const api = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
      const linkRes = await fetch(`${api}/v2/online-checkout/payment-links`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          checkout_options: { redirect_url: appUrl ? `${appUrl}/services/migration-intake` : undefined, ask_for_shipping_address: false },
          pre_populated_data: { buyer_email: lead.email },
          payment_note: `${itemName} — ${lead.email}`,
          order: {
            location_id: Deno.env.get('SQUARE_LOCATION_ID'),
            metadata: { base44UserEmail: lead.email, itemName, serviceId: 'base44_migration_custom', guestCheckout: 'true', guestName: lead.name || 'Migration lead', contactMessageId: lead.id },
            line_items: [{ name: itemName, quantity: '1', base_price_money: { amount, currency: 'USD' } }],
          },
        }),
      });
      const linkBody = await linkRes.json();
      const checkoutUrl = linkBody.payment_link?.url;
      if (!linkRes.ok || !checkoutUrl) {
        return Response.json({ error: linkBody.errors?.[0]?.detail || 'Could not create the payment link.' }, { status: 502 });
      }
      const settingsList = await base44.asServiceRole.entities.EmailSettings.filter({ key: 'global' });
      const emailSettings = settingsList[0] || {};
      const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const html = `<div style="background-color:#0a0f1e;padding:40px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;"><div style="background:linear-gradient(90deg,#f87171,#fb923c,#facc15);height:4px;border-radius:4px 4px 0 0;"></div><div style="background-color:#0d1326;border:1px solid #1e2a45;border-top:none;border-radius:0 0 12px 12px;padding:32px;"><h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Your migration quote</h1><p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#e2e8f0;white-space:pre-wrap;">${esc(note || `Hi ${lead.name}, here's the quote for migrating your app.`)}</p><div style="background-color:#101a33;border:1px solid #1e2a45;border-radius:8px;padding:20px;text-align:center;"><p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fb923c;">${esc(itemName)}</p><p style="margin:0 0 18px;font-size:32px;font-weight:800;color:#ffffff;">$${(amount / 100).toLocaleString()}</p><a href="${checkoutUrl}" style="display:inline-block;background:linear-gradient(90deg,#f87171,#fb923c,#facc15);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:9999px;text-decoration:none;">Pay &amp; Start My Migration</a></div><p style="margin:24px 0 0;font-size:12px;color:#64748b;text-align:center;">Secure one-time payment via Square. Reply to this email with any questions.</p></div></div></div>`;
      const mailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `${emailSettings.resendFromName || 'KodeBase'} <${emailSettings.resendFromEmail || 'onboarding@resend.dev'}>`,
          to: [lead.email],
          subject: `Your migration quote — $${(amount / 100).toLocaleString()}`,
          html,
        }),
      });
      if (!mailRes.ok) {
        const detail = await mailRes.text();
        return Response.json({ error: 'Payment link created but the email failed to send.', checkoutUrl, detail }, { status: 502 });
      }
      await base44.asServiceRole.entities.ContactMessage.update(lead.id, {
        status: 'replied',
        quoteAmountCents: amount,
        quoteMessage: note,
        quotePaymentLinkUrl: checkoutUrl,
        quoteSentAt: new Date().toISOString(),
      });
      return Response.json({ success: true, checkoutUrl });
    }
    if (body.action === 'project_detail') {
      const projects = await base44.asServiceRole.entities.MigrationProject.filter({ id: body.project_id });
      if (!projects[0]) return Response.json({ error: 'Project not found.' }, { status: 404 });
      const scans = await base44.asServiceRole.entities.RepositoryScan.filter({ project_id: body.project_id }, '-created_date', 20);
      const findings = await base44.asServiceRole.entities.ScanFinding.filter({ project_id: body.project_id }, '-created_date', 500);
      const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id: body.project_id }, '-report_version', 20);
      const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ project_id: body.project_id }, '-version', 20);
      const lineItems = quotes[0] ? await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quotes[0].id }, 'sort_order', 200) : [];
      const payments = await base44.asServiceRole.entities.PaymentRecord.filter({ project_id: body.project_id }, '-created_date', 100);
      return Response.json({ project: projects[0], scans, findings, reports, quotes, line_items: lineItems, payments });
    }
    if (body.action === 'save_settings') {
      const rows = await base44.asServiceRole.entities.MigrationSettings.filter({key:'global'});
      const data = {...body.settings,key:'global',report_price:Math.max(2500,Number(body.settings.report_price||2500)),base_migration_price:Math.max(200000,Number(body.settings.base_migration_price||200000))};
      const saved = rows[0] ? await base44.asServiceRole.entities.MigrationSettings.update(rows[0].id,data) : await base44.asServiceRole.entities.MigrationSettings.create(data);
      return Response.json({settings:saved});
    }
    if (body.action === 'save_rule') {
      const rule = body.rule || {};
      if (!rule.name || !rule.category || !rule.rule_type) return Response.json({error:'Rule name, category, and type are required.'},{status:400});
      const clean = {...rule}; delete clean.id; delete clean.created_date; delete clean.updated_date; delete clean.created_by_id;
      const saved = body.rule.id ? await base44.asServiceRole.entities.PricingRule.update(body.rule.id,clean) : await base44.asServiceRole.entities.PricingRule.create(clean);
      return Response.json({rule:saved});
    }
    if (body.action === 'update_project') {
      const rows = await base44.asServiceRole.entities.MigrationProject.filter({id:body.project_id}); if(!rows[0]) return Response.json({error:'Not found'},{status:404});
      const allowed = ['manual_review_required','lead_status','assigned_admin_id','internal_notes','archived']; const patch={}; allowed.forEach(k=>{if(k in body.patch)patch[k]=body.patch[k]});
      await base44.asServiceRole.entities.MigrationProject.update(body.project_id,patch); await base44.asServiceRole.entities.MigrationAuditLog.create({admin_id:user.id,project_id:body.project_id,action:'project_updated',entity_type:'MigrationProject',entity_id:body.project_id,previous_value:rows[0],new_value:patch}); return Response.json({success:true});
    }
    if (body.action === 'entitlement') {
      const reports=await base44.asServiceRole.entities.MigrationReport.filter({id:body.report_id}); const report=reports[0]; if(!report)return Response.json({error:'Report not found'},{status:404});
      const grants=await base44.asServiceRole.entities.ReportEntitlement.filter({report_id:report.id,user_id:report.user_id});
      if(body.grant){ if(grants[0])await base44.asServiceRole.entities.ReportEntitlement.update(grants[0].id,{access_status:'active',granted_at:new Date().toISOString(),revoked_at:'',granted_by_admin_id:user.id}); else await base44.asServiceRole.entities.ReportEntitlement.create({user_id:report.user_id,project_id:report.project_id,report_id:report.id,access_status:'active',granted_at:new Date().toISOString(),granted_by_admin_id:user.id}); await base44.asServiceRole.entities.MigrationReport.update(report.id,{access_unlocked:true,unlocked_at:new Date().toISOString()}); } else { if(grants[0])await base44.asServiceRole.entities.ReportEntitlement.update(grants[0].id,{access_status:'revoked',revoked_at:new Date().toISOString()}); await base44.asServiceRole.entities.MigrationReport.update(report.id,{access_unlocked:false}); }
      await base44.asServiceRole.entities.MigrationAuditLog.create({admin_id:user.id,project_id:report.project_id,action:body.grant?'report_access_granted':'report_access_revoked',entity_type:'MigrationReport',entity_id:report.id}); return Response.json({success:true});
    }
    if (body.action === 'update_report') {
      const rows = await base44.asServiceRole.entities.MigrationReport.filter({ id: body.report_id });
      const report = rows[0];
      if (!report) return Response.json({ error: 'Report not found.' }, { status: 404 });
      if (!body.full_report || typeof body.full_report !== 'object') return Response.json({ error: 'Valid report content is required.' }, { status: 400 });
      await base44.asServiceRole.entities.MigrationReport.update(report.id, { full_report: body.full_report, report_version: (report.report_version || 1) + 1, last_regenerated_at: new Date().toISOString(), pdf_file_uri: '' });
      await base44.asServiceRole.entities.MigrationAuditLog.create({ admin_id: user.id, project_id: report.project_id, action: 'report_edited', entity_type: 'MigrationReport', entity_id: report.id, previous_value: { report_version: report.report_version }, new_value: { report_version: (report.report_version || 1) + 1 } });
      return Response.json({ success: true });
    }
    if (body.action === 'update_line_item') {
      const rows = await base44.asServiceRole.entities.QuoteLineItem.filter({ id: body.line_item_id });
      const item = rows[0];
      if (!item) return Response.json({ error: 'Line item not found.' }, { status: 404 });
      const patch = { title: String(body.patch?.title || item.title), description: String(body.patch?.description || item.description || ''), quantity: Math.max(0, Number(body.patch?.quantity ?? item.quantity)), unit_price: Math.max(0, Number(body.patch?.unit_price ?? item.unit_price)), amount: Math.max(0, Number(body.patch?.amount ?? item.amount)), is_optional: !!(body.patch?.is_optional ?? item.is_optional) };
      await base44.asServiceRole.entities.QuoteLineItem.update(item.id, patch);
      const all = await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: item.quote_id }, 'sort_order', 200);
      const subtotal = all.reduce((s, x) => s + (x.id === item.id ? patch.amount : x.amount || 0), 0);
      const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ id: item.quote_id });
      const quote = quotes[0];
      if (quote) {
        const total = Math.max(200000, subtotal - (quote.discount_amount || 0));
        await base44.asServiceRole.entities.MigrationQuote.update(quote.id, { subtotal, total, deposit_amount: Math.round(total * quote.deposit_percentage / 100), midpoint_amount: Math.round(total * quote.midpoint_percentage / 100), final_amount: total - Math.round(total * quote.deposit_percentage / 100) - Math.round(total * quote.midpoint_percentage / 100), balance_due: total - (quote.amount_paid || 0), version: (quote.version || 1) + 1, version_history: [...(quote.version_history || []), { version: quote.version, total: quote.total, status: quote.status, captured_at: new Date().toISOString() }] });
      }
      return Response.json({ success: true });
    }
    if (body.action === 'payment_notes') {
      const rows = await base44.asServiceRole.entities.PaymentRecord.filter({ id: body.payment_id });
      if (!rows[0]) return Response.json({ error: 'Payment not found.' }, { status: 404 });
      await base44.asServiceRole.entities.PaymentRecord.update(body.payment_id, { internal_notes: String(body.notes || '') });
      return Response.json({ success: true });
    }
    if (body.action === 'refund_payment') {
      const rows = await base44.asServiceRole.entities.PaymentRecord.filter({ id: body.payment_id });
      const record = rows[0];
      if (!record || record.status !== 'completed' || !record.provider_transaction_id) return Response.json({ error: 'Completed payment not found.' }, { status: 404 });
      const amount = body.amount ? Math.min(record.amount, Math.max(1, Number(body.amount))) : record.amount;
      const env = Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox';
      const api = env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
      const response = await fetch(`${api}/v2/refunds`, { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('SQUARE_ACCESS_TOKEN')}`, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' }, body: JSON.stringify({ idempotency_key: crypto.randomUUID(), payment_id: record.provider_transaction_id, amount_money: { amount, currency: record.currency || 'USD' }, reason: 'Migration Planner administrator refund' }) });
      const result = await response.json();
      if (!response.ok) return Response.json({ error: result.errors?.[0]?.detail || 'Refund failed.' }, { status: 502 });
      await base44.asServiceRole.entities.PaymentRecord.update(record.id, { status: amount >= record.amount ? 'refunded' : 'completed', refunded_at: new Date().toISOString(), refund_amount: (record.refund_amount || 0) + amount });
      if (record.payment_type === 'report' && amount >= record.amount) {
        const grants = await base44.asServiceRole.entities.ReportEntitlement.filter({ payment_id: record.id });
        if (grants[0]) await base44.asServiceRole.entities.ReportEntitlement.update(grants[0].id, { access_status: 'revoked', revoked_at: new Date().toISOString() });
        if (record.report_id) await base44.asServiceRole.entities.MigrationReport.update(record.report_id, { access_unlocked: false });
      }
      await base44.asServiceRole.entities.MigrationAuditLog.create({ admin_id: user.id, project_id: record.project_id, action: 'payment_refunded', entity_type: 'PaymentRecord', entity_id: record.id, metadata: { amount, refund_id: result.refund?.id || '' } });
      return Response.json({ success: true });
    }
    if (body.action === 'update_quote') {
      const rows=await base44.asServiceRole.entities.MigrationQuote.filter({id:body.quote_id}); const old=rows[0]; if(!old)return Response.json({error:'Quote not found'},{status:404});
      const allowed=['status','discount_amount','estimated_duration','expiration_date','admin_notes','deposit_percentage','midpoint_percentage','final_percentage']; const patch={}; allowed.forEach(k=>{if(k in body.patch)patch[k]=body.patch[k]}); const total=Math.max(200000,old.subtotal-Number(patch.discount_amount??old.discount_amount??0)); patch.total=total; patch.deposit_amount=Math.round(total*Number(patch.deposit_percentage??old.deposit_percentage)/100); patch.midpoint_amount=Math.round(total*Number(patch.midpoint_percentage??old.midpoint_percentage)/100); patch.final_amount=total-patch.deposit_amount-patch.midpoint_amount; patch.balance_due=total-(old.amount_paid||0); patch.version=(old.version||1)+1; patch.version_history=[...(old.version_history||[]),{version:old.version,total:old.total,status:old.status,captured_at:new Date().toISOString()}];
      await base44.asServiceRole.entities.MigrationQuote.update(old.id,patch); await base44.asServiceRole.entities.MigrationAuditLog.create({admin_id:user.id,project_id:old.project_id,action:'quote_revised',entity_type:'MigrationQuote',entity_id:old.id,previous_value:old,new_value:patch}); return Response.json({success:true});
    }
    return Response.json({error:'Invalid request.'},{status:400});
  } catch(error){return Response.json({error:error.message},{status:500});}
});