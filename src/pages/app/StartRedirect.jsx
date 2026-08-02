import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";

// Default landing after login: admins go to the admin dashboard, everyone else
// to their workspace dashboard. /dashboard itself stays open to admins too.
export default function StartRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => navigate(u?.role === "admin" ? "/admin" : "/dashboard", { replace: true }))
      .catch(() => navigate("/dashboard", { replace: true }));
  }, []);

  return <LoadingState label="Loading your workspace..." />;
}