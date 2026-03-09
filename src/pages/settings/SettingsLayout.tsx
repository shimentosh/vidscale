import { NavLink, Outlet } from "react-router-dom";
import { Settings as SettingsIcon, Key, HardDrive, Type, Link2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/settings", end: true, label: "General", icon: SettingsIcon },
  { to: "/settings/api", end: false, label: "API Settings", icon: Key },
  { to: "/settings/local-ai", end: false, label: "Local machine AI", icon: Cpu },
  { to: "/settings/fonts", end: false, label: "Fonts", icon: Type },
  { to: "/settings/integration", end: false, label: "Integration", icon: Link2 },
  { to: "/settings/storage", end: false, label: "Storage", icon: HardDrive },
];

export function SettingsLayout() {
  return (
    <div className="flex w-full h-full min-h-0">
      <aside className="w-56 shrink-0 border-r border-border bg-background flex flex-col py-6">
        <div className="px-4 mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </h2>
        </div>
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
