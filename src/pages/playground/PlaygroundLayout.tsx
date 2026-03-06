import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, path: "topic", label: "Topic" },
  { step: 2, path: "hook-writing", label: "Hook Writing" },
  { step: 3, path: "script-writing", label: "Script Writing" },
  { step: 4, path: "voice-overs", label: "Voice Overs" },
  { step: 5, path: "media-library", label: "Media Library" },
  { step: 6, path: "overlays", label: "Overlays" },
  { step: 7, path: "subtitle", label: "Subtitle" },
  { step: 8, path: "audio", label: "Audio" },
  { step: 9, path: "branding", label: "Branding" },
];

export function PlaygroundLayout() {
  return (
    <div className="flex w-full h-full min-h-0">
      <aside className="w-60 shrink-0 border-r border-border bg-[#0D1117] flex flex-col py-6">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Steps
          </h2>
        </div>
        <nav className="flex-1 px-2 space-y-0.5 overflow-auto">
          {STEPS.map(({ step, path, label }) => (
            <NavLink
              key={path}
              to={`/playground/${path}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )
              }
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-background/80 border border-border flex items-center justify-center text-xs font-semibold">
                {step}
              </span>
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
