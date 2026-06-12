import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { parseCSV, IMPORT_FIELDS, guessMapping } from "./csvUtils";

export default function ImportContactsDialog({ open, onOpenChange, lists, onImported }) {
  const [step, setStep] = useState("upload"); // upload | map | done
  const [headers, setHeaders] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [reactivate, setReactivate] = useState(false);
  const [listId, setListId] = useState("none");
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [errors, setErrors] = useState([]);

  const reset = () => { setStep("upload"); setHeaders([]); setDataRows([]); setMapping({}); setSummary(null); setErrors([]); setReactivate(false); setListId("none"); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) { toast.error("CSV must have a header row and at least one data row."); return; }
    setHeaders(rows[0]);
    setDataRows(rows.slice(1));
    setMapping(guessMapping(rows[0]));
    setStep("map");
  };

  const handleImport = async () => {
    if (mapping.email === undefined) { toast.error("Map the Email column first."); return; }
    setImporting(true);
    try {
      const mapped = dataRows.map((r) => {
        const obj = {};
        for (const f of IMPORT_FIELDS) {
          const idx = mapping[f.key];
          if (idx === undefined) continue;
          const val = (r[idx] || "").trim();
          obj[f.key] = f.key === "tags" ? val.split(",").map((t) => t.trim()).filter(Boolean) : val;
        }
        return obj;
      });
      const res = await base44.functions.invoke("importEmailContactsFromCSV", {
        rows: mapped,
        reactivateUnsubscribed: reactivate,
        listId: listId === "none" ? null : listId,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setSummary(res.data.summary);
      setErrors(res.data.errors || []);
      setStep("done");
      onImported();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="py-4">
            <label className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to choose a CSV file</span>
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            </label>
            <p className="text-xs text-muted-foreground mt-3">
              First row must be column headers. Up to 5,000 rows per import. Suppressed and unsubscribed contacts are protected automatically.
            </p>
          </div>
        )}

        {step === "map" && (
          <div className="py-2 space-y-4">
            <p className="text-sm text-muted-foreground">{dataRows.length} rows found. Map your CSV columns:</p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {IMPORT_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-3">
                  <Label className="text-sm shrink-0">{f.label}</Label>
                  <Select
                    value={mapping[f.key] !== undefined ? String(mapping[f.key]) : "skip"}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [f.key]: v === "skip" ? undefined : Number(v) }))}
                  >
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">— Skip —</SelectItem>
                      {headers.map((h, i) => <SelectItem key={i} value={String(i)}>{h || `Column ${i + 1}`}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm">Add imported contacts to list</Label>
              <Select value={listId} onValueChange={setListId}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No list</SelectItem>
                  {(lists || []).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border p-3">
              <Checkbox checked={reactivate} onCheckedChange={setReactivate} className="mt-0.5" />
              <div>
                <Label className="text-sm">Reactivate unsubscribed contacts</Label>
                <p className="text-xs text-muted-foreground">
                  Only enable this if these contacts explicitly re-opted in. Suppressed contacts always stay suppressed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleImport} disabled={importing}>
                {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import {dataRows.length} rows
              </Button>
            </div>
          </div>
        )}

        {step === "done" && summary && (
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[["Added", summary.added], ["Updated", summary.updated], ["Skipped", summary.skipped], ["Invalid", summary.invalid], ["Suppressed", summary.suppressed], ["Duplicates", summary.duplicates]].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-border p-3 text-center">
                  <p className="font-sora font-bold text-xl">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            {errors.length > 0 && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 max-h-32 overflow-y-auto">
                {errors.map((e, i) => <p key={i} className="text-xs text-yellow-200">{e}</p>)}
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => { onOpenChange(false); reset(); }}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}