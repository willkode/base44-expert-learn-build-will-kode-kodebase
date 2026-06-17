import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { CheckSquare } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { PLATFORMS } from "@/components/admin/social/socialConfig";
import ApprovalPostCard from "@/components/admin/social/approval/ApprovalPostCard";
import ApprovalReasonDialog from "@/components/admin/social/approval/ApprovalReasonDialog";
import ApprovalHistory from "@/components/admin/social/approval/ApprovalHistory";
import RedditScheduleDialog from "@/components/admin/social/reddit/RedditScheduleDialog";
import LinkedInScheduleDialog from "@/components/admin/social/linkedin/LinkedInScheduleDialog";
import { APPROVAL_FILTERS } from "@/components/admin/social/approval/approvalConfig";
import { trackEvent } from "@/lib/analytics";

export default function SocialApprovals() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [fbIgAccount, setFbIgAccount] = useState(null);
  const [statusFilter, setStatusFilter] = useState("needs_review");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [busy, setBusy] = useState({}); // { [postId]: actionName }
  const [dialog, setDialog] = useState({ open: false, mode: null, post: null });
  const [redditDialog, setRedditDialog] = useState({ open: false, post: null });
  const [linkedinDialog, setLinkedinDialog] = useState({ open: false, post: null });
  const [historyKey, setHistoryKey] = useState(0);

  const load = () => {
    Promise.all([
      base44.entities.SocialPost.list("-created_date", 500),
      base44.entities.SocialAccount.filter({ account_id: "global" }, "-created_date", 200),
    ]).then(([p, accounts]) => {
      setPosts(p);
      setFbIgAccount(accounts.find((a) => a.platform === "facebook" || a.platform === "instagram") || null);
      setLoading(false);
    });
  };

  useEffect(() => {
    trackEvent("admin_social_approvals_view");
    load();
  }, []);

  const setPostBusy = (id, action) => setBusy((b) => ({ ...b, [id]: action }));
  const clearPostBusy = (id) => setBusy((b) => { const n = { ...b }; delete n[id]; return n; });

  const runAction = async (post, action, fn) => {
    setPostBusy(post.id, action);
    try {
      const res = await fn();
      if (res?.data?.error) throw new Error(res.data.error);
      load();
      setHistoryKey((k) => k + 1);
      return true;
    } catch (e) {
      toast.error(e.message || "Action failed.");
      return false;
    } finally {
      clearPostBusy(post.id);
    }
  };

  const handleSubmit = (post) =>
    runAction(post, "submit", () => base44.functions.invoke("submitSocialPostForReview", { social_post_id: post.id }))
      .then((ok) => ok && toast.success("Submitted for review."));

  const handleApprove = (post) =>
    runAction(post, "approve", () => base44.functions.invoke("approveSocialPost", { social_post_id: post.id }))
      .then((ok) => ok && toast.success("Post approved."));

  const handleConfirmReason = async (reason) => {
    const { post, mode } = dialog;
    const fnName = mode === "reject" ? "rejectSocialPost" : "requestSocialPostRevision";
    const payload = mode === "reject"
      ? { social_post_id: post.id, rejected_reason: reason }
      : { social_post_id: post.id, revision_notes: reason };
    const ok = await runAction(post, mode, () => base44.functions.invoke(fnName, payload));
    if (ok) {
      toast.success(mode === "reject" ? "Post rejected." : "Revision requested.");
      setDialog({ open: false, mode: null, post: null });
    }
  };

  if (loading) return <LoadingState label="Loading approval queue..." />;

  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.approval_status !== statusFilter) return false;
    if (platformFilter !== "all" && !(p.selected_platforms || []).includes(platformFilter)) return false;
    return true;
  });

  const pendingCount = posts.filter((p) => p.approval_status === "needs_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Queue"
        description="Review, approve, reject, or request changes before posts can be scheduled."
        actions={
          <Badge variant={pendingCount ? "default" : "secondary"} className="px-3 py-1.5">
            {pendingCount} awaiting review
          </Badge>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {APPROVAL_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                statusFilter === f.key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlatformFilter("all")}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              platformFilter === "all"
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All platforms
          </button>
          {PLATFORMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setPlatformFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                platformFilter === key
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="Nothing here"
              description="No posts match these filters. Generate content in the Studio or adjust your filters."
            />
          ) : (
            filtered.map((post) => (
              <ApprovalPostCard
                key={post.id}
                post={post}
                fbIgAccount={fbIgAccount}
                busyAction={busy[post.id] || null}
                onSubmit={handleSubmit}
                onApprove={handleApprove}
                onReject={(p) => setDialog({ open: true, mode: "reject", post: p })}
                onRevision={(p) => setDialog({ open: true, mode: "revision", post: p })}
                onSchedule={
                  (post.selected_platforms || []).includes("reddit")
                    ? (p) => setRedditDialog({ open: true, post: p })
                    : (post.selected_platforms || []).includes("linkedin")
                      ? (p) => setLinkedinDialog({ open: true, post: p })
                      : undefined
                }
              />
            ))
          )}
        </div>
        <div className="lg:col-span-1">
          <ApprovalHistory key={historyKey} />
        </div>
      </div>

      <ApprovalReasonDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        mode={dialog.mode}
        submitting={dialog.post ? busy[dialog.post.id] === dialog.mode : false}
        onConfirm={handleConfirmReason}
      />

      <RedditScheduleDialog
        open={redditDialog.open}
        onOpenChange={(open) => setRedditDialog((d) => ({ ...d, open }))}
        post={redditDialog.post}
        onScheduled={() => { trackEvent("admin_social_reddit_scheduled"); load(); }}
      />

      <LinkedInScheduleDialog
        open={linkedinDialog.open}
        onOpenChange={(open) => setLinkedinDialog((d) => ({ ...d, open }))}
        post={linkedinDialog.post}
        onScheduled={() => { trackEvent("admin_social_linkedin_scheduled"); load(); }}
      />
    </div>
  );
}