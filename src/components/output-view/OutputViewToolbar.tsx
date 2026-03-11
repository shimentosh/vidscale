import { CheckCircle2, ListOrdered, XCircle, CheckSquare, Square, Trash2, XSquare, LayoutGrid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "done" | "processing" | "queue" | "failed";

type OutputViewToolbarProps = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  selectMode: boolean;
  selectedCount: number;
  onSelectModeToggle: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
};

export function OutputViewToolbar({
  statusFilter,
  onStatusFilterChange,
  selectMode,
  selectedCount,
  onSelectModeToggle,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  viewMode,
  onViewModeChange,
}: OutputViewToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">Status</span>
        <div className="flex rounded-full p-0.5 bg-muted/40 border border-border/40">
          <button type="button" onClick={() => onStatusFilterChange("all")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} aria-label="All statuses">All</button>
          <button type="button" onClick={() => onStatusFilterChange("done")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", statusFilter === "done" ? "bg-background text-foreground shadow-sm" : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300")} aria-label="Done only"><CheckCircle2 size={12} />Done</button>
          <button type="button" onClick={() => onStatusFilterChange("processing")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", statusFilter === "processing" ? "bg-background text-foreground shadow-sm" : "text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300")} aria-label="Processing only"><Loader2 size={12} className={statusFilter === "processing" ? "animate-spin" : ""} />Processing</button>
          <button type="button" onClick={() => onStatusFilterChange("queue")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", statusFilter === "queue" ? "bg-background text-foreground shadow-sm" : "text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300")} aria-label="In queue only"><ListOrdered size={12} />In queue</button>
          <button type="button" onClick={() => onStatusFilterChange("failed")} className={cn("px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1", statusFilter === "failed" ? "bg-background text-foreground shadow-sm" : "text-destructive hover:text-destructive/90")} aria-label="Failed only"><XCircle size={12} />Failed</button>
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
      </div>
    </div>
  );
}
