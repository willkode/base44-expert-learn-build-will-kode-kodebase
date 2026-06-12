import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    return Response.json({
      applicationId: Deno.env.get('SQUARE_APPLICATION_ID'),
      locationId: Deno.env.get('SQUARE_LOCATION_ID'),
      environment: Deno.env.get('SQUARE_ENVIRONMENT') === 'production' ? 'production' : 'sandbox',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});