import React, { useState } from "react";
import { Rocket, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackEvent } from "@/lib/analytics";
import { FIRST_RUN_STEPS, SECRETS_CHECKLIST } from "./socialSetupConfig";
import SocialFirstRunChecklist from "./SocialFirstRunChecklist";
import SocialHowToSteps from "./SocialHowToSteps";
import SocialSecretsChecklist from "./SocialSecretsChecklist";
import SocialSafetyWarnings from "./SocialSafetyWarnings";

const DISMISS_KEY = "social_setup_guide_collapsed";

// Derives first-run + secret status from records the dashboard already loads,
// so the guide adds no extra fetches.
function buildStatus({ accounts = [], scheduled = [], posts = [], campaigns = [], brandProfiles = [], appPublicUrlSet }) {
  const connected = accounts.filter((a) => a.connection_status === "connected");
  const fb = accounts.find((a) => a.platform === "facebook");
  const ig = accounts.find((a) => a.platform === "instagram");

  const checklist = {
    brandProfile: brandProfiles.length > 0,
    anyPlatform: connected.length > 0,
    facebookPage: !!(fb && (fb.facebook_page_id || fb.selected_default_facebook_page_id)),
    instagramAccount: !!(ig && (ig.instagram_business_account_id || ig.selected_default_instagram_account_id)),
    hasCampaign: campaigns.length > 0,
    hasPost: posts.length > 0,
    hasApprovedPost: posts.some((p) => p.approval_status === "approved"),
    hasScheduledPost: scheduled.length > 0,
    hasAnalytics: scheduled.some((s) => s.status === "published"),
  };

  const secrets = {
    aiProvider: true,
    imageProvider: true,
    appPublicUrl: !!appPublicUrlSet,
    twitter: !!accounts.find((a) => a.platform === "twitter"),
    reddit: !!accounts.find((a) => a.platform === "reddit"),
    linkedin: !!accounts.find((a) => a.platform === "linkedin"),
    meta: !!(fb || ig),
    metaRedirect: !!(fb || ig),
    metaPermissions: checklist.facebookPage || checklist.instagramAccount,
    metaReview: false,
    legal: false,
    dataDeletion: false,
    webhook: false,
    testAccounts: false,
  };

  const completed = FIRST_RUN_STEPS.filter((s) => checklist[s.key]).length;
  const total = FIRST_RUN_STEPS.length;
  const percent = Math.round((completed / total) * 100);

  return { checklist, secrets, progress: { completed, total, percent } };
}

export default function SocialSetupGuide(props) {
  const status = buildStatus(props);
  const { progress } = status;
  const done = progress.percent === 100;

  const [open, setOpen] = useState(() => {
    if (done) return false;
    return localStorage.getItem(DISMISS_KEY) !== "1";
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(DISMISS_KEY, next ? "0" : "1");
    if (next) trackEvent("admin_open_social_setup_guide", {});
  };

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#f87171]/15 via-[#fb923c]/15 to-[#facc15]/15 flex items-center justify-center shrink-0">
          {done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Rocket className="w-5 h-5 text-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-sora font-semibold text-base">
            {done ? "Your social marketing is production-ready" : "Get social marketing production-ready"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {progress.completed} of {progress.total} setup steps complete
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden max-w-md">
            <div
              className="h-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border pt-5">
          <Tabs defaultValue="checklist">
            <TabsList className="mb-4 flex-wrap h-auto">
              <TabsTrigger value="checklist">Setup checklist</TabsTrigger>
              <TabsTrigger value="howto">How it works</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="safety">Safety</TabsTrigger>
            </TabsList>
            <TabsContent value="checklist">
              <SocialFirstRunChecklist checklist={status.checklist} />
            </TabsContent>
            <TabsContent value="howto">
              <SocialHowToSteps />
            </TabsContent>
            <TabsContent value="environment">
              <SocialSecretsChecklist secrets={status.secrets} />
            </TabsContent>
            <TabsContent value="safety">
              <SocialSafetyWarnings />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}