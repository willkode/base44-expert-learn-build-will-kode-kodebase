import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { makeRenderProvider } from '../../shared/videoProviders.ts';

/** Builds the ordered render manifest and submits it to the render provider. */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { projectId, music } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required.' }, { status: 400 });

    const project = await base44.asServiceRole.entities.VideoProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found.' }, { status: 404 });
    if (project.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scenes = (await base44.asServiceRole.entities.VideoScene.filter({ project_id: projectId })).sort(
      (a, b) => a.scene_number - b.scene_number,
    );
    const missing = scenes.filter((s) => !s.video_url);
    if (scenes.length === 0) return Response.json({ error: 'This project has no scenes yet.' }, { status: 400 });
    if (missing.length > 0) {
      return Response.json(
        {
          error: `${missing.length} scene(s) still need a video clip: ${missing.map((s) => s.scene_number).join(', ')}.`,
          code: 'INCOMPLETE_SCENES',
        },
        { status: 400 },
      );
    }

    let cursor = 0;
    const clips = scenes.map((s) => {
      const duration = s.video_duration || s.duration_target || 6;
      const clip = {
        sceneId: s.id,
        sceneNumber: s.scene_number,
        videoUrl: s.video_url,
        voiceoverUrl: s.audio_url || null,
        startAt: Math.round(cursor * 10) / 10,
        duration,
        trimStart: 0,
        trimEnd: 0,
        transitionOut: s.transition_out || 'cut',
        caption: { text: s.caption_text || s.narration || '', startAt: cursor, endAt: cursor + duration },
      };
      cursor += duration;
      return clip;
    });

    const manifest = {
      projectId,
      title: project.title,
      aspectRatio: project.aspect_ratio,
      resolution: project.resolution || '1080p',
      frameRate: 30,
      outputFormat: 'mp4',
      totalDuration: Math.round(cursor * 10) / 10,
      clips,
      music: music?.url ? { url: music.url, volume: music.volume ?? 0.15, duckUnderNarration: true, fadeIn: 1, fadeOut: 1.5 } : null,
      voiceVolume: 1,
      captions: clips.map((c) => c.caption),
      createdAt: new Date().toISOString(),
    };

    const renderProvider = makeRenderProvider();
    const result = await renderProvider.render(manifest);

    await base44.asServiceRole.entities.VideoProject.update(projectId, {
      render_manifest: manifest,
      render_status: result.status,
      actual_duration: manifest.totalDuration,
      thumbnail_url: project.thumbnail_url || scenes[0]?.storyboard_url || '',
      status: result.status === 'COMPLETE' ? 'COMPLETE' : 'READY_TO_RENDER',
      ...(result.outputUrl ? { final_video_url: result.outputUrl } : {}),
    });

    return Response.json({
      manifest,
      status: result.status,
      providerConfigured: renderProvider.configured,
      message: result.message || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}