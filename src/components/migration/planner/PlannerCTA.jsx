import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { trackEvent } from "@/lib/analytics";

export default function PlannerCTA({ label = "Start Your Migration Assessment", location = "hero" }) {
  const { isAuthenticated } = useAuth();
  return (
    <Button
      asChild
      size="lg"
      className="h-12 px-8 text-base rounded-full glow-orange transition-transform hover:scale-[1.03] active:scale-[0.98]"
      onClick={() => trackEvent("migration_assessment_start", { location })}
    >
      <Link to={isAuthenticated ? "/migration-planner/new" : "/register"}>
        {label} <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
  );
}