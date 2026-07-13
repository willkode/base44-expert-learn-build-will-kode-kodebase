import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const DISCLAIMER = 'This is an independent migration planning and development service. It is not affiliated with, endorsed by, or sponsored by Base44 or Wix. Users must own or have authorization to analyze all repositories and application data submitted to this service.';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const action = body.action;
    if (action === 'list') {
      const projects = await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 100);
      const payments = await base44.asServiceRole.entities.PaymentRecord.filter({ user_id: user.id }, '-created_date', 200);
      const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ user_id: user.id }, '-version', 200);
      const reports = await base44.asServiceRole.entities.MigrationReport.filter({ user_id: user.id }, '-report_version', 200);
      const enriched = projects.map((p) => {
        const quote = quotes.find((q) => q.project_id === p.id);
        const report = reports.find((r) => r.project_id === p.id);
        const paid = payments.find((x) => x.project_id === p.id && x.status === 'completed');
        const { internal_notes, assigned_admin_id, authorization_metadata, zip_file_uri, ...safeProject } = p;
        return { ...safeProject, quote_total: quote?.total || 0, quote_status: quote?.status || 'pending', payment_status: quote?.payment_status || (paid ? 'report_paid' : 'unpaid'), report_status: report?.status || 'pending' };
      });
      return Response.json({ projects: enriched, payments });
    }
    if (action === 'create') {
      const confirmations = body.confirmations || {};
      if (!confirmations.ownership || !confirmations.sourceOnly || !confirmations.authorizedData) return Response.json({ error: 'All authorization confirmations are required.' }, { status: 400 });
      if (!body.application_name?.trim()) return Response.json({ error: 'Application name is required.' }, { status: 400 });
      if (body.repository_source === 'github' && (!body.github_owner || !body.github_repository || !body.github_branch)) return Response.json({ error: 'Select a repository and branch.' }, { status: 400 });
      if (body.repository_source === 'zip' && !body.zip_file_uri) return Response.json({ error: 'Upload an exported ZIP file.' }, { status: 400 });
      const now = new Date().toISOString();
      const forwarded = req.headers.get('x-forwarded-for') || '';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(forwarded));
      const ipHash = forwarded ? Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('') : '';
      const project = await base44.asServiceRole.entities.MigrationProject.create({
        user_id: user.id, application_name: body.application_name.trim(), application_url: body.application_url || '',
        github_owner: body.github_owner || '', github_repository: body.github_repository || '', github_repository_id: String(body.github_repository_id || ''), github_branch: body.github_branch || '', repository_visibility: body.repository_visibility || '', repository_source: body.repository_source, zip_file_uri: body.zip_file_uri || '',
        authorization_confirmed: true, authorization_confirmed_at: now, authorization_metadata: { disclaimer: DISCLAIMER, ip_hash: ipHash, user_agent: (req.headers.get('user-agent') || '').slice(0, 200) },
        current_user_count: Math.max(0, Number(body.current_user_count || 0)), estimated_record_count: Math.max(0, Number(body.estimated_record_count || 0)), production_status: !!body.production_status, payment_features: !!body.payment_features,
        preferred_stack: body.preferred_stack || '', preferred_hosting: body.preferred_hosting || '', desired_timeline: body.desired_timeline || '', known_issues: body.known_issues || '', additional_notes: body.additional_notes || '', scan_status: 'draft', scan_progress: 0, scan_stage: 'Ready to scan'
      });
      await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id: user.id, project_id: project.id, action: 'assessment_created', entity_type: 'MigrationProject', entity_id: project.id, metadata: { repository_source: body.repository_source } });
      await base44.functions.invoke('migrationNotify', { project_id: project.id, event: 'assessment_created' });
      return Response.json({ project });
    }
    if (!body.project_id) return Response.json({ error: 'Project is required.' }, { status: 400 });
    const ownedProjects = await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 500);
    const project = ownedProjects.find((p) => p.id === body.project_id);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    if (action === 'get') {
      const response = await base44.functions.invoke('getMigrationReport', { action: 'project', project_id: project.id });
      return Response.json(response.data);
    }
    if (action === 'archive') {
      await base44.asServiceRole.entities.MigrationProject.update(project.id, { archived: true, lead_status: 'Archived' });
      return Response.json({ success: true });
    }
    if (action === 'consultation') {
      const settings = await base44.asServiceRole.entities.MigrationSettings.filter({ key: 'global' });
      const booking = settings[0]?.booking_url;
      if (!booking) return Response.json({ error: 'Scheduling is not configured yet. Please request a manual review.' }, { status: 409 });
      const quotes = await base44.entities.MigrationQuote.filter({ project_id: project.id, user_id: user.id }, '-version', 1);
      const quote = quotes[0];
      const url = new URL(booking);
      const params = { project_id: project.id, name: user.full_name || '', email: user.email || '', application: project.application_name, repository: project.github_repository ? `${project.github_owner}/${project.github_repository}` : 'ZIP upload', complexity: project.complexity_level || '', quote: quote?.total ? String(quote.total / 100) : '' };
      Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
      await base44.asServiceRole.entities.ConsultationRequest.create({ user_id: user.id, project_id: project.id, report_id: quote?.report_id || '', quote_id: quote?.id || '', booking_url: url.toString(), clicked_at: new Date().toISOString(), scheduled_status: 'requested' });
      await base44.asServiceRole.entities.MigrationProject.update(project.id, { lead_status: 'Consultation Requested' });
      await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id: user.id, project_id: project.id, action: 'consultation_requested', entity_type: 'MigrationProject', entity_id: project.id });
      await base44.functions.invoke('migrationNotify', { project_id: project.id, event: 'consultation_requested' });
      return Response.json({ booking_url: url.toString() });
    }
    if (action === 'manual_review') {
      await base44.asServiceRole.entities.MigrationProject.update(project.id, { manual_review_required: true, lead_status: 'Manual Review' });
      await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id: user.id, project_id: project.id, action: 'manual_review_requested', entity_type: 'MigrationProject', entity_id: project.id });
      await base44.functions.invoke('migrationNotify', { project_id: project.id, event: 'manual_review_requested' });
      return Response.json({ success: true });
    }
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});