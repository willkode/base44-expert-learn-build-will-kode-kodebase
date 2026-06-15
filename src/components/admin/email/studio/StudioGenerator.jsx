import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const TONES = [
  "Professional", "Friendly", "Casual", "Enthusiastic", "Authoritative", "Playful", "Urgent",
];

const TYPES = [
  "newsletter", "product_launch", "promotion", "announcement",
  "nurture", "onboarding", "reactivation", "event", "changelog", "custom",
];

export default function StudioGenerator({ onGenerate, generating }) {
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [campaignType, setCampaignType] = useState("newsletter");

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-sora font-semibold">AI Generator</h3>
      </div>

      <div className="space-y-2">
        <Label>What's this email about?</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Announce our new AI Blueprint feature that turns app ideas into developer-ready specs. Invite users to try it free."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Campaign type</Label>
          <Select value={campaignType} onValueChange={setCampaignType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        className="w-full"
        disabled={generating || !prompt.trim()}
        onClick={() => onGenerate({ prompt: prompt.trim(), tone, campaignType })}
      >
        {generating ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" /> Generate email</>
        )}
      </Button>
    </div>
  );
}