import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  MAX_SCENE_SECONDS,
  estimateNarrationSeconds,
  snapDuration,
} from '../../shared/videoProviders.ts';

/**
 * Project planning: full script generation + script -> scene breakdown.
 * Actions: "script" | "scenes"
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action, projectId } = body;
    if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });

    const project = await base44.asServiceRole.entities.VideoProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    if (project.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'script') {
      const targetWords = Math.round((project.target_duration || 30) * 2.5);
      const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a short-form video scriptwriter for KodeBase (kodebase.us), a Base44 / vibe-coding tools brand.

Write a spoken narration script for a ${project.target_duration}s ${project.project_type} video for ${project.platform}.

Brief / source material:
"""${project.brief || project.title}"""

Rules:
- About ${targetWords} words total (spoken at ~2.5 words per second).
- Hook in the first sentence. One clear idea per sentence.
- Conversational, confident, no hype words, no emojis, no stage directions.
- End with a clear call to action mentioning kodebase.us.
Return only the narration text.`,
        response_json_schema: {
          type: 'object',
          properties: { script: { type: 'string' } },
        },
      });
      const script = (out?.script || '').trim();
      await base44.asServiceRole.entities.VideoProject.update(projectId, {
        script,
        status: 'PLANNING',
      });
      return Response.json({ script, estimatedSeconds: estimateNarrationSeconds(script) });
    }

    if (action === 'scenes') {
      const script = (body.script || project.script || '').trim();
      if (!script) return Response.json({ error: 'Generate or paste a script first.' }, { status: 400 });

      const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Break this narration into sequential video scenes for a ${project.aspect_ratio} ${project.platform} video.

NARRATION:
"""${script}"""

Visual style: ${project.visual_style}. ${project.style_notes || ''}
Continuity bible (must be respected in EVERY scene): ${JSON.stringify(project.continuity_bible || {})}

HARD RULES:
- Every scene's narration must be speakable in 5 to 7.5 seconds (12 to 18 words). NEVER more than ${MAX_SCENE_SECONDS} seconds.
- Split at natural sentence or clause boundaries. Do not drop or truncate any words from the narration — every word must appear in exactly one scene, in order.
- Keep the same characters, location, wardrobe, lighting, palette and camera language across scenes; describe them explicitly in every visual_prompt so each clip is generated consistently.
- visual_prompt must be purely visual and contain NO text, letters, logos or brand names in frame. Never mention aspect ratios, resolutions, numbers, measurements, dates or any spellable words as part of the scene contents — the video model renders anything like that as on-screen lettering.

For each scene return: title, purpose, narration, visual_prompt, negative_prompt, camera_direction, motion_direction, starting_state, ending_state, continuity_notes, caption_text (short on-screen caption), transition_out (cut, dissolve, whip_pan or match_cut).`,
        response_json_schema: {
          type: 'object',
          properties: {
            scenes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  purpose: { type: 'string' },
                  narration: { type: 'string' },
                  visual_prompt: { type: 'string' },
                  negative_prompt: { type: 'string' },
                  camera_direction: { type: 'string' },
                  motion_direction: { type: 'string' },
                  starting_state: { type: 'string' },
                  ending_state: { type: 'string' },
                  continuity_notes: { type: 'string' },
                  caption_text: { type: 'string' },
                  transition_out: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const raw = Array.isArray(out?.scenes) ? out.scenes : [];
      if (raw.length === 0) return Response.json({ error: 'Scene breakdown returned nothing.' }, { status: 502 });

      // Timing validation — no scene may exceed the provider's 8s ceiling.
      const warnings = [];
      const scenes = raw.map((s, i) => {
        const estimate = estimateNarrationSeconds(s.narration || '');
        if (estimate > MAX_SCENE_SECONDS) {
          warnings.push(
            `Scene ${i + 1} narration is about ${estimate}s — longer than the ${MAX_SCENE_SECONDS}s limit. Shorten it or split the scene before generating.`,
          );
        }
        return {
          project_id: projectId,
          user_id: user.id,
          scene_number: i + 1,
          title: s.title || `Scene ${i + 1}`,
          purpose: s.purpose || '',
          narration: s.narration || '',
          visual_prompt: s.visual_prompt || '',
          negative_prompt: s.negative_prompt || project.negative_prompt || '',
          duration_target: snapDuration(Math.max(4, estimate)),
          audio_duration: 0,
          video_duration: 0,
          camera_direction: s.camera_direction || '',
          motion_direction: s.motion_direction || '',
          starting_state: s.starting_state || '',
          ending_state: s.ending_state || '',
          continuity_notes: s.continuity_notes || '',
          caption_text: s.caption_text || s.narration || '',
          transition_out: s.transition_out || 'cut',
          status: 'SCRIPT_READY',
          approval_status: 'pending',
          revision_number: 0,
        };
      });

      // Replace only scenes that have no generated assets, keeping finished work.
      const existing = await base44.asServiceRole.entities.VideoScene.filter({ project_id: projectId });
      const disposable = existing.filter((s) => !s.video_url && !s.audio_url && !s.storyboard_url);
      for (const s of disposable) {
        await base44.asServiceRole.entities.VideoScene.delete(s.id);
      }
      const kept = existing.length - disposable.length;
      const created = await base44.asServiceRole.entities.VideoScene.bulkCreate(scenes);

      await base44.asServiceRole.entities.VideoProject.update(projectId, {
        script,
        scene_count: scenes.length + kept,
        status: 'STORYBOARDING',
      });

      return Response.json({
        scenes: created,
        warnings,
        keptScenesWithAssets: kept,
        estimatedTotalSeconds: scenes.reduce((t, s) => t + s.duration_target, 0),
      });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}