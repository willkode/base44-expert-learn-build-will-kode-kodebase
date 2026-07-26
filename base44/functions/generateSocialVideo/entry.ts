import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const BRAND_STYLE =
  'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents through coral, orange and amber (#f87171, #fb923c, #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. Clean modern premium SaaS / developer-tool look. No text, no logos, no watermarks. Consistent lighting, high contrast, ample negative space.';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const script = (body.script || '').trim();
    if (!script) return Response.json({ error: 'A voice-over script is required.' }, { status: 400 });

    const platform = body.platform || 'instagram';
    const videoDetails = body.videoDetails || '';
    const aspectRatio = body.aspectRatio === '16:9' ? '16:9' : '9:16';
    const duration = [4, 6, 8].includes(Number(body.duration)) ? Number(body.duration) : 8;
    const voice = body.voice || 'river';

    // 1. Copy pass: on-screen text beats + hashtags
    const copy = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a short-form social video editor for KodeBase (kodebase.us), a Base44 / vibe-coding tools brand.

Voice-over script (${duration} seconds long, spoken):
"""${script}"""

Visual direction: ${videoDetails || 'none provided'}
Target platform: ${platform}

Produce:
1. onScreenText: 3 to 4 short punchy on-screen text beats (max 6 words each) that track the script, with startSec/endSec timings inside 0 to ${duration} seconds, non-overlapping, covering the whole clip.
2. hashtags: 8 to 12 relevant, high-reach hashtags for ${platform} (each starting with #, no spaces).
3. suggestedTitle: a 3-6 word internal label for this video.`,
      response_json_schema: {
        type: 'object',
        properties: {
          onScreenText: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                startSec: { type: 'number' },
                endSec: { type: 'number' },
              },
            },
          },
          hashtags: { type: 'array', items: { type: 'string' } },
          suggestedTitle: { type: 'string' },
        },
      },
    });

    // 2. Video clip
    const videoRes = await base44.asServiceRole.integrations.Core.GenerateVideo({
      prompt: `${videoDetails || script}. ${BRAND_STYLE} Smooth subtle camera motion, cinematic, seamless loop feel. Leave the bottom center of the frame empty for an overlay.

ABSOLUTELY CRITICAL — TEXT-FREE VIDEO: render ZERO text of any kind. No words, letters, numbers, captions, titles, headlines, labels, UI copy, brand names, logos, watermarks, signage, or handwriting anywhere in any frame. Do not attempt to spell or write anything (including "Base44" or "KodeBase") — AI-rendered lettering comes out misspelled and unusable. Any UI panels, cards, charts, or documents shown must use abstract blurred placeholder bars and shapes instead of readable characters. Purely visual, symbolic, icon-and-shape imagery only.`,
      duration,
      aspect_ratio: aspectRatio,
    });

    // 3. Voice over
    const speechRes = await base44.asServiceRole.integrations.Core.GenerateSpeech({
      text: script,
      voice,
    });

    return Response.json({
      videoUrl: videoRes?.url || '',
      voiceoverUrl: speechRes?.url || '',
      onScreenText: copy?.onScreenText || [],
      hashtags: copy?.hashtags || [],
      suggestedTitle: copy?.suggestedTitle || '',
      duration,
      aspectRatio,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}