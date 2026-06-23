import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Package, FileText, FileX, Download, Settings2, Eye, EyeOff } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProductPdfDialog from "@/components/admin/products/ProductPdfDialog";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Product.list("order", 500);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openManage = (p) => { setEditing(p); setDialogOpen(true); };

  const toggleDelivers = async (p) => {
    await base44.entities.Product.update(p.id, { deliversPdf: !p.deliversPdf });
    toast.success(p.deliversPdf ? "Download disabled" : "Download enabled");
    load();
  };

  const q = search.toLowerCase();
  const filtered = products.filter(
    (p) => !q || (p.name || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q)
  );

  const withPdf = products.filter((p) => p.deliversPdf && p.pdfFileUri).length;

  return (
    <div>
      <PageHeader
        title="Products & Downloads"
        description="Manage which products deliver a downloadable PDF after purchase."
      />

      {/* Stats */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm">
          <Package className="w-4 h-4 text-primary" />
          <span className="font-semibold">{products.length}</span>
          <span className="text-muted-foreground">products</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card/60 text-sm">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold">{withPdf}</span>
          <span className="text-muted-foreground">with PDF</span>
        </div>
      </div>

      <div className="mb-5">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <AdminTable
        columns={["Product", "Download", "File", "Status", "Actions"]}
        rows={filtered}
        loading={loading}
        emptyIcon={Package}
        emptyTitle="No products found"
        emptyDescription="Products synced from Square will appear here."
        renderRow={(p) => [
          <div className="flex items-center gap-3">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-medium truncate max-w-[220px]">{p.name}</div>
              <div className="text-xs text-muted-foreground">${((p.priceCents || 0) / 100).toFixed(2)}</div>
            </div>
          </div>,
          p.deliversPdf
            ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">Enabled</Badge>
            : <Badge variant="outline" className="text-muted-foreground text-xs">Off</Badge>,
          p.pdfFileUri
            ? <span className="inline-flex items-center gap-1.5 text-sm"><FileText className="w-4 h-4 text-primary" /><span className="truncate max-w-[160px]">{p.pdfFileName || "PDF uploaded"}</span></span>
            : <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><FileX className="w-4 h-4" /> None</span>,
          p.active === false
            ? <Badge variant="outline" className="text-muted-foreground text-xs">Inactive</Badge>
            : <Badge variant="secondary" className="text-xs">Active</Badge>,
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title={p.deliversPdf ? "Disable download" : "Enable download"} onClick={() => toggleDelivers(p)}>
              {p.deliversPdf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" title="Manage download" onClick={() => openManage(p)}>
              <Settings2 className="w-4 h-4" />
            </Button>
          </div>,
        ]}
      />

      <ProductPdfDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSaved={load}
      />
    </div>
  );
}