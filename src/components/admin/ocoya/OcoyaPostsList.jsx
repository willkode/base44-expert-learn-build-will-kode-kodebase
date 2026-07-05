import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import OcoyaPostCard from "@/components/admin/ocoya/OcoyaPostCard";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUS_OPTIONS = ["ALL", "DRAFT", "SCHEDULED", "POSTED", "ERROR", "GENERATING"];

export default function OcoyaPostsList({ workspaceId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    const payload = { action: "listPosts", workspaceId, perPage: 50 };
    if (status !== "ALL") payload.statuses = [status];
    base44.functions.invoke("ocoyaRequest", payload).then((res) => {
      if (res.data?.error) {
        setError(res.data.error);
        setLoading(false);
        return;
      }
      const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.posts || res.data?.items || [];
      setPosts(list);
      setLoading(false);
    });
  }, [workspaceId, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (postId) => {
    setDeletingId(postId);
    const res = await base44.functions.invoke("ocoyaRequest", { action: "deletePost", workspaceId, postId });
    setDeletingId(null);
    if (res.data?.error) {
      setError(res.data.error);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading posts from Ocoya...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No posts found in Ocoya{status !== "ALL" ? ` with status ${status}` : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <OcoyaPostCard key={p.id} post={p} onDelete={handleDelete} deleting={deletingId === p.id} />
          ))}
        </div>
      )}
    </div>
  );
}