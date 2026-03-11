import {
  FileVideo,
  ImageIcon,
  FileIcon,
  Music,
  FileText,
  Mic,
  Play,
  CheckSquare,
  Square,
  Trash2,
  Monitor,
  Clock,
  HardDrive,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatSize, formatDuration, getRunStatus, getRunProgress } from "@/lib/workflowOutputs";
import type { WorkflowOutput, WorkflowRun, OutputType } from "@/lib/workflowOutputs";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function outputIcon(type: OutputType) {
  switch (type) {
    case "video":
      return FileVideo;
    case "image":
      return ImageIcon;
    case "audio":
      return Music;
    default:
      return FileIcon;
  }
}

/** Primary type for the run: video if any video, else image if any image, else first item or file */
function runOutputType(run: WorkflowRun): OutputType {
  const types = run.items.map((i) => i.type);
  if (types.some((t) => t === "video")) return "video";
  if (types.some((t) => t === "image")) return "image";
  if (types.some((t) => t === "audio")) return "audio";
  return run.items[0]?.type ?? "file";
}

const viewButtonClass =
  "h-7 xl:h-8 text-[11px] xl:text-xs gap-1 xl:gap-1.5 shrink-0 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-[#1e3f20] dark:text-[#7cfe00] dark:hover:bg-[#2a5c2d] dark:hover:text-[#9aff33] transition-colors [&_svg]:size-3 xl:[&_svg]:size-3.5";

export type OutputRunCardProps = {
  workflowName: string;
  run: WorkflowRun;
  onView: () => void;
  onOpenItem: (out: WorkflowOutput) => void;
  onDelete?: () => void;
  viewMode: "gallery" | "list";
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
};

export function OutputRunCard({
  workflowName,
  run,
  onView,
  onOpenItem,
  onDelete,
  viewMode,
  selectMode,
  isSelected,
  onToggleSelect,
}: OutputRunCardProps) {
  const handleCardClick = () => {
    if (selectMode && onToggleSelect) onToggleSelect();
    else onView();
  };
  const RunTypeIcon = outputIcon(runOutputType(run));
  const runStatus = getRunStatus(run);
  const isProcessing = runStatus === "processing";
  const RunStatusIcon =
    runStatus === "failed"
      ? XCircle
      : runStatus === "processing"
        ? Loader2
        : CheckCircle2;
  const runStatusIconClass =
    runStatus === "failed"
      ? "text-destructive shrink-0"
      : runStatus === "processing"
        ? "text-amber-500 shrink-0 animate-spin"
        : "text-emerald-500 shrink-0";
  const runStatusLabel = runStatus === "failed" ? "Failed" : runStatus === "processing" ? "Processing" : "Done";
  const isFailed = runStatus === "failed";
  const runProgress = getRunProgress(run);
  const processingCount = runProgress.total - runProgress.done;
  const processingPct = runProgress.total ? Math.round((processingCount / runProgress.total) * 100) : 0;

  const processingBar = isProcessing && (
    <div className="relative px-4 pb-2.5 pt-0 shrink-0 border-t border-border/50" aria-label="Processing">
      <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 mb-1">
        <Loader2 size={10} className="shrink-0 animate-spin" aria-hidden />
        <span className="font-medium tabular-nums">{processingCount}/{runProgress.total} | Processing ({processingPct}%)</span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden" role="progressbar" aria-valuenow={processingCount} aria-valuemin={0} aria-valuemax={runProgress.total} aria-label={`${processingCount} of ${runProgress.total} processing (${processingPct}%)`}>
        <div className="h-full min-w-[30%] rounded-full bg-amber-500/80 animate-pulse" style={{ width: `${Math.max(30, (processingCount / runProgress.total) * 100)}%` }} />
      </div>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div
        title={runStatusLabel}
        className={cn(
          "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200",
          selectMode && isSelected
            ? "ring-2 ring-primary shadow-lg"
            : "bg-card/80 dark:bg-white/[0.06] border border-border/50 hover:shadow-md hover:border-border"
        )}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Full-box transparent tint: amber when processing (with pulse), red when failed */}
        {isProcessing && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none bg-amber-500/10 dark:bg-amber-500/15 animate-status-pulse"
            aria-hidden
          />
        )}
        {isFailed && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none bg-destructive/10 dark:bg-destructive/15"
            aria-hidden
          />
        )}
        <div className="relative px-4 py-3 border-b border-border/40 flex items-center gap-2 flex-wrap min-w-0">
          {selectMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground shrink-0"
              aria-label={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
            </button>
          )}
          <span title={runStatusLabel} className="shrink-0">
            <RunStatusIcon size={16} className={runStatusIconClass} aria-hidden />
          </span>
          <span className="text-sm font-medium text-foreground truncate">{workflowName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {run.items.length} {run.items.length === 1 ? "item" : "items"}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="ml-auto p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive group-hover:bg-destructive/20 group-hover:text-destructive transition-colors shrink-0"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <div className="relative space-y-2 py-2">
          {(run.items.length > 1 ? run.items.slice(0, 2) : run.items).map((out) => {
            const Icon = outputIcon(out.type);
            return (
              <div
                key={out.id}
                className="flex items-center gap-3 px-4 py-3 bg-muted/40 dark:bg-white/5 border border-border/40 hover:bg-muted/50 dark:hover:bg-white/10 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <div className="w-11 h-11 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-muted-foreground/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{out.name}</p>
                  {(out.script?.trim() || out.voiceOverUrl) && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground/70">
                      {out.script?.trim() && <FileText size={10} title="Script" />}
                      {out.voiceOverUrl && <Mic size={10} title="Voice over" />}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  {out.aspectRatio && (
                    <span className="flex items-center gap-1">
                      <Monitor size={12} className="shrink-0" />
                      {out.aspectRatio}
                    </span>
                  )}
                  {out.durationSeconds != null && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="shrink-0" />
                      {formatDuration(out.durationSeconds)}
                    </span>
                  )}
                  {out.sizeBytes != null && (
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} className="shrink-0" />
                      {formatSize(out.sizeBytes)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
                >
                  <Play size={14} />
                </button>
              </div>
            );
          })}
        </div>
        {processingBar}
        <div className="relative px-4 py-2.5 border-t border-border/30 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{formatDate(run.items[0]?.createdAt ?? "")}</span>
          <Button variant="ghost" size="sm" className={viewButtonClass} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
            <Play size={14} />
            {run.items.length > 1 ? `View all ${run.items.length}` : "View output"}
          </Button>
        </div>
      </div>
    );
  }

  const runDate = run.items[0]?.createdAt ?? "";
  return (
    <article
      title={runStatusLabel}
      className={cn(
        "group relative flex-1 min-h-0 min-w-0 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 cursor-pointer",
        selectMode && isSelected
          ? "ring-2 ring-primary bg-primary/5 shadow-lg"
          : "bg-card/80 dark:bg-white/[0.06] border border-border/50 hover:border-border hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Full-box transparent tint: amber when processing (with pulse), red when failed */}
      {isProcessing && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none bg-amber-500/10 dark:bg-amber-500/15 animate-status-pulse"
          aria-hidden
        />
      )}
      {isFailed && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none bg-destructive/10 dark:bg-destructive/15"
          aria-hidden
        />
      )}
      <div className="relative px-4 py-3 flex items-center justify-between flex-wrap gap-2 min-h-[52px]">
        <div className="flex items-center gap-2 min-w-0">
          {selectMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.();
              }}
              className="p-0.5 rounded-full text-muted-foreground hover:text-foreground shrink-0"
              aria-label={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
            </button>
          )}
          <span title={runStatusLabel} className="shrink-0">
            <RunStatusIcon size={16} className={runStatusIconClass} aria-hidden />
          </span>
          <span className="text-sm font-semibold text-foreground truncate">{workflowName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive group-hover:bg-destructive/10 group-hover:text-destructive transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "relative flex-1 min-h-0 min-w-0 p-4 flex gap-3 overflow-x-auto items-stretch",
          run.items.length > 1 ? "min-h-[100px]" : "min-h-0"
        )}
      >
        {(run.items.length > 1 ? run.items.slice(0, 2) : run.items).map((out) => {
          const Icon = outputIcon(out.type);
          return (
            <button
              key={out.id}
              type="button"
              className={cn(
                "flex-shrink-0 rounded-xl bg-muted/20 dark:bg-white/5 border border-border/40 flex flex-col items-center justify-center gap-2 p-4 hover:bg-muted/30 dark:hover:bg-white/10 hover:border-primary/30 transition-all text-left",
                run.items.length > 1 ? "min-w-[90px]" : "min-w-0 w-full"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
            >
              <Icon size={32} className="text-muted-foreground/70" />
              <span className="text-xs font-medium text-foreground truncate w-full text-center">
                {out.name}
              </span>
              {(out.aspectRatio || (out.type === "video" && out.durationSeconds != null) || out.sizeBytes != null) && (
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                  {out.aspectRatio && (
                    <span className="flex items-center gap-0.5">
                      <Monitor size={11} className="shrink-0" />
                      {out.aspectRatio}
                    </span>
                  )}
                  {out.type === "video" && out.durationSeconds != null && (
                    <span className="flex items-center gap-0.5">
                      <Clock size={11} className="shrink-0" />
                      {formatDuration(out.durationSeconds)}
                    </span>
                  )}
                  {out.sizeBytes != null && (
                    <span className="flex items-center gap-0.5">
                      <HardDrive size={11} className="shrink-0" />
                      {formatSize(out.sizeBytes)}
                    </span>
                  )}
                </div>
              )}
              {(out.script?.trim() || out.voiceOverUrl) && (
                <div className="flex items-center gap-1 mt-0.5 text-muted-foreground/70">
                  {out.script?.trim() && <FileText size={10} title="Script" />}
                  {out.voiceOverUrl && <Mic size={10} title="Voice over" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {processingBar}
      <div className="relative px-4 py-3 flex items-center justify-between gap-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground">{formatDate(runDate)}</span>
        <Button variant="ghost" size="sm" className={viewButtonClass} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          <Play size={14} />
          View {run.items.length > 1 ? `all ${run.items.length}` : "output"}
        </Button>
      </div>
    </article>
  );
}
