import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Generates a marketing email (subject, preview text, HTML body, plain-text body)
// from a short brief using the platform LLM integration.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { prompt, tone, campaignType, companyName } = await req.json();
    if (!prompt || !prompt.trim()) {
      return Response.json({ error: 'A prompt/brief is required.' }, { status: 400 });
    }

    const toneText = tone || 'professional, helpful, and engaging';
    const typeText = campaignType || 'newsletter';
    const brand = companyName ? ` The brand/company is "${companyName}".` : '';

    const fullPrompt = `You are an expert email marketing copywriter. Write a single ${typeText} marketing email based on this brief:

"${prompt}"

Tone: ${toneText}.${brand}

Requirements:
- Write a compelling subject line (under 60 characters) optimized for high open rates.
- Write short preview/preheader text (under 100 characters).
- Write the email body as clean, responsive, inline-styled HTML suitable for email clients (use a centered container max-width 600px, readable font sizes, and a clear call-to-action button). Do NOT include <html>, <head>, or <body> tags — only the inner content markup.
- Write a plain-text version of the same email.
- Do not invent fake links — use href="#" placeholders for any links/buttons.
- Do not include an unsubscribe footer; it is appended automatically.`;

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

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});