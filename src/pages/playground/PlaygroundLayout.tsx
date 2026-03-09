import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: 1, path: "topic", label: "Topic" },
  { step: 2, path: "script-writing", label: "Script Writing" },
  { step: 3, path: "voice-overs", label: "Voice Overs" },
  { step: 4, path: "media-library", label: "Media Library" },
  { step: 5, path: "overlays", label: "Overlays" },
  { step: 6, path: "subtitle", label: "Subtitle" },
  { step: 7, path: "audio", label: "Audio" },
  { step: 8, path: "brand-kit", label: "Brand Kit" },
  { step: 9, path: "export", label: "Export" },
];

export function PlaygroundLayout() {
  return (
    <div className="flex w-full h-full min-h-0">
      <aside className="w-[200px] min-w-[200px] shrink-0 flex flex-col border-r border-border bg-background">
        <div className="shrink-0 px-4 pt-5 pb-3 border-b border-border">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Steps
          </h2>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-0.5">
          {STEPS.map(({ step, path, label }) => (
            <NavLink
              key={path}
              to={`/playground/${path}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[40px]",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )
              }
            >
              <span
                className={cn(
                  "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                  "bg-background/80 border border-border"
                )}
              >
                {step}
              </span>
              <span className="truncate">{label}</span>
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
