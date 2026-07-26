/**
 * Provider adapters for the Long-Form AI Video Studio.
 *
 * Every generation path goes through one of these adapters so a different
 * provider (Runway, Veo direct, ElevenLabs, Shotstack, etc.) can be dropped in
 * later without touching the feature code. Secrets stay server-side only.
 */

export const BRAND_STYLE =
  'Dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e). Glowing orange-to-red gradient accents through coral, orange and amber (#f87171, #fb923c, #facc15). Minimal flat vector style with subtle blueprint grid lines and soft glows. Clean modern premium SaaS / developer-tool look. Consistent lighting, high contrast, ample negative space.';

export const TEXT_FREE_RULE =
  'ABSOLUTELY CRITICAL — TEXT-FREE: render ZERO text of any kind. No words, letters, numbers, captions, titles, labels, UI copy, brand names, logos, watermarks, signage or handwriting in any frame. Any UI panels, cards, charts or documents must use abstract blurred placeholder bars and shapes instead of readable characters. Purely visual, symbolic, icon-and-shape imagery only.';

export const MAX_SCENE_SECONDS = 8;
export const WORDS_PER_SECOND = 2.5;

export function estimateNarrationSeconds(text: string) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / WORDS_PER_SECOND) * 10) / 10;
}

/** Snap a duration to what the video provider actually supports. */
export function snapDuration(seconds: number) {
  const options = [4, 6, 8];
  const target = Math.min(MAX_SCENE_SECONDS, Math.max(4, Math.ceil(seconds)));
  return options.find((o) => o >= target) ?? 8;
}

/** Video generation adapter (Base44 Core.GenerateVideo). */
export function makeVideoProvider(base44: any) {
  return {
    id: 'base44_core',
    maxSeconds: MAX_SCENE_SECONDS,
    async generate({ prompt, negativePrompt, duration, aspectRatio }: any) {
      const res = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: `${prompt}\n\nStyle: ${BRAND_STYLE}\n\nAvoid: ${negativePrompt || 'none'}\n\n${TEXT_FREE_RULE}`,
        duration: snapDuration(duration),
        aspect_ratio: aspectRatio === '16:9' ? '16:9' : '9:16',
      });
      if (!res?.url) throw new Error('Video provider returned no file.');
      return { url: res.url, duration: snapDuration(duration) };
    },
    // Base44 GenerateVideo is synchronous — status/cancel exist for async providers.
    async getStatus() {
      return { status: 'COMPLETED' };
    },
    async cancel() {
      return { status: 'CANCELED' };
    },
  };
}

/** Voice generation adapter (Base44 Core.GenerateSpeech). */
export function makeVoiceProvider(base44: any) {
  return {
    id: 'base44_core',
    async generate({ text, voice, language }: any) {
      const res = await base44.asServiceRole.integrations.Core.GenerateSpeech({
        text,
        voice: voice || 'river',
        ...(language ? { language_code: language } : {}),
      });
      if (!res?.url) throw new Error('Voice provider returned no audio.');
      return { url: res.url, duration: estimateNarrationSeconds(text) };
    },
  };
}

/** Storyboard image adapter (Base44 Core.GenerateImage). */
export function makeImageProvider(base44: any) {
  return {
    id: 'base44_core',
    async generate({ prompt, referenceUrls }: any) {
      const res = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `Storyboard frame. ${prompt}\n\nStyle: ${BRAND_STYLE}\n\n${TEXT_FREE_RULE}`,
        ...(referenceUrls?.length ? { existing_image_urls: referenceUrls } : {}),
      });
      if (!res?.url) throw new Error('Image provider returned no file.');
      return { url: res.url };
    },
  };
}

/**
 * Final render adapter.
 *
 * No stitching/encoding service is connected yet, so this builds and stores the
 * render manifest and reports PENDING_PROVIDER. Wire an external renderer
 * (Shotstack / Creatomate / an ffmpeg worker) here by reading its key from
 * secrets and posting the same manifest — nothing else has to change.
 */
export function makeRenderProvider() {
  const apiKey = Deno.env.get('RENDER_PROVIDER_API_KEY');
  return {
    id: apiKey ? 'external' : 'manifest_only',
    configured: Boolean(apiKey),
    async render(manifest: any) {
      if (!apiKey) {
        return {
          status: 'PENDING_PROVIDER',
          providerJobId: null,
          manifest,
          message:
            'No render provider is connected yet. The manifest is ready — add a render API key to produce a single stitched MP4.',
        };
      }
      throw new Error('External render provider adapter is not implemented yet.');
    },
    async getStatus() {
      return { status: 'PENDING_PROVIDER', progress: 0 };
    },
    async cancel() {
      return { status: 'CANCELED' };
    },
  };
}