import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Tag, ListPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BulkActionsBar({ selectedIds, lists, onDone, onClear }) {
  const [tags, setTags] = useState("");
  const [listId, setListId] = useState("");
  const [busy, setBusy] = useState(null);

  const run = async (action, fnName, payload) => {
    setBusy(action);
    try {
      const res = await base44.functions.invoke(fnName, payload);
      if (res.data?.error) throw new Error(res.data.error);
      toast.success("Done");
      onDone();
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 mb-4">
      <span className="text-sm font-medium">{selectedIds.length} selected</span>
      <div className="flex items-center gap-1.5">
        <Input value={tags} placeholder="tag1, tag2" onChange={(e) => setTags(e.target.value)} className="h-8 w-36" />
        <Button size="sm" variant="outline" disabled={!tagList.length || !!busy}
          onClick={() => run("addTags", "addTagsToContacts", { contactIds: selectedIds, tags: tagList })}>
          {busy === "addTags" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5 mr-1" />} Add tags
        </Button>
        <Button size="sm" variant="outline" disabled={!tagList.length || !!busy}
          onClick={() => run("removeTags", "removeTagsFromContacts", { contactIds: selectedIds, tags: tagList })}>
          Remove tags
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        <Select value={listId} onValueChange={setListId}>
          <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Choose list" /></SelectTrigger>
          <SelectContent>
            {(lists || []).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" disabled={!listId || !!busy}
          onClick={() => run("addToList", "addContactsToList", { listId, contactIds: selectedIds })}>
          {busy === "addToList" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListPlus className="w-3.5 h-3.5 mr-1" />} Add to list
        </Button>
      </div>
      <Button size="sm" variant="ghost" onClick={onClear} className="ml-auto">
        <X className="w-3.5 h-3.5 mr-1" /> Clear
      </Button>
    </div>
  );
}