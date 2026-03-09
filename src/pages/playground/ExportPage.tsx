import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEFAULT_EXPORT_PATH = "VidScale Exports";
const STORAGE_ENABLED = "vidscale-playground-brand-kit-enabled";
const STORAGE_KIT_ID = "vidscale-playground-brand-kit-id";

type FilenameOption = "project-name" | "script-title" | "auto-number";
type FrameRate = "24" | "30" | "60";
type Resolution = "720p" | "1080p" | "4k";

function loadBrandKitStatus(): { enabled: boolean; hasKit: boolean } {
  if (typeof window === "undefined") return { enabled: false, hasKit: false };
  const enabled = localStorage.getItem(STORAGE_ENABLED) === "true";
  const kitId = localStorage.getItem(STORAGE_KIT_ID);
  return { enabled, hasKit: enabled && !!kitId };
}

export function ExportPage() {
  const [exportPath, setExportPath] = useState(DEFAULT_EXPORT_PATH);
  const [filenameOption, setFilenameOption] = useState<FilenameOption>("script-title");
  const [frameRate, setFrameRate] = useState<FrameRate>("30");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [brandKitStatus] = useState(() => loadBrandKitStatus());

  const handleBrowseFolder = async () => {
    try {
      if ("showDirectoryPicker" in window) {
        const dir = await (window as Window & { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        setExportPath(dir.name);
      }
    } catch {
      // User cancelled or API not supported
    }
  };

  const resetExportPath = () => setExportPath(DEFAULT_EXPORT_PATH);

  const statusBrand = brandKitStatus.enabled
    ? (brandKitStatus.hasKit ? "1 kit selected" : "No kit selected")
    : "Brand kit off";

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="shrink-0 h-11 px-4 flex items-center gap-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 9</span>
          <ChevronRight size={12} className="text-muted-foreground/50 shrink-0" aria-hidden />
          <h1 className="text-sm font-semibold text-foreground truncate">Export</h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-auto">
          <div className="max-w-4xl mx-auto px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-5">
              <section className="rounded-md border border-border bg-card overflow-hidden">
                <div className="shrink-0 px-3 py-2 border-b border-border flex items-center gap-2 bg-card/80">
                  <FolderOpen size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Export path</span>
                </div>
                <div className="p-3 space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block">Where to save videos</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={exportPath}
                      onChange={(e) => setExportPath(e.target.value)}
                      placeholder={DEFAULT_EXPORT_PATH}
                      className="flex-1 min-w-0 h-8 text-xs bg-background/50 border-border"
                    />
                    <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs" onClick={handleBrowseFolder}>
                      <FolderOpen size={14} />
                      Browse
                    </Button>
                  </div>
                  {exportPath !== DEFAULT_EXPORT_PATH && (
                    <button
                      type="button"
                      onClick={resetExportPath}
                      className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Reset to default
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Default: <span className="font-medium text-foreground/80">{DEFAULT_EXPORT_PATH}</span>
                  </p>
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="rounded-md border border-border bg-card overflow-hidden">
                <div className="shrink-0 px-3 py-2 border-b border-border flex items-center gap-2 bg-card/80">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filename</span>
                </div>
                <div className="p-3">
                  <div className="space-y-0.5">
                    {(
                      [
                        { value: "project-name" as const, label: "Use Project Name" },
                        { value: "script-title" as const, label: "Use Script Title", default: true },
                        { value: "auto-number" as const, label: "Auto Numbering" },
                      ] as const
                    ).map(({ value, label, default: isDefault }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                          filenameOption === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="filename"
                          value={value}
                          checked={filenameOption === value}
                          onChange={() => setFilenameOption(value)}
                          className="h-3 w-3 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                        />
                        <span className="flex-1">{label}</span>
                        {isDefault && <span className="text-[10px] text-muted-foreground">(Default)</span>}
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-border bg-card overflow-hidden">
                <div className="shrink-0 px-3 py-2 border-b border-border flex items-center gap-2 bg-card/80">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Frame rate</span>
                </div>
                <div className="p-3">
                  <div className="space-y-0.5">
                    {(
                      [
                        { value: "24" as const, label: "24 fps" },
                        { value: "30" as const, label: "30 fps", default: true },
                        { value: "60" as const, label: "60 fps" },
                      ] as const
                    ).map(({ value, label, default: isDefault }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                          frameRate === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="frame-rate"
                          value={value}
                          checked={frameRate === value}
                          onChange={() => setFrameRate(value)}
                          className="h-3 w-3 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                        />
                        <span className="flex-1">{label}</span>
                        {isDefault && <span className="text-[10px] text-muted-foreground">(Default)</span>}
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-md border border-border bg-card overflow-hidden">
                <div className="shrink-0 px-3 py-2 border-b border-border flex items-center gap-2 bg-card/80">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Resolution</span>
                </div>
                <div className="p-3">
                  <div className="space-y-0.5">
                    {(
                      [
                        { value: "1080p" as const, label: "1080p (Full HD)" },
                        { value: "720p" as const, label: "720p (HD)" },
                        { value: "4k" as const, label: "4K" },
                      ] as const
                    ).map(({ value, label }) => (
                      <label
                        key={value}
                        className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-2 cursor-pointer text-[12px] transition-colors",
                          resolution === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name="resolution"
                          value={value}
                          checked={resolution === value}
                          onChange={() => setResolution(value)}
                          className="h-3 w-3 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                        />
                        <span className="flex-1">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border bg-card">
        <span className="text-[11px] text-muted-foreground">
          {statusBrand} · {exportPath} · {resolution} · {frameRate} fps
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground" asChild>
            <Link to="/">Skip</Link>
          </Button>
          <Button size="sm" className="h-7 text-xs px-4" asChild>
            <Link to="/">Save campaign</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
