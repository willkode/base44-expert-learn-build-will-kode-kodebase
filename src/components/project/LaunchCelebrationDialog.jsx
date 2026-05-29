import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Twitter, Linkedin, Facebook, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function LaunchCelebrationDialog({ open, onOpenChange, appName, appUrl }) {
  const name = appName || "my app";
  const shareUrl = appUrl?.trim() ? appUrl.trim() : "https://forgebase.us";
  const shareText = `I just finished building ${name} with @ForgeBaseAI! 🚀 Planned right, built right, launch ready. Check it out: ${shareUrl} #BuiltWithForgeBase`;
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!open) return;
    const duration = 1800;
    const end = Date.now() + duration;
    const colors = ["#f97316", "#fb923c", "#ffffff", "#3b82f6"];
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [open]);

  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  const copyText = async () => {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setCopied(true);
    toast.success("Copied — paste it anywhere!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark max-w-md text-center border-primary/40 bg-gradient-to-br from-primary/15 to-card glow-orange">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-2">
          <PartyPopper className="w-8 h-8" />
        </div>
        <h2 className="font-sora font-bold text-2xl">100% Launch Ready! 🎉</h2>
        <p className="text-muted-foreground mt-2">
          Congratulations — <span className="text-foreground font-semibold">{name}</span> is fully
          built, reviewed and ready to ship. Share it with our community to help boost your app!
        </p>

        <div className="mt-5 rounded-xl border border-border bg-card/70 p-4 text-left text-sm text-foreground">
          {shareText}
        </div>

        <div className="flex items-center justify-center gap-2 mt-5">
          <Button asChild className="bg-[#1d9bf0] hover:bg-[#1d9bf0]/90 text-white font-semibold">
            <a href={twitter} target="_blank" rel="noopener noreferrer">
              <Twitter className="w-4 h-4 mr-1.5" /> X
            </a>
          </Button>
          <Button asChild className="bg-[#0a66c2] hover:bg-[#0a66c2]/90 text-white font-semibold">
            <a href={linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-4 h-4 mr-1.5" /> LinkedIn
            </a>
          </Button>
          <Button asChild className="bg-[#1877f2] hover:bg-[#1877f2]/90 text-white font-semibold">
            <a href={facebook} target="_blank" rel="noopener noreferrer">
              <Facebook className="w-4 h-4 mr-1.5" /> Facebook
            </a>
          </Button>
        </div>

        <Button variant="outline" onClick={copyText} className="w-full mt-3">
          {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
          {copied ? "Copied!" : "Copy share text"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}