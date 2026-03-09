import { Link } from "react-router-dom";
import { FolderKanban, LayoutTemplate, Palette, BarChart3, Sparkles, FlaskConical } from "lucide-react";

const quickLinks = [
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/brand-kits", label: "Brand Kit", icon: Palette },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/ai-design", label: "Ai Design", icon: Sparkles },
  { to: "/playground", label: "Playground", icon: FlaskConical },
];

export function HomePage() {
  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex-1 min-h-0 overflow-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground tracking-tight mb-1">Home</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Welcome back. Jump to a section below or use the sidebar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-foreground hover:border-primary/40 hover:bg-card/80 transition-colors"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-md bg-white/5 text-muted-foreground">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
