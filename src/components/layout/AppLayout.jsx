import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Sidebar from "./Sidebar";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background">
        <LoadingState label="Loading workspace..." />
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground font-inter flex">
      <Seo title="ForgeBase Workspace" noindex jsonLd={[]} />
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40">
        <Sidebar user={user} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className="flex-1 lg:pl-64 min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b border-border bg-background/80 backdrop-blur-xl">
          <span className="font-sora font-bold">ForgeBase</span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <main className="max-w-6xl mx-auto px-5 md:px-8 py-8">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}