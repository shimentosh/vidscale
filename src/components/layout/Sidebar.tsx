import { NavLink } from "react-router-dom";
import {
  Home,
  FolderKanban,
  LayoutTemplate,
  Palette,
  BarChart3,
  ImageIcon,
  Film,
  FlaskConical,
  FolderOpen,
  Wrench,
  Sparkles,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

const mainNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/brand-kits", label: "Brand Kit", icon: Palette },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/x-tools", label: "X Tools", icon: Wrench },
] as const;

const aiWorkspaceNav = [
  { to: "/ai-editor", label: "Ai Editor", icon: Film },
  { to: "/ai-design", label: "Ai Design", icon: ImageIcon },
] as const;

/** Set to true and set planName when user has an active plan; otherwise Upgrade button shows */
const userUpgraded = false;
const planName = "Pro";

const SIDEBAR_EXPANDED_W = "w-64 min-w-64";
const SIDEBAR_COLLAPSED_W = "w-16 min-w-16";

export function Sidebar() {
  const { open: expanded, toggle } = useSidebar();
  return (
    <aside
      className={cn(
        "relative border-r border-border bg-sidebar flex flex-col shrink-0 min-h-screen transition-[width] duration-200 overflow-hidden z-10",
        expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W
      )}
      aria-expanded={expanded}
    >
      {/* Header: logo + optional text + collapse btn */}
      <div
        className={cn(
          "flex border-b border-border shrink-0 transition-[padding] duration-200 relative",
          expanded ? "flex-row items-center p-4 pr-10 gap-3" : "flex-col items-center p-3 gap-2"
        )}
      >
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
          S
        </div>
        {expanded && (
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider truncate">Shimanto Neer&apos;s...</h2>
            <p className="text-xs text-muted-foreground truncate">Personal</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors z-10 shrink-0 p-1.5",
            expanded ? "absolute top-3 right-3" : ""
          )}
          aria-label={expanded ? "Collapse to icons" : "Expand sidebar"}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>

      <nav className={cn("flex-1 px-2 overflow-y-auto", expanded ? "py-2" : "py-1")}>
        <div className={cn("space-y-0.5", expanded && "space-y-1")}>
          {mainNav.map(({ to, label, icon: Icon }) => (
            <SidebarNavLink key={to} icon={<Icon size={18} />} to={to} label={label} collapsed={!expanded} />
          ))}
        </div>

        {expanded ? (
          <div className="pt-3 pb-1">
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Ai Workspace
            </p>
            <div className="space-y-0.5">
              {aiWorkspaceNav.map(({ to, label, icon: Icon }) => (
                <SidebarNavLink key={to} icon={<Icon size={18} />} to={to} label={label} collapsed={false} />
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2 space-y-0.5">
            {aiWorkspaceNav.map(({ to, label, icon: Icon }) => (
              <SidebarNavLink key={to} icon={<Icon size={18} />} to={to} label={label} collapsed />
            ))}
          </div>
        )}

        <div className={expanded ? "pt-1" : "pt-2"}>
          <SidebarNavLink icon={<FlaskConical size={18} />} to="/playground" label="Playground" collapsed={!expanded} />
        </div>
      </nav>

      <div className={cn("mt-auto border-t border-border space-y-2", expanded ? "p-4 space-y-4" : "p-2")}>
        <SidebarNavLink icon={<FolderOpen size={18} />} to="/media-library" label="Media Library" collapsed={!expanded} />

        {expanded && (
          <div className="px-3 py-2.5 rounded-lg bg-muted/50">
            <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Storage</p>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: "86%" }} aria-hidden />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">155 of 180 GB used · 25 GB free</p>
          </div>
        )}

        <div className={cn("flex items-center gap-2", !expanded && "flex-col gap-1")}>
          <NavLink
            to="/settings"
            title="Settings"
            className={({ isActive }) =>
              cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                expanded ? "gap-2 px-3 py-2 flex-1 min-w-0" : "justify-center p-2 w-full",
                isActive ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Settings size={18} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                {expanded && <span className="truncate">Settings</span>}
              </>
            )}
          </NavLink>
          {userUpgraded ? (
            expanded ? (
              <div className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-xs font-semibold text-primary">{planName}</span>
              </div>
            ) : (
              <div className="w-full flex justify-center px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20" title={planName}>
                <Sparkles size={16} className="text-primary" />
              </div>
            )
          ) : (
            <button
              type="button"
              aria-label="Upgrade plan"
              title="Upgrade"
              className={cn(
                "flex shrink-0 rounded-lg font-medium hover:opacity-90 transition-opacity",
                expanded ? "items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm" : "items-center justify-center p-2 w-full bg-primary text-primary-foreground"
              )}
            >
              <Sparkles size={expanded ? 14 : 18} />
              {expanded && <span>Upgrade</span>}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  icon,
  to,
  label,
  collapsed,
}: {
  icon: React.ReactNode;
  to: string;
  label: string;
  collapsed: boolean;
}) {
  const isHome = to === "/";
  return (
    <NavLink
      to={to}
      end={isHome}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md transition-colors text-sm font-medium",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
          isActive ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground")}>{icon}</span>
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}
