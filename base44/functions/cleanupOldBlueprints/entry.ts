import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Deletes stale blueprints app-wide. For each project, the NEWEST blueprint is the
// "currently used" one and is always kept. Any older blueprint whose created_date is
// 14+ days ago is deleted, along with its related PromptPack/PromptItem/SecurityFinding/QAItem records.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const CUTOFF_MS = 14 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Load all blueprints (paginated) and group by project.
    const byProject = {};
    const pageSize = 200;
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.Blueprint.list('-created_date', pageSize, skip);
      if (!batch.length) break;
      for (const bp of batch) {
        const key = bp.projectId || `__none_${bp.id}`;
        (byProject[key] = byProject[key] || []).push(bp);
      }
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    const staleBlueprints = [];
    for (const key of Object.keys(byProject)) {
      const list = byProject[key].sort(
        (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      // Skip index 0 (newest = currently used), check the rest.
      for (let i = 1; i < list.length; i++) {
        const bp = list[i];
        const age = now - new Date(bp.created_date).getTime();
        if (age >= CUTOFF_MS) staleBlueprints.push(bp);
      }
    }

    let deletedBlueprints = 0;
    let deletedRelated = 0;

    for (const bp of staleBlueprints) {
      // Delete related records tied to this blueprint.
      for (const entityName of ['PromptItem', 'SecurityFinding', 'QAItem', 'PromptPack']) {
        const related = await base44.asServiceRole.entities[entityName].filter({ blueprintId: bp.id }, '-created_date', 500);
        for (const rec of related) {
          await base44.asServiceRole.entities[entityName].delete(rec.id);
          deletedRelated++;
        }
      }
      await base44.asServiceRole.entities.Blueprint.delete(bp.id);
      deletedBlueprints++;
    }

    return Response.json({
      success: true,
      deletedBlueprints,
      deletedRelated,
      scanned: Object.values(byProject).reduce((n, l) => n + l.length, 0),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});