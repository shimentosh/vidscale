import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ListOrdered, CheckSquare, Square, Trash2, XSquare, LayoutGrid, List, Loader2, RotateCcw, Download, ChevronDown, HardDrive, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "done" | "processing" | "queue" | "failed";

type OutputViewToolbarProps = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  doneCount: number;
  queueCount: number;
  processingCount: number;
  failedCount: number;
  totalCount: number;
  selectMode: boolean;
  selectedCount: number;
  onSelectModeToggle: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onRetryAllFailed?: () => void;
  onExportCSV?: () => void;
  onPushToStorage?: () => void;
  onPushToUContents?: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
};

export function OutputViewToolbar({
  statusFilter,
  onStatusFilterChange,
  doneCount,
  queueCount,
  processingCount,
  failedCount,
  totalCount,
  selectMode,
  selectedCount,
  onSelectModeToggle,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onRetryAllFailed,
  onExportCSV,
  onPushToStorage,
  onPushToUContents,
  viewMode,
  onViewModeChange,
}: OutputViewToolbarProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportOpen]);

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">Status</span>
        <div className="flex flex-wrap gap-1 rounded-full p-0.5 bg-muted/40 border border-border/40">
          <button type="button" onClick={() => onStatusFilterChange("all")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5", statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary")} aria-label="All statuses">All<span className="tabular-nums">{totalCount}</span></button>
          <button type="button" onClick={() => onStatusFilterChange("done")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5", statusFilter === "done" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary")} aria-label="Done only"><CheckCircle2 size={12} />Done<span className="tabular-nums">{doneCount}</span></button>
          <button type="button" onClick={() => onStatusFilterChange("queue")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5", statusFilter === "queue" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary")} aria-label="In queue only"><ListOrdered size={12} />Queue<span className="tabular-nums">{queueCount}</span></button>
          <button type="button" onClick={() => onStatusFilterChange("processing")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5", statusFilter === "processing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary")} aria-label="Processing only"><Loader2 size={12} className={statusFilter === "processing" ? "animate-spin" : ""} />Processing<span className="tabular-nums">{processingCount}</span></button>
          {failedCount > 0 && onRetryAllFailed && (
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("failed");
                onRetryAllFailed();
              }}
              aria-label={`Failed & Retry — ${failedCount} item${failedCount !== 1 ? "s" : ""}`}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                statusFilter === "failed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-primary"
              )}
            >
              <RotateCcw size={12} />
              Failed & Retry ({failedCount})
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {selectMode && (
          <>
            {selectedCount === 0 ? (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" onClick={onSelectAll}><CheckSquare size={14} />Select all</Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" onClick={onDeselectAll}><Square size={14} />Deselect</Button>
            )}
            <Button variant="destructive" size="sm" className="gap-1.5 rounded-full h-8" onClick={onBulkDelete} disabled={selectedCount === 0}><Trash2 size={14} />Delete ({selectedCount})</Button>
          </>
        )}
        <div className="flex rounded-full p-0.5 bg-muted/40 border border-border/40">
          <button type="button" onClick={onSelectModeToggle} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5", selectMode ? "bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground")} aria-label={selectMode ? "Exit select mode" : "Select multiple"} title={selectMode ? "Exit select mode" : "Select multiple"}>
            {selectMode ? <XSquare size={16} /> : <CheckSquare size={16} />}
            <span className="hidden sm:inline">{selectMode ? "Exit" : "Select"}</span>
          </button>
          <button type="button" onClick={() => onViewModeChange("grid")} className={cn("px-3.5 py-1.5 rounded-full text-sm font-medium transition-all", viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} aria-label="Grid view">
            <LayoutGrid size={16} className="inline-block sm:mr-1.5" /><span className="hidden sm:inline">Grid</span>
          </button>
          <button type="button" onClick={() => onViewModeChange("list")} className={cn("px-3.5 py-1.5 rounded-full text-sm font-medium transition-all", viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} aria-label="List view">
            <List size={16} className="inline-block sm:mr-1.5" /><span className="hidden sm:inline">List</span>
          </button>
        </div>
        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all h-8",
              "bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
            aria-expanded={exportOpen}
            aria-haspopup="true"
            aria-label="Export options"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={14} className={cn("transition-transform", exportOpen && "rotate-180")} />
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-20 mt-1.5 min-w-[180px] rounded-xl border border-border/60 bg-popover shadow-lg py-1">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted/60"
                onClick={() => {
                  onExportCSV?.();
                  setExportOpen(false);
                }}
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted/60"
                onClick={() => {
                  onPushToStorage?.();
                  setExportOpen(false);
                }}
              >
                <HardDrive size={14} /> Push to my storage
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-foreground hover:bg-muted/60"
                onClick={() => {
                  onPushToUContents?.();
                  setExportOpen(false);
                }}
              >
                <Cloud size={14} /> Push to uContents
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
