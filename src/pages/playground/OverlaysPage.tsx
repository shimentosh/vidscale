import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Upload, Search, X, ChevronRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type OverlaySource = "upload" | "global-library" | "my-library";
type FillMode = "single-clip" | "multiple-clips";
type MultiClipOrder = "from-start" | "from-end" | "random";

type LibraryItem = { id: string; name: string; type: "folder" | "file"; itemCount?: number };

const GLOBAL_LIBRARY_FOLDERS: LibraryItem[] = [
  { id: "gl-1", name: "Lower Thirds", type: "folder", itemCount: 8 },
  { id: "gl-2", name: "Subscribe Banners", type: "folder", itemCount: 5 },
  { id: "gl-3", name: "Logo Stingers", type: "folder", itemCount: 4 },
  { id: "gl-4", name: "Social Handles", type: "folder", itemCount: 6 },
];

const MY_LIBRARY_FOLDERS: LibraryItem[] = [
  { id: "my-1", name: "My Overlays", type: "folder", itemCount: 0 },
  { id: "my-2", name: "Brand Assets", type: "folder", itemCount: 0 },
];

export function OverlaysPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [overlaySource, setOverlaySource] = useState<OverlaySource>("global-library");
  const [fillMode, setFillMode] = useState<FillMode>("multiple-clips");
  const [librarySearch, setLibrarySearch] = useState("");
  const [uploadedItems, setUploadedItems] = useState<LibraryItem[]>([]);
  const [multiClipOrder, setMultiClipOrder] = useState<MultiClipOrder>("from-start");

  const libraryItems = useMemo(() => {
    if (overlaySource === "upload") return uploadedItems;
    if (overlaySource === "global-library") return GLOBAL_LIBRARY_FOLDERS;
    if (overlaySource === "my-library") return [...MY_LIBRARY_FOLDERS, ...uploadedItems];
    return MY_LIBRARY_FOLDERS;
  }, [overlaySource, uploadedItems]);

  const filteredLibrary = useMemo(() => {
    if (!librarySearch.trim()) return libraryItems;
    const q = librarySearch.trim().toLowerCase();
    return libraryItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [libraryItems, librarySearch]);

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setUploadedItems((prev) => [
        ...prev,
        ...Array.from(files).map((f, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: f.name,
          type: "file" as const,
          itemCount: 1,
        })),
      ]);
    }
    e.target.value = "";
  };

  const removeItem = (id: string) => {
    if (overlaySource === "upload" || overlaySource === "my-library") {
      setUploadedItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const canRemoveItem = (id: string) =>
    overlaySource === "upload" || (overlaySource === "my-library" && uploadedItems.some((u) => u.id === id));
  const itemCount = libraryItems.length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Toolbar – step title + Overlay Source tabs + search + Add files */}
      <div className="shrink-0 h-12 px-5 flex items-center gap-4 border-b border-border/80 bg-card">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Step 5</span>
          <ChevronRight size={14} className="text-muted-foreground/50" aria-hidden />
          <h1 className="text-sm font-semibold text-foreground truncate">Overlays</h1>
        </div>
        {/* Overlay Source – tabs in toolbar (Upload Overlay removed) */}
        <div className="flex rounded-t" role="tablist" aria-label="Overlay source">
          {(
            [
              { value: "global-library" as const, label: "Global Library" },
              { value: "my-library" as const, label: "My Library" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={overlaySource === value}
              onClick={() => setOverlaySource(value)}
              className={cn(
                "px-3 py-2 text-[12px] font-medium transition-colors",
                overlaySource === value
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 max-w-[200px]">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search library…"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              className="h-8 w-full min-w-0 pl-8 pr-2 text-xs bg-muted/30 rounded-lg border-0 shadow-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Search overlay library"
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload overlay files"
        />
        {overlaySource === "my-library" && (
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 text-xs px-3 shrink-0" onClick={handleUploadClick}>
            <Upload size={14} />
            Add files
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Library panel */}
        <aside className="w-[220px] min-w-[200px] shrink-0 flex flex-col border-r border-border/80 bg-card">
          <div className="shrink-0 px-3 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <FolderOpen size={14} className="text-muted-foreground shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Library</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto py-1">
            {filteredLibrary.length === 0 ? (
              <p className="text-[11px] text-muted-foreground px-3 py-4 text-center">
                {libraryItems.length === 0
                  ? overlaySource === "upload"
                    ? "Upload overlays or switch source."
                    : "No items."
                  : "No matches."}
              </p>
            ) : (
              <ul className="space-y-0.5 px-1">
                {filteredLibrary.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5 text-[13px] text-foreground hover:bg-white/5 group"
                  >
                    <span className="min-w-0 flex-1 truncate" title={item.name}>
                      {item.name}
                    </span>
                    {item.itemCount != null && (
                      <span className="w-9 shrink-0 text-right text-muted-foreground tabular-nums">({item.itemCount})</span>
                    )}
                    {canRemoveItem(item.id) && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Center: main area */}
        <main className="flex-1 min-w-0 flex flex-col items-center justify-center p-8 bg-background">
          <p className="text-[13px] text-muted-foreground text-center max-w-sm">
            Choose overlay source and fill mode in the Properties panel. Select from the library or upload your own.
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            {itemCount} item{itemCount !== 1 ? "s" : ""} in library
          </p>
        </main>

        {/* Right: Properties panel – Overlay Source + Fill Mode + more settings */}
        <aside className="w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-card overflow-hidden">
          <div className="shrink-0 px-3 py-2 border-b border-border/60 flex items-center gap-2">
            <Settings2 size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Properties</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4">
            {/* Fill Mode (Overlay Source is in the toolbar) */}
            <div>
              <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">
                Fill Mode
              </Label>
              <div className="space-y-1">
                {(
                  [
                    { value: "single-clip" as const, label: "Single Clip", hint: "One overlay for the segment" },
                    { value: "multiple-clips" as const, label: "Multiple Clips", hint: "Overlay 1 + overlay 2 + …" },
                  ] as const
                ).map(({ value, label, hint }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      fillMode === value ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="fill-mode"
                      value={value}
                      checked={fillMode === value}
                      onChange={() => setFillMode(value)}
                      className="h-3.5 w-3.5 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                    />
                    <span className="flex-1 min-w-0">{label}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{hint}</span>
                  </label>
                ))}
              </div>
              {/* From Start / From End – when Fill Mode is Multiple Clips */}
              {fillMode === "multiple-clips" && (
                <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
                  <Label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">
                    Order
                  </Label>
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      multiClipOrder === "from-start" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="multi-clip-order"
                      value="from-start"
                      checked={multiClipOrder === "from-start"}
                      onChange={() => setMultiClipOrder("from-start")}
                      className="h-3.5 w-3.5 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                    />
                    <span className="flex-1 min-w-0">From Start</span>
                    <span className="text-[10px] text-muted-foreground">First overlay first, then next</span>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      multiClipOrder === "from-end" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="multi-clip-order"
                      value="from-end"
                      checked={multiClipOrder === "from-end"}
                      onChange={() => setMultiClipOrder("from-end")}
                      className="h-3.5 w-3.5 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                    />
                    <span className="flex-1 min-w-0">From End</span>
                    <span className="text-[10px] text-muted-foreground">Last overlay first, then previous</span>
                  </label>
                  <label
                    className={cn(
                      "flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer text-[13px]",
                      multiClipOrder === "random" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="multi-clip-order"
                      value="random"
                      checked={multiClipOrder === "random"}
                      onChange={() => setMultiClipOrder("random")}
                      className="h-3.5 w-3.5 shrink-0 accent-primary border-border bg-background focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
                    />
                    <span className="flex-1 min-w-0">Random</span>
                    <span className="text-[10px] text-muted-foreground">Play overlays in random order</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom bar – same as Media Library */}
      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-card">
        <span className="text-[11px] text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <Button size="sm" className="h-7 text-xs px-4" asChild>
          <Link to="/playground/subtitle">Continue to Subtitle</Link>
        </Button>
      </div>
    </div>
  );
}
