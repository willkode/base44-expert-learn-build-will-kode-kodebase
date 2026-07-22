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
      ? `- Do NOT include the feature image yourself; it is added automatically at the top.`
      : `- Do not include any image.`;

    const fullPrompt = `You are an expert email marketing copywriter and HTML email designer. Write a single ${typeText} marketing email based on this brief:

"${prompt}"

Tone: ${toneText}.${brand}

BRAND DESIGN SYSTEM (must be followed exactly in the HTML):
- Dark tech aesthetic on a transparent background (the outer wrapper and container are added automatically — do NOT add your own outer/background container, max-width wrapper, or <table>).
- Body text color: #e2e8f0 (light slate). Muted text: #94a3b8.
- Headings color: a warm gradient look — use #fb923c for headings (orange).
- Primary call-to-action button: background gradient from #f87171 to #fb923c to #facc15 (use background:linear-gradient(90deg,#f87171,#fb923c,#facc15)), white text (#0a0f1e text is also acceptable for contrast), bold, rounded 8px, generous padding.
- Subtle borders: #1e293b.
- Readable font sizes (16px body, 26px+ headings). Use a system sans-serif font stack.
- Center-align headings and the call-to-action button. Keep all content full-width within its column (no floats, no side columns, no fixed widths on text blocks).

Requirements:
- Write a compelling subject line (under 60 characters) optimized for high open rates.
- Write short preview/preheader text (under 100 characters).
- Write ONLY the inner content blocks as INLINE-styled HTML (headings, paragraphs, button). Do NOT include <html>, <head>, <body>, any wrapping <div>/<table> container, or any background color — those are added automatically. Just the content elements stacked vertically.
${imageInstruction}
- Every link/button MUST use a real absolute URL on https://kodebase.us. Choose the most relevant page: https://kodebase.us/products (store), https://kodebase.us/products/base44-desktop-ide (Base44 Desktop IDE), https://kodebase.us/vault (Prompt Vault), https://kodebase.us/learn/blog (blog), https://kodebase.us/learn/base44-cheat-sheet (Base44 resource hub), https://kodebase.us/services/er-service (emergency app audit), https://kodebase.us/migration-planner (migration planner), or https://kodebase.us (home). If the brief mentions a specific URL, use that. NEVER use href="#" or invented URLs.
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

    // Wrap the generated inner content in a deterministic, email-client-safe
    // centered container so desktop + mobile render identically regardless of
    // the markup the model returns.
    const bannerHtml = featureImageUrl
      ? `<img src="${featureImageUrl}" alt="" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;border-radius:12px 12px 0 0;" />`
      : '';

    const wrappedHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0f1e;margin:0;padding:24px 0;">
  <tr>
    <td align="center" style="padding:0 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#0d1326;border:1px solid #1e293b;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
        ${bannerHtml ? `<tr><td style="padding:0;">${bannerHtml}</td></tr>` : ''}
        <tr>
          <td style="padding:32px 28px;font-size:16px;line-height:1.6;color:#e2e8f0;">
            ${result.htmlContent || ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

    return Response.json({ success: true, featureImageUrl, ...result, htmlContent: wrappedHtml });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});