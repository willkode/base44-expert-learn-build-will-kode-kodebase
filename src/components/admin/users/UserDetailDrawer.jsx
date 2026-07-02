import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, FolderOpen, Calendar, Mail, User, ShieldCheck, Download, Globe } from "lucide-react";

const ROLES = ["user", "admin"];
const PLANS = ["free", "pro", "agency"];

export default function UserDetailDrawer({ user, open, onClose, projectCount, onUpdated }) {
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(null); // productId being toggled

  useEffect(() => {
    if (!open || !user) return;
    setLoadingData(true);
    Promise.all([
      base44.entities.Product.filter({ active: true }),
      base44.entities.Payment.filter({ userId: user.id }),
      base44.entities.DownloadLog.filter({ userId: user.id }, "-created_date", 50).catch(() => []),
    ]).then(([prods, pays, dls]) => {
      setProducts(prods.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setPayments(pays);
      setDownloads(dls);
      setLoadingData(false);
    });
  }, [open, user]);

  if (!user) return null;

  const paidProductIds = new Set(
    payments.filter((p) => p.status === "completed" && p.productId).map((p) => p.productId)
  );

  const update = async (data, label) => {
    await base44.entities.User.update(user.id, data);
    toast.success(label || "User updated");
    onUpdated?.();
  };

  const toggleProduct = async (product, hasAccess) => {
    setSaving(product.id);
    try {
      if (hasAccess) {
        // Remove access: find and delete the matching payment record
        const match = payments.find((p) => p.productId === product.id && p.status === "completed");
        if (match) {
          await base44.entities.Payment.update(match.id, { status: "failed", errorMessage: "Access revoked by admin" });
          setPayments((prev) => prev.map((p) => p.id === match.id ? { ...p, status: "failed" } : p));
        }
        toast.success(`Access to "${product.name}" revoked`);
      } else {
        // Grant access: create a payment record marked completed
        const newPayment = await base44.entities.Payment.create({
          userId: user.id,
          userEmail: user.email,
          productId: product.id,
          itemName: product.name,
          amountCents: 0,
          currency: "USD",
          status: "completed",
          errorMessage: "Access granted by admin",
        });
        setPayments((prev) => [...prev, newPayment]);
        toast.success(`Access to "${product.name}" granted`);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-border">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-sora font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {user.full_name || "Unknown User"}
          </SheetTitle>
        </SheetHeader>

        {/* User info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 shrink-0" />
            {user.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            Joined {user.created_date ? format(new Date(user.created_date), "MMMM d, yyyy") : "—"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderOpen className="w-4 h-4 shrink-0" />
            {projectCount || 0} project{projectCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Role & Plan */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Role
            </p>
            <Select value={user.role || "user"} onValueChange={(v) => update({ role: v }, "Role updated")}>
              <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Plan</p>
            <Select value={user.plan || "free"} onValueChange={(v) => update({ plan: v }, "Plan updated")}>
              <SelectTrigger className="h-8 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product access */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Package className="w-3.5 h-3.5" /> Product Access
          </p>

          {loadingData ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products found.</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => {
                const hasAccess = paidProductIds.has(product.id);
                const isSaving = saving === product.id;
                return (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/40 hover:border-primary/30 transition-colors"
                  >
                    <div className="mt-0.5">
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      ) : (
                        <Checkbox
                          checked={hasAccess}
                          onCheckedChange={() => toggleProduct(product, hasAccess)}
                          id={`product-${product.id}`}
                        />
                      )}
                    </div>
                    <label
                      htmlFor={`product-${product.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{product.name}</span>
                        {hasAccess && (
                          <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">
                            Has Access
                          </Badge>
                        )}
                      </div>
                      {product.tagline && (
                        <p className="text-xs text-muted-foreground mt-0.5">{product.tagline}</p>
                      )}
                      {product.priceCents > 0 && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          ${(product.priceCents / 100).toFixed(2)}
                        </p>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Purchase history */}
        {payments.filter((p) => p.status === "completed").length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Purchase History
            </p>
            <div className="space-y-2">
              {payments
                .filter((p) => p.status === "completed")
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-background/40 border border-border">
                    <span className="text-foreground truncate max-w-[60%]">{p.itemName || p.productId || "—"}</span>
                    <span className="text-muted-foreground text-xs">
                      {p.amountCents > 0 ? `$${(p.amountCents / 100).toFixed(2)}` : "Free / Admin"} ·{" "}
                      {p.created_date ? format(new Date(p.created_date), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Download activity */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Download Activity
          </p>
          {downloads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No downloads yet.</p>
          ) : (
            <div className="space-y-2">
              {downloads.map((d) => (
                <div key={d.id} className="p-2.5 rounded-lg bg-background/40 border border-border text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-foreground truncate">{d.productName || d.productId || "—"}</span>
                    {d.emailed && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">Emailed</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {d.created_date ? format(new Date(d.created_date), "MMM d, yyyy · h:mm a") : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {d.ip || "unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}