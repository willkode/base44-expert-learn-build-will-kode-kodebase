import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { THREE_UI_ELEMENTS, previewElements } from '../../shared/threeUiCatalog.ts';

// 3D UI Element Kit — one-time purchase unlocks the full prompt catalog.
const KIT_PRODUCT_ID = '6a8e9f6939a15429ae635383';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try {
      user = await base44.auth.me();
    } catch (_e) {
      user = null;
    }

    let hasAccess = false;
    if (user) {
      if (user.role === 'admin') {
        hasAccess = true;
      } else {
        const payments = await base44.asServiceRole.entities.Payment.filter(
          { userId: user.id, productId: KIT_PRODUCT_ID, status: 'completed' },
          '-created_date',
          1
        );
        hasAccess = payments.length > 0;
      }
    }

    return Response.json({
      hasAccess,
      total: THREE_UI_ELEMENTS.length,
      elements: hasAccess ? THREE_UI_ELEMENTS : previewElements(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});