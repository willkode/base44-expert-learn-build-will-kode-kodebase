import React from "react";
import { MoreHorizontal, Eye, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { STATUS_ACTIONS, updateIssueStatus, copyToClipboard } from "@/components/admin/security/issues/issueActions";

// Per-row actions: View Details, Copy Fix Prompt, and the status workflow.
export default function IssueRowActions({ issue, onView, onChanged }) {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!issue.fix_prompt) {
      toast({ title: "No fix prompt", description: "This issue has no fix prompt to copy.", variant: "destructive" });
      return;
    }
    const ok = await copyToClipboard(issue.fix_prompt);
    if (ok) toast({ title: "Fix prompt copied" });
    else { onView(issue); toast({ title: "Copy not available", description: "Use the selectable text in the detail panel.", variant: "destructive" }); }
  };

  const handleStatus = async (status) => {
    if (status === "False Positive") {
      // False positive needs a reason — route through the detail drawer.
      onView(issue);
      toast({ title: "Reason required", description: "Add a false-positive reason in the detail panel." });
      return;
    }
    await updateIssueStatus(issue, status);
    onChanged?.();
    toast({
      title: `Marked ${status}`,
      description: status === "Fixed" ? "Run a retest to confirm the fix." : undefined,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary">
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onView(issue)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}><Copy className="w-4 h-4 mr-2" /> Copy Fix Prompt</DropdownMenuItem>
        <DropdownMenuSeparator />
        {STATUS_ACTIONS.map((a) => (
          <DropdownMenuItem key={a.status} onClick={() => handleStatus(a.status)}>{a.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}