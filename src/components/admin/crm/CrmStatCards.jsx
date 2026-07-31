import React from "react";
import { Card } from "@/components/ui/card";
import { SOURCE_LABELS } from "./crmSources";

export default function CrmStatCards({ rows }) {
  const stats = [
    { label: "Total submissions", value: rows.length },
    ...Object.keys(SOURCE_LABELS).map((key) => ({
      label: SOURCE_LABELS[key],
      value: rows.filter((r) => r.source === key).length,
    })),
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <Card key={s.label} className="p-4">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className="font-sora text-2xl font-bold mt-1">{s.value}</p>
        </Card>
      ))}
    </div>
  );
}