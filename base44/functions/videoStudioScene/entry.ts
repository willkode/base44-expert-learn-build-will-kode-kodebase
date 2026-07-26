import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  MAX_SCENE_SECONDS,
  estimateNarrationSeconds,
  makeImageProvider,
  makeVideoProvider,
  makeVoiceProvider,
  snapDuration,
} from '../../shared/videoProviders.ts';

/**
 * Per-scene generation. One scene failing never affects the others.
 * Actions: "storyboard" | "voice" | "video" | "shorten"
 */
export default async function (req) {
  let base44;
  let scene;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { action, sceneId } = await req.json();
    if (!sceneId) return Response.json({ error: 'sceneId is required.' }, { status: 400 });

    scene = await base44.asServiceRole.entities.VideoScene.get(sceneId);
    if (!scene) return Response.json({ error: 'Scene not found.' }, { status: 404 });

    const project = await base44.asServiceRole.entities.VideoProject.get(scene.project_id);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    if (project.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (scene.is_locked && action !== 'shorten') {
      return Response.json({ error: 'This scene is locked. Unlock it to regenerate.' }, { status: 400 });
    }

    const bible = JSON.stringify(project.continuity_bible || {});
    const continuity = `Continuity (must match every other scene): ${bible}. Scene continuity notes: ${scene.continuity_notes || 'none'}. Characters, wardrobe, location, palette and lighting must stay identical across scenes.`;

    if (action === 'shorten') {
      const out = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Rewrite this narration so it can be spoken comfortably in under 7.5 seconds (max 18 words) without losing its meaning or call to action:\n\n"""${scene.narration}"""`,
        response_json_schema: { type: 'object', properties: { narration: { type: 'string' } } },
      });
      const narration = (out?.narration || scene.narration).trim();
      const updated = await base44.asServiceRole.entities.VideoScene.update(sceneId, {
        narration,
        caption_text: narration,
        duration_target: snapDuration(Math.max(4, estimateNarrationSeconds(narration))),
      });
      return Response.json({ scene: updated });
    }

    if (action === 'storyboard') {
      const image = makeImageProvider(base44);
      const res = await image.generate({
        prompt: `${scene.visual_prompt}. ${scene.camera_direction || ''} ${continuity} Aspect ratio ${project.aspect_ratio}.`,
      });
      const updated = await base44.asServiceRole.entities.VideoScene.update(sceneId, {
        storyboard_url: res.url,
        status: scene.video_url ? scene.status : 'STORYBOARD_READY',
        error_code: '',
        error_message: '',
      });
      return Response.json({ scene: updated });
    }

    if (action === 'voice') {
      const estimate = estimateNarrationSeconds(scene.narration);
      if (estimate > MAX_SCENE_SECONDS) {
        return Response.json(
          {
            error: `This narration is about ${estimate}s — longer than the ${MAX_SCENE_SECONDS}s scene limit. Shorten it, split the scene, or edit it manually before generating audio.`,
            code: 'NARRATION_TOO_LONG',
          },
          { status: 400 },
        );
      }
      const voiceProvider = makeVoiceProvider(base44);
      const res = await voiceProvider.generate({
        text: scene.narration,
        voice: project.voice,
        language: project.language,
      });
      const updated = await base44.asServiceRole.entities.VideoScene.update(sceneId, {
        audio_url: res.url,
        audio_duration: res.duration,
        duration_target: snapDuration(Math.max(4, res.duration)),
        status: scene.video_url ? 'VIDEO_READY' : 'AUDIO_READY',
        error_code: '',
        error_message: '',
      });
      return Response.json({ scene: updated });
    }

    if (action === 'video') {
      const videoProvider = makeVideoProvider(base44);
      const duration = snapDuration(Math.max(4, scene.audio_duration || scene.duration_target || 6));
      const res = await videoProvider.generate({
        prompt: `${scene.visual_prompt}. Starts: ${scene.starting_state || 'establishing shot'}. Ends: ${scene.ending_state || 'settled composition'}. Camera: ${scene.camera_direction || 'slow subtle move'}. Motion: ${scene.motion_direction || 'gentle continuous motion'}. ${continuity}`,
        negativePrompt: scene.negative_prompt,
        duration,
        aspectRatio: project.aspect_ratio,
      });
      const revisions = [
        ...(scene.revisions || []),
        {
          revision_number: (scene.revision_number || 0) + 1,
          video_url: res.url,
          audio_url: scene.audio_url || '',
          storyboard_url: scene.storyboard_url || '',
          created_at: new Date().toISOString(),
        },
      ];
      const updated = await base44.asServiceRole.entities.VideoScene.update(sceneId, {
        video_url: res.url,
        video_duration: res.duration,
        revision_number: (scene.revision_number || 0) + 1,
        revisions,
        status: 'VIDEO_READY',
        error_code: '',
        error_message: '',
      });
      return Response.json({ scene: updated });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    // Record the failure on the scene so the rest of the project keeps working.
    if (base44 && scene) {
      try {
        await base44.asServiceRole.entities.VideoScene.update(scene.id, {
          status: 'FAILED',
          error_code: 'PROVIDER_ERROR',
          error_message: error.message,
        });
      } catch (_) { /* ignore */ }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}