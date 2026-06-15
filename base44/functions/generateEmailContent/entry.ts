import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Generates an on-brand marketing email (subject, preview text, HTML body, plain-text body)
// plus a branded feature image, from a short brief using the platform integrations.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { prompt, tone, campaignType, companyName, generateImage = true } = await req.json();
    if (!prompt || !prompt.trim()) {
      return Response.json({ error: 'A prompt/brief is required.' }, { status: 400 });
    }

    const toneText = tone || 'professional, helpful, and engaging';
    const typeText = campaignType || 'newsletter';
    const brand = companyName ? ` The brand/company is "${companyName}".` : '';

    // 1) Generate a branded feature image for the top of the email (best-effort).
    let featureImageUrl = '';
    if (generateImage) {
      try {
        const imgPrompt = `Email feature/hero image illustrating: ${prompt}. Style: dark tech aesthetic on a deep navy background (#0d1326 / #0a0f1e), glowing orange-to-red gradient accents transitioning through coral, orange, and amber (#f87171 to #fb923c to #facc15), minimal flat vector style with subtle blueprint grid lines and soft glows, clean modern premium SaaS/developer-tool look, no text, no logos, no watermarks, consistent lighting, high contrast, ample negative space. Wide banner composition.`;
        const img = await base44.integrations.Core.GenerateImage({ prompt: imgPrompt });
        featureImageUrl = img?.url || '';
      } catch (_e) {
        featureImageUrl = '';
      }
    }

    // 2) Generate copy + on-brand dark-themed HTML.
    const imageInstruction = featureImageUrl
      ? `- At the very top of the email body, include the feature image as a full-width banner: <img src="${featureImageUrl}" alt="" style="width:100%;max-width:600px;display:block;border-radius:12px;" />.`
      : `- Do not include any image.`;

    const fullPrompt = `You are an expert email marketing copywriter and HTML email designer. Write a single ${typeText} marketing email based on this brief:

"${prompt}"

Tone: ${toneText}.${brand}

BRAND DESIGN SYSTEM (must be followed exactly in the HTML):
- Dark tech aesthetic. Outer/background color: #0a0f1e. Main content container background: #0d1326.
- Body text color: #e2e8f0 (light slate). Muted text: #94a3b8.
- Headings color: a warm gradient look — use #fb923c for headings (orange).
- Primary call-to-action button: background gradient from #f87171 to #fb923c to #facc15 (use background:linear-gradient(90deg,#f87171,#fb923c,#facc15)), white text (#0a0f1e text is also acceptable for contrast), bold, rounded 8px, generous padding.
- Subtle borders: #1e293b. Rounded corners (12px) on the content container.
- Centered container max-width 600px. Readable font sizes (16px body, 26px+ headings). Use a system sans-serif font stack.

Requirements:
- Write a compelling subject line (under 60 characters) optimized for high open rates.
- Write short preview/preheader text (under 100 characters).
- Write the email body as clean, responsive, INLINE-styled HTML matching the brand design system above. Do NOT include <html>, <head>, or <body> tags — only the inner content markup, wrapped in a centered dark container.
${imageInstruction}
- Use href="#" placeholders for any links/buttons. Do not invent real URLs.
- Do not include an unsubscribe footer; it is appended automatically.

Write the plain-text version as clean readable text (no HTML).`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          previewText: { type: 'string' },
          htmlContent: { type: 'string' },
          textContent: { type: 'string' },
        },
        required: ['subject', 'htmlContent', 'textContent'],
      },
    });

    return Response.json({ success: true, featureImageUrl, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});