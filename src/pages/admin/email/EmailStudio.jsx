import React from "react";
import { Sparkles } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { useNavigate } from "react-router-dom";

export default function EmailStudio() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="Email Studio"
        description="Generate, edit, preview, test and approve emails with AI."
      />
      <EmptyState
        icon={Sparkles}
        title="AI Email Studio coming online"
        description="The AI generator, HTML/plain-text preview, subject line generation, test sends and approval workflow will live here. Configure Resend first to enable sending."
        actionLabel="Configure Resend"
        onAction={() => navigate("/admin/marketing/email/settings")}
      />
    </div>
  );
}