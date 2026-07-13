import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { jsPDF } from 'npm:jspdf@4.2.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { project_id } = await req.json();
    const projects = user.role === 'admin'
      ? await base44.asServiceRole.entities.MigrationProject.list('-updated_date', 500)
      : await base44.asServiceRole.entities.MigrationProject.filter({ user_id:user.id }, '-updated_date', 500);
    const project = projects.find((p) => p.id === project_id);
    if (!project) return Response.json({ error:'Project not found.' }, { status:404 });
    const reports = await base44.asServiceRole.entities.MigrationReport.filter({ project_id, user_id:project.user_id }, '-report_version', 1);
    const report = reports[0];
    const grants = report ? await base44.asServiceRole.entities.ReportEntitlement.filter({ project_id, report_id:report.id, user_id:project.user_id, access_status:'active' }) : [];
    if (!report || (user.role !== 'admin' && !grants.length) || report.status !== 'ready') return Response.json({ error:'A valid report entitlement is required.' }, { status:403 });
    if (report.pdf_file_uri) {
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri:report.pdf_file_uri, expires_in:300 });
      return Response.json({ download_url:signed.signed_url });
    }
    const doc = new jsPDF({ unit:'mm', format:'letter' });
    let y = 20;
    const addText = (text, size=10, bold=false) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); const lines = doc.splitTextToSize(String(text || ''), 175); for (const line of lines) { if (y > 255) { doc.addPage(); y=20; } doc.text(line, 18, y); y += size * 0.45 + 1.5; } y += 2; };
    addText('KODEBASE — BASE44 MIGRATION PLAN', 18, true);
    addText(project.application_name, 15, true);
    addText(`Generated ${new Date(report.generated_at || Date.now()).toLocaleDateString('en-US')}`);
    addText('Independent Service Disclaimer', 12, true);
    addText('This is an independent migration planning and development service. It is not affiliated with, endorsed by, or sponsored by Base44 or Wix. Users must own or have authorization to analyze all repositories and application data submitted to this service.');
    const sections = report.full_report || {};
    for (const [key, value] of Object.entries(sections)) { addText(key.replace(/_/g,' ').toUpperCase(), 13, true); addText(typeof value === 'string' ? value : JSON.stringify(value, null, 2)); }
    const quotes = user.role === 'admin'
      ? await base44.asServiceRole.entities.MigrationQuote.filter({ project_id, user_id:project.user_id }, '-version', 1)
      : await base44.asServiceRole.entities.MigrationQuote.filter({ project_id, user_id:user.id }, '-version', 1);
    if (quotes[0]) { addText('MIGRATION QUOTE', 13, true); addText(`Quote ${quotes[0].quote_number}\nTotal: $${(quotes[0].total/100).toLocaleString()}\nDeposit: $${(quotes[0].deposit_amount/100).toLocaleString()}\nEstimated timeline: ${quotes[0].estimated_duration}\nExpires: ${new Date(quotes[0].expiration_date).toLocaleDateString('en-US')}`); }
    const bytes = doc.output('arraybuffer');
    const file = new File([bytes], `migration-plan-${project.id}.pdf`, { type:'application/pdf' });
    const uploaded = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });
    await base44.asServiceRole.entities.MigrationReport.update(report.id, { pdf_file_uri:uploaded.file_uri });
    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri:uploaded.file_uri, expires_in:300 });
    return Response.json({ download_url:signed.signed_url });
  } catch (error) {
    return Response.json({ error:error.message }, { status:500 });
  }
});