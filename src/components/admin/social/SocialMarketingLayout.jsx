import React from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { socialNav } from "./socialNavConfig";
import SocialNotificationBell from "./notifications/SocialNotificationBell";

export default function SocialMarketingLayout() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/admin/marketing"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Marketing
        </Link>
        <SocialNotificationBell />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-border -mx-1 px-1">
        {socialNav.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`
            }
          >
            <Icon className="w-4 h-4" /> {label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}