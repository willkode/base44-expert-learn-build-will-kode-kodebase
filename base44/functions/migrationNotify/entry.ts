import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const allowed = ['assessment_created','scan_completed','scan_failed','report_unlocked','quote_created','quote_revised','quote_expiring','deposit_paid','full_payment_received','consultation_requested','manual_review_requested'];
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { project_id, event } = await req.json();
    if (!allowed.includes(event)) return Response.json({ error:'Invalid notification.' }, { status:400 });
    const projects = await base44.asServiceRole.entities.MigrationProject.filter({ id:project_id });
    const project = projects[0];
    if (!project || (user.role !== 'admin' && project.user_id !== user.id)) return Response.json({ error:'Project not found.' }, { status:404 });
    const owner = await base44.asServiceRole.entities.User.get(project.user_id);
    const settings = (await base44.asServiceRole.entities.MigrationSettings.filter({ key:'global' }))[0] || {};
    const quotes = await base44.asServiceRole.entities.MigrationQuote.filter({ project_id }, '-version', 1);
    const quote = quotes[0];
    const title = event.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());
    const body = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><h2>${title}</h2><p>Application: ${project.application_name}</p><p>Repository: ${project.github_repository ? `${project.github_owner}/${project.github_repository}` : 'Authorized ZIP upload'}</p><p>Complexity: ${project.complexity_level || 'Pending'}</p><p>Readiness: ${project.readiness_score ?? 'Pending'}</p><p>Quote: ${quote ? `$${(quote.total/100).toLocaleString()}` : 'Pending'}</p></div>`;
    if (owner?.email) await base44.asServiceRole.integrations.Core.SendEmail({ to:owner.email, subject:`Migration Planner: ${title}`, body });
    if (settings.sales_notification_email) await base44.asServiceRole.integrations.Core.SendEmail({ to:settings.sales_notification_email, subject:`Migration lead: ${title} — ${project.application_name}`, body });
    return Response.json({ success:true });
  } catch (error) { return Response.json({ error:error.message }, { status:500 }); }
});