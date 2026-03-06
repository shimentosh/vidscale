import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FlaskConical,
    FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-border bg-sidebar flex items-center flex-col shrink-0 min-h-screen">
            <div className="p-4 w-full flex items-center gap-3 border-b border-border mb-4">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    S
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-sidebar-foreground uppercase tracking-wider">Shimanto Neer's...</h2>
                    <p className="text-xs text-muted-foreground">Personal</p>
                </div>
            </div>

            <nav className="flex-1 w-full px-3 space-y-1">
                <SidebarNavLink icon={<LayoutDashboard size={18} />} to="/" label="Dashboard" />
                <SidebarNavLink icon={<FlaskConical size={18} />} to="/playground" label="Playground" />
            </nav>

            <div className="w-full p-4 mt-auto border-t border-border space-y-4">
                <div>
                    <SidebarNavLink icon={<FolderOpen size={18} />} to="/media-library" label="Media Library" />
                </div>

                <div className="px-2 py-3 rounded-lg border border-border bg-background/50">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-amber-500/90 transition-all"
                            style={{ width: "86%" }}
                            aria-hidden
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        154.64 GB of shared 180 GB used
                    </p>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs">
                        SN
                    </div>
                    <div>
                        <p className="text-sm font-medium">Shimanto Neer</p>
                        <p className="text-xs text-muted-foreground">hello@shimantoneer.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function SidebarNavLink({ icon, to, label }: { icon: React.ReactNode; to: string; label: string }) {
    return (
        <NavLink
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive ? "bg-primary/20 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
            }
        >
            {({ isActive }) => (
                <>
                    <span className={isActive ? "text-primary" : "text-muted-foreground"}>{icon}</span>
                    {label}
                </>
            )}
        </NavLink>
    );
}

