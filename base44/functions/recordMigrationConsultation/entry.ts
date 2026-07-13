import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { project_id } = await req.json();
    const projects = await base44.entities.MigrationProject.filter({ id: project_id, user_id: user.id });
    if (!projects[0]) return Response.json({ error: 'Project not found.' }, { status: 404 });
    const result = await base44.functions.invoke('migrationAssessment', { action: 'consultation', project_id });
    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});