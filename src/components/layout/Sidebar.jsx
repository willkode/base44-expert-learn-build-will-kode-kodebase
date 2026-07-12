import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, LogOut, Shield } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { userNav, adminNav } from "./navConfig";
import NewProjectModal from "@/components/project/NewProjectModal";

export default function Sidebar({ user, onNavigate }) {
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const [modalOpen, setModalOpen] = useState(false);

  const baseClass = (active) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
    }`;

  const NavLink = ({ item }) => {
    if (item.action === "newProject") {
      return (
        <button onClick={() => { onNavigate?.(); setModalOpen(true); }} className={baseClass(false)}>
          <item.icon className="w-4.5 h-4.5 shrink-0" />
          {item.label}
        </button>
      );
    }
    const active =
      location.pathname === item.to ||
      (item.to !== "/dashboard" && item.to !== "/admin" && location.pathname.startsWith(item.to));
    return (
      <Link to={item.to} onClick={onNavigate} className={baseClass(active)}>
        <item.icon className="w-4.5 h-4.5 shrink-0" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card/60 border-r border-border w-64">
      <NewProjectModal open={modalOpen} onOpenChange={setModalOpen} />
      <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <img src="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/7ac1b8038_7feb47fe7_kode-base-logo-white.png" alt="KodeBase" className="h-8 w-auto" />
        <span className="font-sora font-bold text-base tracking-tight">
          <span className="text-white">KODE</span><span className="text-primary">BASE</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        {userNav.map((item) => (
          <NavLink key={item.to} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className="flex items-center gap-2 px-3 pt-6 pb-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
            </div>
            {adminNav.map((item) => (
              <NavLink key={item.to} item={item} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold uppercase">
            {(user?.full_name || user?.email || "?")[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log out
        </button>
      </div>
    </div>
  );
}