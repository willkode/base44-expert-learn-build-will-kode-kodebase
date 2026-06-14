import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function plainText(md) {
  return (md || '').replace(/[#>*_`~\-]+/g, ' ').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/\s+/g, ' ').trim();
}

// Computes a render-ready preview payload (resolved SEO/social meta, stats, TOC)
// without persisting anything. Works for both saved and unsaved drafts.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { post = {} } = await req.json();

    let settings = null;
    try {
      const all = await base44.asServiceRole.entities.BlogSettings.filter({ key: 'global' });
      settings = all[0] || null;
    } catch (_e) { settings = null; }

    const text = plainText(post.content);
    const wordCount = text ? text.split(' ').length : 0;
    const readMinutes = post.readMinutes || Math.max(1, Math.round(wordCount / 200));

    // Table of contents from markdown headings.
    const toc = [];
    (post.content || '').split('\n').forEach((line) => {
      const m = line.match(/^(#{1,3})\s+(.*)/);
      if (m) toc.push({ level: m[1].length, text: m[2].trim() });
    });

    const baseTitle = post.metaTitle || post.title || '';
    const baseDesc = post.metaDescription || post.excerpt || '';
    const canonical = post.canonicalUrl
      || (settings?.defaultCanonicalUrlBase && post.slug ? `${settings.defaultCanonicalUrlBase.replace(/\/$/, '')}/${post.slug}` : '');
    const ogImage = post.ogImageUrl || post.coverImageUrl || settings?.defaultOgImageUrl || '';

    const meta = {
      metaTitle: baseTitle,
      metaDescription: baseDesc,
      canonicalUrl: canonical,
      ogTitle: post.ogTitle || baseTitle,
      ogDescription: post.ogDescription || baseDesc,
      ogImageUrl: ogImage,
      twitterTitle: post.twitterTitle || post.ogTitle || baseTitle,
      twitterDescription: post.twitterDescription || post.ogDescription || baseDesc,
      twitterImageUrl: post.twitterImageUrl || ogImage,
    };

    return Response.json({
      success: true,
      preview: {
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImageUrl: post.coverImageUrl || '',
        author: post.author || settings?.defaultAuthorName || '',
        publicUrl: post.slug ? `/learn/blog/${post.slug}` : '',
        wordCount,
        readMinutes,
        toc,
        showTableOfContents: !!settings?.showTableOfContents,
        meta,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});