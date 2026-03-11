import { FileVideo, ImageIcon, Music, FileIcon, Play, FileText, Mic, Eye, Trash2, Monitor, Clock, HardDrive, Calendar, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkflowOutput } from "@/lib/workflowOutputs";
import { outputIcon, openOutput, formatSize, formatDuration, formatDate } from "./utils";
import { statusConfig } from "./constants";

type OutputViewCardProps = {
  out: WorkflowOutput;
  singleItem: boolean;
  onViewScriptVoice: (out: WorkflowOutput) => void;
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
};

export function OutputViewCard({ out, singleItem, onViewScriptVoice, selectMode, isSelected, onToggleSelect, onDelete }: OutputViewCardProps) {
  const Icon = outputIcon(out.type);
  const hasScript = out.script && out.script.trim().length > 0;
  const hasVoiceOver = !!out.voiceOverUrl;
  const hasPreview = hasScript || hasVoiceOver;
  const status = out.status ?? "done";
  const config = statusConfig[status] ?? statusConfig.done;
  const StatusIcon = config.icon;
  const isProcessing = status === "processing";
  const isFailed = status === "failed";
  const isGenerating = status === "processing" || status === "queue";

  const handleCardClick = () => {
    if (selectMode && onToggleSelect) onToggleSelect();
  };

  return (
    <div
      role={selectMode ? "button" : undefined}
      tabIndex={selectMode ? 0 : undefined}
      onClick={selectMode ? handleCardClick : undefined}
      onKeyDown={selectMode ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(); } } : undefined}
      className={cn(
        "group relative rounded-lg border border-border bg-card overflow-hidden flex flex-col",
        singleItem ? "w-full" : "",
        selectMode && "cursor-pointer",
        selectMode && isSelected && "ring-2 ring-primary shadow-lg"
      )}
    >
      {isProcessing && (
        <div className="absolute inset-0 rounded-lg pointer-events-none bg-amber-500/10 dark:bg-amber-500/15 animate-status-pulse" aria-hidden />
      )}
      {isFailed && (
        <div className="absolute inset-0 rounded-lg pointer-events-none bg-destructive/10 dark:bg-destructive/15" aria-hidden />
      )}
      <div className={cn("flex items-center justify-center bg-muted/30 shrink-0 relative", singleItem ? "aspect-video" : "aspect-video min-h-[120px]")}>
        <Icon size={singleItem ? 48 : 32} className="text-muted-foreground/60" />
        <div className={cn("absolute top-2 left-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", config.className, config.animate && (status === "queue" ? "animate-queue-pulse" : "animate-status-pulse"))}>
          <StatusIcon size={12} className={status === "processing" ? "animate-spin shrink-0" : "shrink-0"} />
          <span>{config.label}</span>
        </div>
        {onDelete && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive group-hover:bg-destructive/10 group-hover:text-destructive transition-colors" aria-label="Delete">
            <Trash2 size={14} />
          </button>
        )}
        {hasPreview && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-1">
            {hasScript && <FileText size={12} className="text-white" title="Script" />}
            {hasVoiceOver && <Mic size={12} className="text-white" title="Voice over" />}
          </div>
        )}
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <p className="text-sm font-medium text-foreground truncate min-w-0">{out.name}</p>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); openOutput(out); }}><Play size={14} /></Button>
          {hasPreview && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onViewScriptVoice(out); }} title="Preview script & voice over"><Eye size={14} /></Button>
          )}
        </div>
      </div>
      <div className="relative px-3 pb-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground shrink-0">
        <div className="flex flex-wrap gap-x-2 gap-y-0 items-center min-w-0">
          {selectMode && (
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }} className="flex items-center justify-center w-7 h-7 rounded-lg border border-border bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0" aria-label={isSelected ? "Deselect" : "Select"}>
              {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
            </button>
          )}
          {out.aspectRatio && (<span className="flex items-center gap-1 tabular-nums"><Monitor size={10} className="shrink-0 opacity-70" />{out.aspectRatio}</span>)}
          {out.durationSeconds != null && (<span className="flex items-center gap-1 tabular-nums"><Clock size={10} className="shrink-0 opacity-70" />{formatDuration(out.durationSeconds)}</span>)}
          {out.sizeBytes != null && (<span className="flex items-center gap-1"><HardDrive size={10} className="shrink-0 opacity-70" />{formatSize(out.sizeBytes)}</span>)}
        </div>
        <span className="flex items-center gap-1 shrink-0"><Calendar size={10} className="shrink-0 opacity-70" />{formatDate(out.createdAt)}</span>
      </div>
      {isProcessing && (
        <div className="px-3 pb-3 pt-1 shrink-0 border-t border-border/40 mt-0.5" aria-label="Processing">
          <div className="h-1 w-full rounded-full bg-muted/50 dark:bg-white/10 overflow-hidden" role="progressbar" aria-valuetext="In progress">
            <div className="h-full rounded-full bg-amber-500/90 dark:bg-amber-400/80 transition-all duration-300 animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
