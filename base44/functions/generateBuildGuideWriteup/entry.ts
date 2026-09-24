import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only. Writes an original KodeBase breakdown for one Build Your Own
// guide (summary, difficulty, time estimate, markdown write-up). The external
// guide is never fetched or copied — the write-up is written from the project
// topic alone, and the original author is credited on the page.
// Body: { id, overwrite? } — existing write-ups are kept unless overwrite=true.

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { id, overwrite = false } = await req.json();
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

    const [guide] = await base44.asServiceRole.entities.BuildTutorial.filter({ id });
    if (!guide) return Response.json({ error: 'Guide not found' }, { status: 404 });
    if (guide.writeup && !overwrite) return Response.json({ success: true, skipped: 'has_writeup', guide });

    const languages = (guide.languages || []).join(', ') || 'any language';
    const project = guide.category === 'Uncategorized' ? guide.title : `${guide.category} — ${guide.title}`;

    const ai = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_5',
      prompt: `You write premium, original learning content for KodeBase's "Build Your Own" library — hands-on projects where developers re-create real technologies from scratch.

Write a KodeBase breakdown for this project:
Project: ${project}
Language(s): ${languages}
Format of the original guide: ${guide.isVideo ? 'video' : 'written tutorial'} by ${guide.sourceName || 'an independent author'}. Readers continue there for the full walkthrough.

Rules:
- 100% original writing in your own words. You have NOT read the original guide: do not quote or paraphrase it, do not claim what specific chapters, code or sections it contains, and do not name its author.
- Explain how someone builds this kind of project in the given language(s), from general engineering knowledge. Be concrete and technically accurate.
- Confident, friendly, practical tone in the second person. No hype, no emojis.
- Never mention CodeCrafters, "build-your-own-x", or any list or repository the project came from.

Return:
- summary: one or two sentences (max 200 characters) on what the reader builds and learns.
- difficulty: one of Beginner, Intermediate, Advanced.
- timeEstimate: a realistic range, e.g. "3–5 hours" or "2–3 weekends".
- writeup: markdown, 450–750 words, with exactly these ## headings in this order and no top-level # title:
  ## What you'll build
  ## Key concepts   (bullets; bold each concept, then a one-line explanation)
  ## Before you start   (bullets: prerequisites and tools)
  ## Roadmap   (5–8 numbered milestones; each says what to implement and how to check it works)
  ## Common pitfalls   (bullets)
  ## Take it further   (bullets: stretch ideas)`,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          difficulty: { type: 'string', enum: DIFFICULTIES },
          timeEstimate: { type: 'string' },
          writeup: { type: 'string' },
        },
        required: ['summary', 'difficulty', 'timeEstimate', 'writeup'],
      },
    });

    if (!ai?.writeup) return Response.json({ error: 'AI returned no write-up' }, { status: 502 });

    const updated = await base44.asServiceRole.entities.BuildTutorial.update(guide.id, {
      description: overwrite || !guide.description ? String(ai.summary || '').slice(0, 300) : guide.description,
      difficulty: DIFFICULTIES.includes(ai.difficulty) ? ai.difficulty : guide.difficulty,
      timeEstimate: ai.timeEstimate || guide.timeEstimate || '',
      writeup: ai.writeup,
      writeupGeneratedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, guide: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
