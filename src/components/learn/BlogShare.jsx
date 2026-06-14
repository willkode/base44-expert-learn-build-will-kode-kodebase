import React, { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";
import { canonical } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";

// Social sharing row for a blog post. Uses the canonical public URL.
export default function BlogShare({ post }) {
  const [copied, setCopied] = useState(false);
  const url = canonical(`/learn/blog/${post.slug}`);
  const text = encodeURIComponent(post.title || "");
  const enc = encodeURIComponent(url);

  const share = (network, href) => {
    trackEvent("blog_share", { network, post_title: post.title });
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("blog_share", { network: "copy_link", post_title: post.title });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn = "w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Share</span>
      <button className={btn} aria-label="Share on X" onClick={() => share("twitter", `https://twitter.com/intent/tweet?text=${text}&url=${enc}`)}>
        <Twitter className="w-4 h-4" />
      </button>
      <button className={btn} aria-label="Share on LinkedIn" onClick={() => share("linkedin", `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`)}>
        <Linkedin className="w-4 h-4" />
      </button>
      <button className={btn} aria-label="Share on Facebook" onClick={() => share("facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc}`)}>
        <Facebook className="w-4 h-4" />
      </button>
      <button className={btn} aria-label="Copy link" onClick={copy}>
        {copied ? <Check className="w-4 h-4 text-primary" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}