import React, { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";

export default function EmailCalendar() {
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState([]);

  useEffect(() => {
    base44.entities.EmailCampaign.filter({ sendStatus: "scheduled" }, "-created_date", 200).then((c) => {
      setScheduled(c.filter((x) => x.scheduledAt).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading calendar..." />;

  return (
    <div>
      <PageHeader title="Calendar" description="Upcoming scheduled campaigns and sequence emails." />
      {scheduled.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nothing scheduled"
          description="Scheduled campaigns and automation emails will appear here on a timeline."
        />
      ) : (
        <div className="space-y-3">
          {scheduled.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.subject || "No subject yet"}</p>
              </div>
              <Badge variant="secondary">{new Date(c.scheduledAt).toLocaleString()}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}