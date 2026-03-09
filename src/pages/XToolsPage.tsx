import { useState } from "react";
import {
  Music2,
  Scissors,
  ImagePlus,
  FileAudio,
  Mic,
  Video,
  Wand2,
  Merge,
  SplitSquareVertical,
  Minimize2,
  Volume2,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "audio-merging", label: "Audio merging", icon: Music2 },
  { id: "trim-split", label: "Trim & split", icon: Scissors },
  { id: "image-resize", label: "Image resize", icon: ImagePlus },
  { id: "extract-audio", label: "Extract audio", icon: FileAudio },
  { id: "voice-clean", label: "Voice cleanup", icon: Mic },
  { id: "compress", label: "Compress video", icon: Minimize2 },
  { id: "merge-video", label: "Merge videos", icon: Merge },
  { id: "split-video", label: "Split video", icon: SplitSquareVertical },
  { id: "volume-normalize", label: "Volume normalize", icon: Volume2 },
  { id: "add-captions", label: "Add captions", icon: Type },
  { id: "quick-fix", label: "Quick fix", icon: Wand2 },
  { id: "format-convert", label: "Format convert", icon: Video },
] as const;

export function XToolsPage() {
  const [selectedId, setSelectedId] = useState<string>(TOOLS[0].id);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="shrink-0 border-b border-border bg-background/40">
        <div className="py-5 px-6 md:px-8">
          <h1 className="text-xl font-bold text-foreground tracking-tight">X Tools</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Tools and utilities for your workflow.
          </p>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <aside className="w-48 shrink-0 flex flex-col border-r border-border/80 bg-card/90">
          <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-1.5 space-y-0.5">
            {TOOLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs font-medium transition-all rounded-md border-l-2 -ml-px pl-2.5",
                  selectedId === id
                    ? "bg-primary/10 text-primary border-l-primary"
                    : "border-l-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon size={15} className="shrink-0 opacity-80" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-h-0 overflow-auto p-6 md:p-8">
          <div className="rounded-xl border border-border/70 bg-card/60 shadow-sm p-6 md:p-8 text-center text-muted-foreground">
            {TOOLS.find((t) => t.id === selectedId) ? (
              <>
                <p className="text-sm font-medium text-foreground capitalize">
                  {TOOLS.find((t) => t.id === selectedId)?.label}
                </p>
                <p className="text-xs mt-1">Content for this tool will go here.</p>
              </>
            ) : (
              <p className="text-sm">Select a tool from the sidebar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
