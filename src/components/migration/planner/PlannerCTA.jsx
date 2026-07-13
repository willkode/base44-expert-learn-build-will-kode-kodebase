import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { trackEvent } from "@/lib/analytics";

export default function PlannerCTA({ label = "Start Your Migration Assessment", location = "hero" }) {
  const { isAuthenticated } = useAuth();
  return (
    <Button asChild size="lg" onClick={() => trackEvent("migration_assessment_start", { location })}>
      <Link to={isAuthenticated ? "/migration-planner/new" : "/register"}>
        {label} <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
  );
}