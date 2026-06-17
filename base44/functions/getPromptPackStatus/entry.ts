import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Prompt Engine — paywalled prompt pack reader.
// Returns the session, blueprint summary, and prompt list. Prompt BODIES and
// acceptance criteria are ONLY included when the session is unlocked (paid) or
// the requester is an admin. Locked responses return safe metadata only
// (title, category, objective, complexity) so the UI can show a teaser + paywall.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId } = await req.json();
    if (!sessionId) return Response.json({ error: 'sessionId is required.' }, { status: 400 });

    // RLS already scopes reads to the owner/admin, but we re-check ownership explicitly.
    const sessions = await base44.entities.PromptGeneratorSession.filter({ id: sessionId });
    const session = sessions[0];
    if (!session) return Response.json({ error: 'Session not found.' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    const isOwner = session.created_by_id === user.id || session.user_id === user.id;
    if (!isOwner && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Reconcile unlock from a completed Payment (in case the webhook flipped the
    // Payment but not the session, or vice versa).
    let unlocked = !!session.unlocked;
    if (!unlocked) {
      const paid = await base44.asServiceRole.entities.Payment.filter({
        promptSessionId: sessionId,
        status: 'completed',
      });
      if (paid.length > 0) {
        unlocked = true;
        await base44.entities.PromptGeneratorSession.update(sessionId, {
          unlocked: true,
          unlocked_at: session.unlocked_at || new Date().toISOString(),
        });
      }
    }

    const canSeeBodies = unlocked || isAdmin;

    const prompts = await base44.entities.GeneratedPrompt.filter({ session_id: sessionId }, 'order_number');
    const safePrompts = prompts.map((p) => {
      const base = {
        id: p.id,
        order_number: p.order_number,
        title: p.title,
        category: p.category,
        prompt_group: p.prompt_group,
        objective: p.objective,
        estimated_complexity: p.estimated_complexity,
        used: p.used,
        locked: !canSeeBodies,
      };
      if (canSeeBodies) {
        base.prompt_body = p.prompt_body;
        base.acceptance_criteria = p.acceptance_criteria;
        base.dependencies = p.dependencies;
      }
      return base;
    });

    return Response.json({
      success: true,
      unlocked,
      isAdmin,
      session: {
        id: session.id,
        app_name: session.app_name,
        current_stage: session.current_stage,
        completion_score: session.completion_score,
        generated_prompt_count: session.generated_prompt_count,
        unlocked: session.unlocked,
      },
      prompts: safePrompts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});