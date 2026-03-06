import { useState } from "react";
import { Link } from "react-router-dom";
import { StepPanel } from "./StepPanel";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AVAILABLE_FOLDERS } from "./constants";

export function BrandingPage() {
  const [ctaMergeEnabled, setCtaMergeEnabled] = useState(false);
  const [ctaMergeFolderNames, setCtaMergeFolderNames] = useState<string[]>([]);

  const toggleCtaFolder = (folderName: string) => {
    setCtaMergeFolderNames((prev) =>
      prev.includes(folderName) ? prev.filter((f) => f !== folderName) : [...prev, folderName]
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <StepPanel
        step={9}
        title="Branding"
        description="Add branding or a watermark to your video."
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-[#131922]/50 p-6">
            <div className="rounded px-2 py-1.5 bg-background/30">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-foreground truncate" title="Ensures CTA clips appear near the end.">
                  Call To Action Merge
                </span>
                <Switch
                  checked={ctaMergeEnabled}
                  onCheckedChange={setCtaMergeEnabled}
                  aria-label="Toggle Call To Action Merge"
                  className="shrink-0 scale-75 origin-right"
                />
              </div>
              {ctaMergeEnabled && (
                <div className="mt-2 pt-2 border-t border-border/60">
                  <p className="text-[10px] text-muted-foreground mb-1.5">CTA folders</p>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_FOLDERS.map((folderName) => (
                      <label
                        key={folderName}
                        className={cn(
                          "flex items-center gap-1 rounded px-1.5 py-1 cursor-pointer text-[11px]",
                          ctaMergeFolderNames.includes(folderName) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={ctaMergeFolderNames.includes(folderName)}
                          onChange={() => toggleCtaFolder(folderName)}
                          className="h-3 w-3 rounded border-input text-primary"
                        />
                        {folderName}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </StepPanel>
      <div className="shrink-0 p-8 pt-4 border-t border-border/80">
        <Button size="lg" className="w-full h-12 font-semibold uppercase tracking-wider text-sm" asChild>
          <Link to="/">Done</Link>
        </Button>
      </div>
    </div>
  );
}
