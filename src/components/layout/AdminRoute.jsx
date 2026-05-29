import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import ErrorState from "@/components/shared/ErrorState";

export default function AdminRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Checking access..." />;

  if (user?.role !== "admin") {
    return (
      <ErrorState
        title="Admin access required"
        description="You don't have permission to view this area. Contact an administrator if you believe this is a mistake."
      />
    );
  }

  return <Outlet />;
}