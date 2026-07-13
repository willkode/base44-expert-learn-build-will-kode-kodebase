import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const reportSchema = { type:'object', properties:{ executive_summary:{type:'object'}, architecture_inventory:{type:'object'}, base44_dependency_map:{type:'object'}, recommended_target_architecture:{type:'object'}, database_migration_plan:{type:'object'}, authentication_migration_plan:{type:'object'}, backend_function_migration_plan:{type:'object'}, integration_migration_plan:{type:'object'}, storage_migration_plan:{type:'object'}, realtime_and_automation_plan:{type:'object'}, security_remediation_plan:{type:'object'}, phased_migration_roadmap:{type:'array',items:{type:'object'}}, testing_checklist:{type:'array',items:{type:'string'}}, next_actions:{type:'array',items:{type:'string'}} }, required:['executive_summary','architecture_inventory','base44_dependency_map','recommended_target_architecture','database_migration_plan','authentication_migration_plan','backend_function_migration_plan','integration_migration_plan','storage_migration_plan','realtime_and_automation_plan','security_remediation_plan','phased_migration_roadmap','testing_checklist','next_actions'] };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { project_id, webhook_internal } = await req.json();
    const projects = await base44.asServiceRole.entities.MigrationProject.filter({ id:project_id });
    const project = projects[0];
    if (!project || (!webhook_internal && user.role !== 'admin' && project.user_id !== user.id)) return Response.json({ error:'Project not found.' }, { status:404 });
    const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id, user_id:project.user_id }, '-report_version', 1);
    const report = reports[0];
    if (!report) return Response.json({ error:'Report not found.' }, { status:404 });
    const entitlements = await base44.asServiceRole.entities.ReportEntitlement.filter({ project_id, report_id:report.id, user_id:project.user_id, access_status:'active' });
    if (!entitlements.length && user.role !== 'admin') return Response.json({ error:'Report access is locked.' }, { status:403 });
    if (report.status === 'ready' && report.full_report && !webhook_internal) return Response.json({ report_id:report.id, ready:true });
    if (report.status === 'generating') return Response.json({ report_id:report.id, generating:true });
    await base44.asServiceRole.entities.MigrationReport.update(report.id, { status:'generating' });
    const scans = await base44.asServiceRole.entities.RepositoryScan.filter({ id:report.scan_id });
    const scan = scans[0];
    const findings = await base44.asServiceRole.entities.ScanFinding.filter({ scan_id:report.scan_id }, '-severity', 200);
    const safeInventory = scan.raw_inventory || {};
    const prompt = `Create a detailed, actionable Base44 application migration plan. Use only the deterministic inventory supplied. Never invent source files, dependencies, providers, or findings. Never reveal or reconstruct secrets. Existing password hashes may not be portable and users may need password resets. Include all 15 requested sections with practical details, risks, tests, phased durations, dependencies and deliverables. Application: ${JSON.stringify({ name:project.application_name, users:project.current_user_count, records:project.estimated_record_count, production:project.production_status, desired_timeline:project.desired_timeline, preferred_stack:project.preferred_stack, preferred_hosting:project.preferred_hosting })}. Preview: ${JSON.stringify(report.preview_summary)}. Inventory: ${JSON.stringify(safeInventory).slice(0,80000)}. Redacted findings: ${JSON.stringify(findings.map(f=>({severity:f.severity,title:f.title,file_path:f.file_path,description:f.description,recommendation:f.recommendation,migration_phase:f.migration_phase}))).slice(0,40000)}.`;
    const full = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt, response_json_schema:reportSchema });
    await base44.asServiceRole.entities.MigrationReport.update(report.id, { status:'ready', full_report:full, access_unlocked:true, unlocked_at:report.unlocked_at || new Date().toISOString(), last_regenerated_at:new Date().toISOString() });
    const quoteResponse = await base44.functions.invoke('generateMigrationQuote', { project_id, internal:true });
    await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id:project.user_id, admin_id:user.role === 'admin' ? user.id : '', project_id, action:'full_report_generated', entity_type:'MigrationReport', entity_id:report.id, metadata:{ quote_id:quoteResponse.data?.quote?.id || '' } });
    return Response.json({ report_id:report.id, ready:true, quote_id:quoteResponse.data?.quote?.id || null });
  } catch (error) {
    return Response.json({ error:error.message }, { status:500 });
  }
});