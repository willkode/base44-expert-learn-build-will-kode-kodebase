import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Public early-access signup — works for anonymous visitors on the marketing page.
// Records are created with the service role; the entity is admin-read-only.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, useCase, product } = await req.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    const cleanName = String(name || '').trim().slice(0, 120);
    const cleanUseCase = String(useCase || '').trim().slice(0, 500);
    const cleanProduct = String(product || 'base44-desktop-ide').trim().slice(0, 80);

    // Dedupe — one signup per email per product.
    const existing = await base44.asServiceRole.entities.EarlyAccessSignup.filter({
      email: cleanEmail,
      product: cleanProduct,
    });
    if (existing.length === 0) {
      await base44.asServiceRole.entities.EarlyAccessSignup.create({
        name: cleanName,
        email: cleanEmail,
        useCase: cleanUseCase,
        product: cleanProduct,
      });
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});