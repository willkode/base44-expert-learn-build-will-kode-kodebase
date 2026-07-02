import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PartyPopper, Crown } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

// Shown when the user lands on the dashboard right after a successful product
// purchase (?purchase=success&item=...). Clears the URL params on close.
export default function PurchaseThankYouDialog() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("purchase") === "success") {
      setItemName(urlParams.get("item") || "");
      setOpen(true);
    }
  }, []);

  const close = () => {
    setOpen(false);
    navigate("/dashboard", { replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-md text-center">
        <div className="pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mx-auto mb-5">
            <PartyPopper className="w-8 h-8 text-[#0a0f1e]" />
          </div>
          <h2 className="font-sora font-bold text-2xl mb-2">Thank you for your purchase!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {itemName ? <><span className="text-foreground font-medium">{itemName}</span> is now yours. </> : "Your payment went through. "}
            You'll find it under <span className="text-foreground font-medium">My Products</span> below, ready to download anytime.
          </p>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold">Level up: go Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Pro members get 40% off every product & service, 25 blueprints a month, full Prompt Vault access, and a free monthly strategy call.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                trackEvent("post_purchase_pro_upsell_click", {});
                setOpen(false);
                navigate("/pro");
              }}
            >
              Explore Pro Membership
            </Button>
          </div>
          <Button onClick={close} className="w-full font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}