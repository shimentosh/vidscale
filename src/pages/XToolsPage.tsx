import { useState } from "react";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "audio-merging", label: "Audio Merging Tools", icon: Music2 },
];

export function XToolsPage() {
  const [selectedId, setSelectedId] = useState(TOOLS[0].id);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 py-6 px-8 border-b border-border">
        <h1 className="text-2xl font-bold text-white tracking-tight">X Tools</h1>
        <p className="text-sm text-muted-foreground mt-2">Tools and utilities for your workflow.</p>
      </div>
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-56 shrink-0 border-r border-border bg-[#0D1117] py-4 flex flex-col">
          <nav className="px-2 space-y-0.5">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                  selectedId === id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex-1 overflow-auto p-8">
          {selectedId === "audio-merging" && (
            <div className="rounded-xl border border-border bg-[#131922] p-8 text-center text-muted-foreground">
              Audio Merging Tools — content for this tool will go here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
