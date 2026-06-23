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

    // Resolve the deliverable list, merging the legacy single-file fields with
    // the newer pdfFiles array so older products keep working.
    const rawFiles = Array.isArray(product.pdfFiles) ? product.pdfFiles.filter((f) => f && f.fileUri) : [];
    if (rawFiles.length === 0 && product.pdfFileUri) {
      rawFiles.push({ fileUri: product.pdfFileUri, fileName: product.pdfFileName });
    }

    // Access-only probe used by the Download page to decide whether to show the
    // "you're all set" view. Doesn't generate signed URLs.
    if (checkOnly) {
      return Response.json({
        success: true,
        hasAccess: true,
        productName: product.name,
        deliversPdf: !!(product.deliversPdf && rawFiles.length > 0),
        fileCount: rawFiles.length,
        email: user.email,
      });
    }

    if (!product.deliversPdf || rawFiles.length === 0) {
      return Response.json({ error: 'This product has no downloadable file.' }, { status: 404 });
    }

    const files = [];
    for (let i = 0; i < rawFiles.length; i++) {
      const f = rawFiles[i];
      const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
        file_uri: f.fileUri,
        expires_in: 3600,
      });
      files.push({
        downloadUrl: signed.signed_url,
        fileName: f.fileName || `${product.slug || 'download'}-${i + 1}.pdf`,
      });
    }

    let emailed = false;
    if (sendEmail) {
      const linkLines = files.map((f) => `${f.fileName}:\n${f.downloadUrl}`).join('\n\n');
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `Your download${files.length > 1 ? 's' : ''}: ${product.name}`,
        body:
          `Hi ${user.full_name || 'there'},\n\n` +
          `Thanks for your purchase of "${product.name}". You can download your file${files.length > 1 ? 's' : ''} using the link${files.length > 1 ? 's' : ''} below:\n\n` +
          `${linkLines}\n\n` +
          `${files.length > 1 ? 'These links are' : 'This link is'} valid for 1 hour. You can always return to your account to download ${files.length > 1 ? 'them' : 'it'} again.\n\n` +
          `— The KodeBase Team`,
      });
      emailed = true;
    }

    return Response.json({
      success: true,
      files,
      // Legacy single-file fields for older clients.
      downloadUrl: files[0].downloadUrl,
      fileName: files[0].fileName,
      productName: product.name,
      emailed,
      email: user.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});