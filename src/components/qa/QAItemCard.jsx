import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, MessageSquarePlus, Sparkles } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-secondary text-muted-foreground",
  passed: "bg-green-500/15 text-green-400",
  failed: "bg-destructive/15 text-destructive",
};

export default function QAItemCard({ item, onUpdate }) {
  const { openChatWith } = useOutletContext();
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");

  const askAssistant = () => {
    const parts = [
      `I'd like help with this QA checklist task.`,
      `Category: ${item.category}`,
      `Test: ${item.testName}`,
      item.description ? `Description: ${item.description}` : null,
      item.expectedResult ? `Expected result: ${item.expectedResult}` : null,
      `Status: ${item.status}`,
      item.notes ? `Notes: ${item.notes}` : null,
      `Please explain how to test this and how to fix it if it fails.`,
    ].filter(Boolean);
    openChatWith?.(parts.join("\n"));
  };

  const setStatus = async (status) => {
    await base44.entities.QAItem.update(item.id, { status });
    onUpdate();
  };

  const saveNotes = async () => {
    await base44.entities.QAItem.update(item.id, { notes });
    setShowNotes(false);
    onUpdate();
  };

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-5">
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{item.category}</span>
          <span className="font-medium text-sm">{item.testName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[item.status] || STATUS_STYLES.pending}`}>
            {item.status}
          </span>
          <button
            onClick={askAssistant}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
            aria-label="Ask the assistant about this task"
            title="Ask the assistant about this task"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {item.description && <p className="text-sm text-foreground/90 mb-1.5">{item.description}</p>}
      {item.expectedResult && <p className="text-sm text-muted-foreground mb-4"><span className="text-foreground/70">Expected: </span>{item.expectedResult}</p>}

      {item.notes && !showNotes && (
        <p className="text-sm text-muted-foreground mb-4 bg-secondary/50 rounded-lg px-3 py-2"><span className="text-foreground/70">Notes: </span>{item.notes}</p>
      )}

      {showNotes && (
        <div className="mb-4 space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." className="h-20" />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveNotes}>Save notes</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowNotes(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setStatus("passed")} disabled={item.status === "passed"}>
          <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-400" /> Pass
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStatus("failed")} disabled={item.status === "failed"}>
          <XCircle className="w-4 h-4 mr-1.5 text-destructive" /> Fail
        </Button>
        {!showNotes && (
          <Button variant="ghost" size="sm" onClick={() => setShowNotes(true)}>
            <MessageSquarePlus className="w-4 h-4 mr-1.5" /> {item.notes ? "Edit notes" : "Add notes"}
          </Button>
        )}
      </div>
    </div>
  );
}