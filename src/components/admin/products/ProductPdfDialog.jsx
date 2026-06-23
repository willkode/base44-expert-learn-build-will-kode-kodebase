import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Download, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ProductPdfDialog({ open, onOpenChange, product, onSaved }) {
  const [deliversPdf, setDeliversPdf] = useState(false);
  const [fileName, setFileName] = useState("");
  const [hasFile, setHasFile] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && product) {
      setDeliversPdf(!!product.deliversPdf);
      setFileName(product.pdfFileName || "");
      setHasFile(!!product.pdfFileUri);
      setPendingFile(null);
    }
  }, [open, product]);

  const handleFilePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }
    setPendingFile(f);
    setFileName(f.name);
    setHasFile(true);
    setDeliversPdf(true);
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      // Upload any new file to PRIVATE storage so the PDF is never publicly
      // reachable; paid downloads are signed on demand by getProductDownload.
      const updates = { deliversPdf };
      if (pendingFile) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: pendingFile });
        updates.pdfFileUri = file_uri;
      }
      if (fileName) updates.pdfFileName = fileName;
      await base44.entities.Product.update(product.id, updates);
      toast.success("Download settings saved");
      onSaved?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e.message || "Couldn't save download settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage download — {product?.name}</DialogTitle>
          <DialogDescription>
            Upload the PDF buyers receive after purchase. Files are stored privately and
            delivered through secure, time-limited links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3">
            <div>
              <p className="font-medium text-sm">Delivers a downloadable PDF</p>
              <p className="text-xs text-muted-foreground">Buyers see a download button after paying.</p>
            </div>
            <Switch checked={deliversPdf} onCheckedChange={setDeliversPdf} />
          </div>

          <div>
            <Label className="mb-2 block">PDF file</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFilePick}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-4 py-4 text-left hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {hasFile ? <FileText className="w-5 h-5 text-primary" /> : <Upload className="w-5 h-5 text-primary" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {pendingFile ? pendingFile.name : hasFile ? (product?.pdfFileName || "Current file") : "Upload a PDF"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pendingFile ? "New file ready to save" : hasFile ? "Click to replace" : "Click to choose a file"}
                </p>
              </div>
              {hasFile && !pendingFile && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
            </button>
          </div>

          {hasFile && (
            <div>
              <Label htmlFor="pdfFileName" className="mb-2 block">Download filename</Label>
              <Input
                id="pdfFileName"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="prompt-pack.pdf"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}