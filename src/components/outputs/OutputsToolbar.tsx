import { Link } from "react-router-dom";
import { LayoutGrid, List, CheckSquare, Trash2, GitBranch, FileVideo, ImageIcon, XSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OutputTypeFilter = "all" | "video" | "image";

type OutputsToolbarProps = {
  viewMode: "gallery" | "list";
  onViewModeChange: (mode: "gallery" | "list") => void;
  typeFilter: OutputTypeFilter;
  onTypeFilterChange: (filter: OutputTypeFilter) => void;
  selectMode: boolean;
  onSelectModeToggle: () => void;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselect: () => void;
  onBulkDelete: () => void;
};

export function OutputsToolbar({
  viewMode,
  onViewModeChange,
  typeFilter,
  onTypeFilterChange,
  selectMode,
  onSelectModeToggle,
  selectedCount,
  onSelectAll,
  onDeselect,
  onBulkDelete,
}: OutputsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-sm font-medium text-muted-foreground">Gallery by</h2>
        <div className="flex rounded-full p-0.5 bg-muted/40 border border-border/40">
          <button
            type="button"
            onClick={() => onTypeFilterChange("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              typeFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="All types"
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange("video")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
              typeFilter === "video" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Video only"
          >
            <FileVideo size={14} />
            <span className="hidden sm:inline">Video</span>
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange("image")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
              typeFilter === "image" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Image only"
          >
            <ImageIcon size={14} />
            <span className="hidden sm:inline">Image</span>
          </button>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" asChild>
          <Link to="/workflow">
            <GitBranch size={14} />
            Workflows
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {selectMode && (
          <>
            {selectedCount === 0 ? (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" onClick={onSelectAll}>
                <CheckSquare size={14} />
                Select all
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" onClick={onDeselect}>
                <Square size={14} />
                Deselect
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 rounded-full h-8"
              onClick={onBulkDelete}
              disabled={selectedCount === 0}
            >
              <Trash2 size={14} />
              Delete ({selectedCount})
            </Button>
          </>
        )}
        <div className="flex rounded-full p-0.5 bg-muted/40 border border-border/40">
          <button
            type="button"
            onClick={onSelectModeToggle}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
              selectMode ? "bg-destructive/10 dark:bg-destructive/20 text-destructive shadow-sm" : "bg-transparent text-muted-foreground hover:text-foreground"
            )}
            aria-label={selectMode ? "Exit select mode" : "Select multiple"}
            title={selectMode ? "Exit select mode" : "Select multiple"}
          >
            {selectMode ? <XSquare size={16} /> : <CheckSquare size={16} />}
            <span className="hidden sm:inline">{selectMode ? "Exit" : "Select"}</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("gallery")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all",
              viewMode === "gallery" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} className="inline-block sm:mr-1.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-all",
              viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List size={16} className="inline-block sm:mr-1.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>
    </div>
  );
}
