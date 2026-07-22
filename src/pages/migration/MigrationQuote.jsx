import { useParams, Link } from "react-router-dom";
import { Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";
import useMigrationProject from "@/hooks/useMigrationProject";

export default function MigrationQuote() {
  const { id } = useParams();
  const { data, loading, error } = useMigrationProject(id);
  if (loading) return <LoadingState />;
  if (error || !data?.project) return <ErrorState description={error || "Project not found."} />;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-sm text-primary font-semibold">MIGRATION QUOTE</p>
          <h1 className="font-sora text-3xl font-bold">{data.project.application_name}</h1>
        </div>
        <Button asChild variant="outline">
          <Link to={`/migration-planner/projects/${id}/report`}>View report</Link>
        </Button>
      </div>
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-[#0a0f1e]" />
        </div>
        <h2 className="font-sora text-2xl font-bold mb-2">Your custom quote is on its way</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Every migration is different, so we prepare each quote by hand. You'll receive a
          custom quote via email within 24 hours.
        </p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
          <Clock className="w-4 h-4" /> Delivered within 24 hours
        </p>
      </div>
    </div>
  );
}