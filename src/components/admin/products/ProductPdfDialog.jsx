import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Save, X, Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Normalizes a product's deliverables into a single list, merging the legacy
// single-file fields (pdfFileUri/pdfFileName) with the newer pdfFiles array.
function existingFiles(product) {
  if (!product) return [];
  const list = Array.isArray(product.pdfFiles) ? [...product.pdfFiles] : [];
  if (list.length === 0 && product.pdfFileUri) {
    list.push({ fileUri: product.pdfFileUri, fileName: product.pdfFileName || "download.pdf" });
  }
  // Each item: { fileUri, fileName, pending? (File object not yet uploaded) }
  return list.map((f) => ({ fileUri: f.fileUri, fileName: f.fileName, pending: null }));
}

export default function ProductPdfDialog({ open, onOpenChange, product, onSaved }) {
  const [deliversPdf, setDeliversPdf] = useState(false);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && product) {
      setDeliversPdf(!!product.deliversPdf);
      setFiles(existingFiles(product));
    }
  }, [open, product]);

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-picking the same file
    const valid = picked.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (valid.length !== picked.length) toast.error("Only PDF files are allowed.");
    if (valid.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({ fileUri: null, fileName: f.name, pending: f })),
    ]);
    setDeliversPdf(true);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const renameFile = (idx, name) =>
    setFiles((prev) => prev.map((f, i) => (i === idx ? { ...f, fileName: name } : f)));

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      // Upload any pending files to PRIVATE storage, then persist the merged list.
      const resolved = [];
      for (const f of files) {
        if (f.pending) {
          const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: f.pending });
          resolved.push({ fileUri: file_uri, fileName: f.fileName });
        } else if (f.fileUri) {
          resolved.push({ fileUri: f.fileUri, fileName: f.fileName });
        }
      }

      // Keep legacy single-file fields in sync with the first file so existing
      // download logic and older clients keep working.
      const first = resolved[0];
      await base44.entities.Product.update(product.id, {
        deliversPdf,
        pdfFiles: resolved,
        pdfFileUri: first ? first.fileUri : "",
        pdfFileName: first ? first.fileName : "",
      });
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
          <DialogTitle>Manage downloads — {product?.name}</DialogTitle>
          <DialogDescription>
            Upload the file(s) buyers receive after purchase. Files are stored privately and
            delivered through secure, time-limited links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3">
            <div>
              <p className="font-medium text-sm">Delivers downloadable file(s)</p>
              <p className="text-xs text-muted-foreground">Buyers see download buttons after paying.</p>
            </div>
            <Switch checked={deliversPdf} onCheckedChange={setDeliversPdf} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Files ({files.length})</Label>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-3.5 h-3.5" /> Add files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="hidden"
              onChange={handleFilePick}
            />

            {files.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-4 py-5 text-left hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Upload PDF files</p>
                  <p className="text-xs text-muted-foreground">Click to choose one or more files</p>
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <Input
                      value={f.fileName}
                      onChange={(e) => renameFile(idx, e.target.value)}
                      placeholder="filename.pdf"
                      className="h-8 text-sm"
                    />
                    {f.pending && (
                      <span className="text-[10px] font-medium text-amber-400 shrink-0">NEW</span>
                    )}
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}