import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { project_id, internal } = await req.json();
    const projectRows = internal && user.role === 'admin' ? await base44.asServiceRole.entities.MigrationProject.filter({ id: project_id }) : await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 500);
    const project = internal && user.role === 'admin' ? projectRows[0] : projectRows.find((p) => p.id === project_id);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    const scans = await base44.asServiceRole.entities.RepositoryScan.filter({ project_id }, '-created_date', 1);
    const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id }, '-report_version', 1);
    if (!scans[0] || !reports[0]) return Response.json({ error: 'Scan and report are required.' }, { status: 409 });
    const scan = scans[0], report = reports[0];
    const settingsRows = await base44.asServiceRole.entities.MigrationSettings.filter({ key: 'global' });
    const settings = settingsRows[0] || { base_migration_price: 200000, deposit_percentage: 33, midpoint_percentage: 33, final_percentage: 34, quote_expiration_days: 30 };
    const rules = await base44.asServiceRole.entities.PricingRule.filter({ is_active: true }, 'sort_order', 200);
    const inventory = scan.raw_inventory || {};
    const metrics = { entities: scan.entities_detected || 0, functions: scan.functions_detected || 0, integrations: scan.integrations_detected || 0, roles: inventory.roles?.length || 0, oauth: inventory.oauthProviders?.length || 0, automations: scan.automations_detected || 0, security: (scan.critical_findings_count || 0) + (scan.high_findings_count || 0), realtime: scan.realtime_detected ? 1 : 0, payments: scan.payment_features_detected ? 1 : 0, ai: inventory.features?.includes('AI/LLM') ? 1 : 0, agents: inventory.features?.includes('AI agents') ? 1 : 0 };
    const items = [{ pricing_rule_id: '', category: 'base', title: 'Base migration setup', description: 'Core infrastructure, migration foundation, deployment, and handoff.', quantity: 1, unit_price: Math.max(200000, Number(settings.base_migration_price || 200000)), amount: Math.max(200000, Number(settings.base_migration_price || 200000)), calculation_source: 'Configured base migration price', sort_order: 0, is_optional: false }];
    for (const rule of rules) {
      if (rule.category === 'base') continue;
      const key = rule.condition_config?.metric || rule.category;
      const qty = Number(metrics[key] || 0);
      if (rule.rule_type === 'manual_review') continue;
      let amount = rule.rule_type === 'flat' ? Number(rule.base_amount || 0) : Math.max(0, qty - Number(rule.included_quantity || 0)) * Number(rule.per_unit_amount || 0);
      if (rule.minimum_amount) amount = Math.max(amount, Number(rule.minimum_amount));
      if (rule.maximum_amount) amount = Math.min(amount, Number(rule.maximum_amount));
      if (amount > 0) items.push({ pricing_rule_id: rule.id, category: rule.category, title: rule.name, description: rule.description || `Added because the scan detected ${qty} ${rule.category}.`, quantity: rule.rule_type === 'flat' ? 1 : Math.max(0, qty - Number(rule.included_quantity || 0)), unit_price: rule.rule_type === 'flat' ? amount : Number(rule.per_unit_amount || 0), amount: Math.round(amount), calculation_source: `Detected ${qty}; rule ${rule.rule_type}`, sort_order: Number(rule.sort_order || 0), is_optional: false });
    }
    const manual = project.complexity_level === 'Enterprise' || !!project.manual_review_required || (scan.critical_findings_count || 0) > 0;
    const subtotal = Math.max(200000, items.reduce((s, i) => s + i.amount, 0));
    const previous = await base44.asServiceRole.entities.MigrationQuote.filter({ project_id }, '-version', 1);
    const version = (previous[0]?.version || 0) + 1;
    const expiration = new Date(Date.now() + Number(settings.quote_expiration_days || 30) * 86400000).toISOString();
    const depositPct = Number(settings.deposit_percentage || 33), midpointPct = Number(settings.midpoint_percentage || 33), finalPct = Number(settings.final_percentage || 34);
    const quote = await base44.asServiceRole.entities.MigrationQuote.create({ project_id, report_id: report.id, user_id: project.user_id, quote_number: `MIG-${new Date().getUTCFullYear()}-${project.id.slice(-6).toUpperCase()}-V${version}`, version, status: manual ? 'manual_review' : 'presented', manual_review_required: manual, subtotal, discount_amount: 0, total: subtotal, deposit_percentage: depositPct, deposit_amount: Math.round(subtotal * depositPct / 100), midpoint_percentage: midpointPct, midpoint_amount: Math.round(subtotal * midpointPct / 100), final_percentage: finalPct, final_amount: subtotal - Math.round(subtotal * depositPct / 100) - Math.round(subtotal * midpointPct / 100), amount_paid: 0, balance_due: subtotal, estimated_duration: report.estimated_timeline || '6–12 weeks', expiration_date: expiration, scope_summary: `Migration of ${project.application_name}: ${scan.entities_detected || 0} entities, ${scan.functions_detected || 0} backend functions, and ${scan.integrations_detected || 0} integrations.`, payment_status: 'unpaid', version_history: previous[0] ? [{ version: previous[0].version, total: previous[0].total, status: previous[0].status, captured_at: new Date().toISOString() }] : [] });
    await base44.asServiceRole.entities.QuoteLineItem.bulkCreate(items.map((i) => ({ ...i, quote_id: quote.id })));
    await base44.functions.invoke('migrationNotify', { project_id, event: previous[0] ? 'quote_revised' : 'quote_created' });
    return Response.json({ quote, line_items: items });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});