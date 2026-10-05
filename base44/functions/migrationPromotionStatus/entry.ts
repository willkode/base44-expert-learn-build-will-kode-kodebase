import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { reconcilePromotion, publicStatus } from "../../shared/migrationPromotion.ts";
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    return Response.json(publicStatus(await reconcilePromotion(base44)), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Offer availability is temporarily unavailable." }, { status: 503 });
  }
});