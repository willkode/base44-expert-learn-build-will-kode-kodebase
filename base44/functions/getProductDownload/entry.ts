import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns a time-limited signed download URL for a paid PDF product —
// only if the calling user has a completed payment for that product.
// Optionally emails the download link to the user's account email.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, sendEmail, checkOnly } = await req.json();
    if (!productId) return Response.json({ error: 'Missing product.' }, { status: 400 });

    const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
    const product = products[0];
    if (!product) {
      return Response.json({ error: 'We couldn\'t find that product.' }, { status: 404 });
    }

    // Verify the user actually paid for this product (resolved server-side with
    // the service role so admin-granted purchases are matched the same way the
    // dashboard "My Products" section resolves them).
    const payments = await base44.asServiceRole.entities.Payment.filter({
      userId: user.id,
      productId,
      status: 'completed',
    });
    if (payments.length === 0) {
      return Response.json({ error: 'No completed purchase found for this product.' }, { status: 403 });
    }

    // Access-only probe used by the Download page to decide whether to show the
    // "you're all set" view. Doesn't generate a signed URL.
    if (checkOnly) {
      return Response.json({
        success: true,
        hasAccess: true,
        productName: product.name,
        deliversPdf: !!(product.deliversPdf && product.pdfFileUri),
        email: user.email,
      });
    }

    if (!product.deliversPdf || !product.pdfFileUri) {
      return Response.json({ error: 'This product has no downloadable file.' }, { status: 404 });
    }

    const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: product.pdfFileUri,
      expires_in: 3600,
    });
    const downloadUrl = signed.signed_url;

    let emailed = false;
    if (sendEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your download: ${product.name}`,
        body:
          `Hi ${user.full_name || 'there'},\n\n` +
          `Thanks for your purchase of "${product.name}". You can download your PDF using the link below:\n\n` +
          `${downloadUrl}\n\n` +
          `This link is valid for 1 hour. You can always return to your account to download it again.\n\n` +
          `— The KodeBase Team`,
      });
      emailed = true;
    }

    return Response.json({
      success: true,
      downloadUrl,
      fileName: product.pdfFileName || `${product.slug || 'download'}.pdf`,
      productName: product.name,
      emailed,
      email: user.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});