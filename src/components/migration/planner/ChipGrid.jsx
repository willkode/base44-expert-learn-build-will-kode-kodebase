import { CheckCircle2 } from "lucide-react";

// Compact pill grid for long feature/dependency lists.
export default function ChipGrid({ items }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((item) => (
        <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          {item}
        </span>
      ))}
    </div>
  );
}