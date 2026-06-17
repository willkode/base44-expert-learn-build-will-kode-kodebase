import React from "react";
import { Twitter, Heart, Repeat2, MessageCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { countChars, countHashtags, TWITTER_CHAR_LIMIT, TWITTER_MAX_HASHTAGS } from "./twitterConfig";

function TweetRow({ text, image, isFirst, index }) {
  const over = countChars(text) > TWITTER_CHAR_LIMIT;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 shrink-0" />
        {!isFirst && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="min-w-0 flex-1 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">KodeBase</span>
          <span className="text-xs text-muted-foreground">@kodebase</span>
          {index != null && <span className="text-[10px] text-muted-foreground ml-auto">{index}</span>}
        </div>
        <p className="text-sm whitespace-pre-wrap mt-0.5">{text || "Your tweet…"}</p>
        {isFirst && image && (
          <img src={image} alt="" className="mt-2 w-full max-h-64 object-cover rounded-xl border border-border" />
        )}
        <div className="flex items-center gap-6 mt-2 text-muted-foreground">
          <MessageCircle className="w-3.5 h-3.5" />
          <Repeat2 className="w-3.5 h-3.5" />
          <Heart className="w-3.5 h-3.5" />
          <span className={`text-[10px] tabular-nums ml-auto ${over ? "text-red-400" : "text-muted-foreground"}`}>
            {countChars(text)}/{TWITTER_CHAR_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
}

// Read-only X/Twitter preview (single post or thread) driven by the live payload.
export default function TwitterPreview({ tw = {} }) {
  const thread = Array.isArray(tw.thread) ? tw.thread.filter((t) => (t || "").trim()) : [];
  const tweets = [tw.text || "", ...thread];
  const total = tweets.filter((t) => (t || "").trim()).length || 1;
  const tooManyTags = countHashtags(tw.text) > TWITTER_MAX_HASHTAGS;
  const poll = (tw.poll_options || []).filter((o) => (o || "").trim());

  return (
    <div className="rounded-xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background/40">
        <Twitter className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">X / Twitter preview</span>
        {thread.length > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground ml-auto">
            Thread · {total} tweets
          </span>
        )}
      </div>
      <div className="p-4">
        {tweets.map((t, i) => (
          (i === 0 || (t || "").trim()) && (
            <TweetRow
              key={i}
              text={t}
              image={tw.media_url}
              isFirst={i === tweets.length - 1 || (i === 0 && thread.length === 0)}
              index={total > 1 ? `${i + 1}/${total}` : null}
            />
          )
        ))}

        {poll.length >= 2 && (
          <div className="mt-1 ml-11 space-y-1.5">
            {poll.map((o, i) => (
              <div key={i} className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> {o}
              </div>
            ))}
          </div>
        )}

        {tooManyTags && (
          <p className="flex items-start gap-1.5 text-xs text-amber-400 mt-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {countHashtags(tw.text)} hashtags — 1–2 perform best on X.
          </p>
        )}
      </div>
    </div>
  );
}