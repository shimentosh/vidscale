import { Clock, ListOrdered, CheckCircle2, XCircle, FolderOpen, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "./utils";

type OutputViewHeaderProps = {
  workflowName: string;
  itemCount: number;
  createdAt?: string;
  processingCount: number;
  queueCount: number;
  doneCount: number;
  failedCount: number;
  folderPath: string;
  onFolderPathChange: (path: string) => void;
  onOpenFolder: () => void;
};

export function OutputViewHeader({
  workflowName,
  itemCount,
  createdAt,
  processingCount,
  queueCount,
  doneCount,
  failedCount,
  folderPath,
  onFolderPathChange,
  onOpenFolder,
}: OutputViewHeaderProps) {
  const generatingCount = processingCount + queueCount;

  return (
    <div className="shrink-0 border-b border-border bg-background/60">
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-8 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{workflowName}</h1>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          {createdAt && (
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
              <Clock size={14} className="shrink-0 opacity-70" aria-hidden />
              <span>Created {formatRelativeTime(createdAt)}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {generatingCount > 0 && (() => {
            const total = Math.max(1, itemCount);
            const pct = Math.round((generatingCount / total) * 100);
            return (
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 ml-[30px] mr-[30px]" title={`${generatingCount} of ${itemCount} processing (${pct}%)`}>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <Loader2 size={12} className="shrink-0 animate-spin" aria-hidden />
                  <span className="tabular-nums font-medium">{generatingCount}/{itemCount} | Processing ({pct}%)</span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden" role="progressbar" aria-valuenow={generatingCount} aria-valuemin={0} aria-valuemax={itemCount} aria-label={`${generatingCount} of ${itemCount} processing (${pct}%)`}>
                  <div className="h-full min-w-[30%] rounded-full bg-amber-500/80 animate-pulse" style={{ width: `${Math.max(30, (generatingCount / total) * 100)}%` }} />
                </div>
              </div>
            );
          })()}
          <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <ListOrdered size={14} className="shrink-0" />
            <span className="tabular-nums">{queueCount}</span>
            <span className="hidden sm:inline">Queue</span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="tabular-nums">{doneCount}</span>
            <span className="hidden sm:inline">Done</span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <XCircle size={14} className="text-destructive shrink-0" />
            <span className="tabular-nums">{failedCount}</span>
            <span className="hidden sm:inline">Failed</span>
          </span>
          <div className="w-px h-5 bg-border shrink-0" aria-hidden />
          <div className="flex items-center gap-1.5 min-w-0 max-w-[200px] sm:max-w-[280px]">
            <Input
              type="text"
              value={folderPath}
              onChange={(e) => onFolderPathChange(e.target.value)}
              className="h-8 text-[10px] md:text-[10px] bg-muted/20 border-border min-w-0 flex-1"
              placeholder="Output path"
              title={folderPath || "Edit path then click Open folder"}
            />
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={onOpenFolder} aria-label="Open folder">
              <FolderOpen size={14} />
              Open
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
