import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Check,
  ImagePlus,
  Building2,
  GitBranch,
  FolderOutput,
} from "lucide-react";
import {
  getWorkspaces,
  getCurrentWorkspaceId,
  setCurrentWorkspaceId,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  type Workspace,
} from "@/lib/workspaces";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

const mainNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/workflow", label: "Workflow", icon: GitBranch },
  { to: "/outputs", label: "Outputs", icon: FolderOutput },
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
  const { open: expanded } = useSidebar();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getWorkspaces());
  const currentId = getCurrentWorkspaceId();
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editLogoRef = useRef<HTMLInputElement>(null);

  const refresh = () => setWorkspaces(getWorkspaces());

  useEffect(() => {
    if (!workspaceOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setWorkspaceOpen(false);
    };
    window.addEventListener("mousedown", onOutside);
    return () => window.removeEventListener("mousedown", onOutside);
  }, [workspaceOpen]);

  const handleCreate = () => {
    if (!createName.trim()) return;
    createWorkspace({ name: createName.trim() });
    setCreateName("");
    setAddFormVisible(false);
    refresh();
    setWorkspaceOpen(false);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateWorkspace(editingId, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
      refresh();
    }
  };

  const handleRemove = (id: string) => {
    if (removeConfirmId === id) {
      deleteWorkspace(id);
      setRemoveConfirmId(null);
      refresh();
      setWorkspaceOpen(false);
    } else {
      setRemoveConfirmId(id);
    }
  };

  return (
    <aside
      className={cn(
        "relative border-r border-border bg-sidebar flex flex-col shrink-0 min-h-screen transition-[width] duration-200 z-10",
        expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
        workspaceOpen ? "overflow-visible" : "overflow-hidden"
      )}
      aria-expanded={expanded}
    >
      {/* Workspace switcher — professional card-style trigger + dropdown */}
      <div
        className={cn(
          "flex border-b border-border shrink-0 transition-[padding] duration-200 relative",
          expanded ? "p-2" : "p-2"
        )}
      >
        <div className="relative flex-1 min-w-0 w-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => expanded && setWorkspaceOpen((o) => !o)}
            className={cn(
              "flex items-center w-full rounded-lg transition-all duration-200 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              expanded
                ? "gap-2 p-2 bg-sidebar-accent/50 hover:bg-sidebar-accent border border-border/50"
                : "justify-center p-1.5 hover:bg-sidebar-accent rounded-md"
            )}
            aria-expanded={workspaceOpen}
            aria-haspopup="true"
            aria-label="Switch workspace"
          >
            {current?.logoUrl ? (
              <img src={current.logoUrl} alt="" className="w-8 h-8 rounded-md bg-muted object-cover shrink-0 ring-1 ring-black/5" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0 shadow-sm">
                {(current?.name ?? "W").slice(0, 1).toUpperCase()}
              </div>
            )}
            {expanded && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">{current?.name ?? "Workspace"}</p>
                  <p className="text-xs text-muted-foreground truncate">Current workspace</p>
                </div>
                <ChevronDown size={16} className={cn("shrink-0 text-muted-foreground transition-transform duration-200", workspaceOpen && "rotate-180")} />
              </>
            )}
          </button>

          {expanded && workspaceOpen && createPortal(
            <button
              type="button"
              aria-label="Close workspace menu"
              className="fixed inset-0 z-[5] bg-black/20 backdrop-blur-sm"
              onClick={() => setWorkspaceOpen(false)}
            />,
            document.body
          )}
          {expanded && workspaceOpen && (
            <div className="absolute left-full top-0 ml-0 z-20 w-72 min-w-[280px] max-w-[320px] rounded-xl border border-border bg-sidebar shadow-xl overflow-hidden">
              <div className="px-4 pt-3 pb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</p>
              </div>
              <div className="max-h-[260px] overflow-y-auto py-1">
                {workspaces.map((w) => (
                  <div key={w.id} className="px-1">
                    {editingId === w.id ? (
                      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2.5">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                          className="h-9 text-sm"
                          autoFocus
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                        />
                        <input
                          ref={editLogoRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          aria-label="Upload logo"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            const id = editingId;
                            if (file && id) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateWorkspace(id, { logoUrl: reader.result as string });
                                refresh();
                              };
                              reader.readAsDataURL(file);
                            }
                            e.target.value = "";
                          }}
                        />
                        <button type="button" onClick={() => editLogoRef.current?.click()} className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent">
                          <ImagePlus size={14} /> {w.logoUrl ? "Change logo" : "Upload logo"}
                        </button>
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => { setEditingId(null); setEditName(""); }} className="flex-1 h-8 rounded-md text-sm border border-border hover:bg-sidebar-accent">Cancel</button>
                          <button type="button" onClick={handleSaveEdit} className="flex-1 h-8 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5"><Check size={14} /> Save</button>
                        </div>
                      </div>
                    ) : removeConfirmId === w.id ? (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2.5">
                        <p className="text-sm text-foreground">Delete &quot;{w.name}&quot;?</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setRemoveConfirmId(null)} className="flex-1 h-8 rounded-md text-sm hover:bg-sidebar-accent">Cancel</button>
                          <button type="button" onClick={() => handleRemove(w.id)} className="flex-1 h-8 rounded-md text-sm bg-destructive text-destructive-foreground flex items-center justify-center gap-1.5"><Trash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent/80 transition-colors">
                        <button
                          type="button"
                          onClick={() => { setCurrentWorkspaceId(w.id); setWorkspaceOpen(false); }}
                          className="flex-1 flex items-center gap-3 min-w-0 text-left"
                        >
                          {w.logoUrl ? (
                            <img src={w.logoUrl} alt="" className="w-6 h-6 rounded-md object-cover shrink-0" />
                          ) : (
                            <span className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Building2 size={14} className="text-muted-foreground" />
                            </span>
                          )}
                          <span className="truncate text-sm font-medium text-sidebar-foreground">{w.name}</span>
                          {currentId === w.id && <Check size={16} className="shrink-0 text-primary ml-auto" aria-hidden />}
                        </button>
                        {(manageMode || workspaces.length > 1) && editingId !== w.id && removeConfirmId !== w.id && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button type="button" onClick={() => { setEditingId(w.id); setEditName(w.name); setRemoveConfirmId(null); }} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent" aria-label="Edit"><Pencil size={14} /></button>
                            {workspaces.length > 1 && (
                              <button type="button" onClick={() => { setRemoveConfirmId(w.id); setEditingId(null); }} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 size={14} /></button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-0.5" />
              <div className="py-1.5">
                <button
                  type="button"
                  onClick={() => setManageMode((m) => !m)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium text-left transition-colors",
                    manageMode ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Settings size={14} className="shrink-0" />
                  Manage workspaces
                </button>
                <button
                  type="button"
                  onClick={() => setAddFormVisible((v) => !v)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 text-left transition-colors rounded-md"
                >
                  <Plus size={14} className="shrink-0" />
                  Add workspace
                </button>
                {addFormVisible && (
                  <div className="px-4 py-3 border-t border-border/60 bg-muted/20 flex gap-2">
                    <Input
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="Workspace name"
                      className="h-9 text-sm flex-1 bg-background/80"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreate())}
                    />
                    <button type="button" onClick={handleCreate} className="h-9 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
