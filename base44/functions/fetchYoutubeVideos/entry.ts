import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// KodeBase Official YouTube channel
const CHANNEL_HANDLE = 'kodebaseofficial';

// Resolve the channel ID from the handle page, then read the public RSS feed.
async function resolveChannelId() {
  const res = await fetch(`https://www.youtube.com/@${CHANNEL_HANDLE}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await res.text();
  const match =
    html.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/) ||
    html.match(/channel\/(UC[0-9A-Za-z_-]{22})/);
  return match ? match[1] : null;
}

function parseFeed(xml) {
  const entries = xml.split('<entry>').slice(1);
  return entries.map((entry) => {
    const get = (tag) => {
      const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? m[1] : '';
    };
    const videoId = (entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1] || '';
    const title = get('title').replace(/<!\[CDATA\[|\]\]>/g, '');
    const published = (entry.match(/<published>(.*?)<\/published>/) || [])[1] || '';
    const thumb = (entry.match(/<media:thumbnail url="(.*?)"/) || [])[1] || '';
    const description = (entry.match(/<media:description>([\s\S]*?)<\/media:description>/) || [])[1] || '';
    return {
      videoId,
      title,
      published,
      thumbnail: thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      description: description.replace(/<!\[CDATA\[|\]\]>/g, '').slice(0, 240),
    };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Public learn page — no auth required, but init client for consistency.

    const channelId = await resolveChannelId();
    if (!channelId) {
      return Response.json({ error: 'Could not resolve YouTube channel', videos: [] }, { status: 200 });
    }

    const feedRes = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );
    const xml = await feedRes.text();
    const videos = parseFeed(xml);

    return Response.json({ channelId, videos });
  } catch (error) {
    return Response.json({ error: error.message, videos: [] }, { status: 200 });
  }
});