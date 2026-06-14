import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Link2, Sparkles, Loader2, ExternalLink, FileText } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import LinkSuggestionCard from "@/components/admin/blog/internal-links/LinkSuggestionCard";

export default function BlogInternalLinking() {
  const [links, setLinks] = useState([]);
  const [postMap, setPostMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = useCallback(async () => {
    const [linkRows, posts] = await Promise.all([
      base44.entities.BlogInternalLink.list("-created_date", 1000),
      base44.entities.BlogPost.list("-created_date", 500),
    ]);
    const map = {};
    posts.forEach((p) => { map[p.id] = p; });
    setPostMap(map);
    setLinks(linkRows);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const scanAll = async () => {
    setScanning(true);
    try {
      const res = await base44.functions.invoke("generateInternalLinkSuggestions", { all_posts: true });
      if (res.data?.success) {
        toast.success(`${res.data.created} new suggestion(s) generated`);
        await load();
      } else toast.error(res.data?.error || "Scan failed");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const apply = async (id) => {
    const res = await base44.functions.invoke("applyInternalLinkSuggestion", { internal_link_id: id });
    if (res.data?.success) { toast.success("Link applied to source post"); await load(); }
    else toast.error(res.data?.error || "Apply failed");
  };

  const reject = async (id) => {
    const res = await base44.functions.invoke("rejectInternalLinkSuggestion", { internal_link_id: id });
    if (res.data?.success) { toast.success("Suggestion rejected"); await load(); }
    else toast.error(res.data?.error || "Reject failed");
  };

  const saveAnchor = async (id, anchorText) => {
    await base44.entities.BlogInternalLink.update(id, { anchorText });
    toast.success("Anchor updated");
    await load();
  };

  if (loading) return <LoadingState label="Loading suggestions..." />;

  // Group by source post.
  const groups = {};
  links.forEach((l) => {
    (groups[l.sourcePostId] = groups[l.sourcePostId] || []).push(l);
  });
  const sourceIds = Object.keys(groups);

  return (
    <div>
      <PageHeader
        title="Internal Linking"
        description="Review and apply AI-suggested internal links between your posts."
        actions={
          <Button onClick={scanAll} disabled={scanning} className="gap-2">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Scan all posts
          </Button>
        }
      />

      {sourceIds.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No link suggestions yet"
          description="Run a scan to let AI suggest internal links that strengthen your topic clusters and SEO."
          actionLabel="Scan all posts"
          onAction={scanAll}
        />
      ) : (
        <div className="space-y-8">
          {sourceIds.map((sid) => {
            const source = postMap[sid];
            const items = groups[sid];
            return (
              <div key={sid}>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-sora font-semibold text-base">{source?.title || "Unknown post"}</h3>
                  {source?.slug && (
                    <a href={`/learn/blog/${source.slug}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">{items.length} link{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((l) => (
                    <LinkSuggestionCard
                      key={l.id}
                      link={l}
                      targetTitle={postMap[l.targetPostId]?.title}
                      targetSlug={postMap[l.targetPostId]?.slug}
                      onApply={() => apply(l.id)}
                      onReject={() => reject(l.id)}
                      onSaveAnchor={(anchor) => saveAnchor(l.id, anchor)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}