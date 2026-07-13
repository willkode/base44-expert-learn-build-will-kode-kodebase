import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { project_id } = await req.json();
    const ownedProjects = await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 500);
    const project = ownedProjects.find((p) => p.id === project_id);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id, user_id: user.id }, '-report_version', 1);
    const report = reports[0];
    const scans = await base44.asServiceRole.entities.RepositoryScan.filter({ project_id, user_id: user.id }, '-created_date', 1);
    const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ project_id, user_id: user.id }, '-version', 1);
    const lineItems = quotes[0] ? await base44.asServiceRole.entities.QuoteLineItem.filter({ quote_id: quotes[0].id }, 'sort_order', 200) : [];
    const paymentsRaw = await base44.asServiceRole.entities.PaymentRecord.filter({ project_id, user_id: user.id }, '-created_date', 20);
    const payments = paymentsRaw.map((p) => ({ id:p.id, payment_type:p.payment_type, amount:p.amount, currency:p.currency, status:p.status, paid_at:p.paid_at, refunded_at:p.refunded_at, refund_amount:p.refund_amount }));
    let entitled = false;
    if (report) {
      const grants = await base44.asServiceRole.entities.ReportEntitlement.filter({ project_id, report_id: report.id, user_id: user.id, access_status: 'active' });
      entitled = grants.length > 0;
    }
    const { internal_notes, assigned_admin_id, authorization_metadata, zip_file_uri, ...safeProject } = project;
    const safeQuote = quotes[0] ? (({ admin_notes, version_history, approved_by_admin_id, ...q }) => q)(quotes[0]) : null;
    return Response.json({ project:safeProject, scan: scans[0] ? { id: scans[0].id, status: scans[0].status, files_reviewed: scans[0].files_reviewed, entities_detected: scans[0].entities_detected, functions_detected: scans[0].functions_detected, integrations_detected: scans[0].integrations_detected, auth_methods_detected: scans[0].auth_methods_detected, automations_detected: scans[0].automations_detected, realtime_detected: scans[0].realtime_detected, payment_features_detected: scans[0].payment_features_detected, security_findings_count: scans[0].security_findings_count, completed_at: scans[0].completed_at } : null, report: report ? { id: report.id, status: report.status, preview_summary: report.preview_summary, readiness_score: report.readiness_score, complexity_level: report.complexity_level, recommended_stack: report.recommended_stack, estimated_timeline: report.estimated_timeline, report_version: report.report_version, generated_at: report.generated_at, full_report: entitled ? report.full_report : null } : null, entitled, quote: safeQuote, quote_line_items: lineItems, payments });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});