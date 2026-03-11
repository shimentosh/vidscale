import { Play, Eye, Trash2, Monitor, Clock, HardDrive, Calendar, CheckSquare, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkflowOutput } from "@/lib/workflowOutputs";
import { outputIcon, openOutput, formatSize, formatDuration, formatDate } from "./utils";
import { statusConfig } from "./constants";

type OutputViewListRowProps = {
  out: WorkflowOutput;
  selectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onViewScriptVoice: (out: WorkflowOutput) => void;
  onDelete: () => void;
};

export function OutputViewListRow({ out, selectMode, isSelected, onToggleSelect, onViewScriptVoice, onDelete }: OutputViewListRowProps) {
  const Icon = outputIcon(out.type);
  const hasPreview = (out.script && out.script.trim().length > 0) || !!out.voiceOverUrl;
  const status = out.status ?? "done";
  const config = statusConfig[status] ?? statusConfig.done;
  const StatusIcon = config.icon;
  const isProcessingRow = status === "processing";
  const isFailed = status === "failed";
  const isGenerating = status === "processing" || status === "queue";

  return (
    <div className={cn("flex flex-col", isGenerating && "border-b border-border/50")}>
      <div
        role={selectMode ? "button" : undefined}
        tabIndex={selectMode ? 0 : undefined}
        onClick={selectMode ? onToggleSelect : undefined}
        onKeyDown={selectMode ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleSelect(); } } : undefined}
        className={cn("relative flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors", selectMode && "cursor-pointer", selectMode && isSelected && "bg-primary/10")}
      >
      {isProcessingRow && <div className="absolute inset-0 pointer-events-none bg-amber-500/10 dark:bg-amber-500/15" aria-hidden />}
      {isFailed && <div className="absolute inset-0 pointer-events-none bg-destructive/10 dark:bg-destructive/15" aria-hidden />}
      {selectMode && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSelect(); }} className="p-0.5 rounded text-muted-foreground hover:text-foreground shrink-0" aria-label={isSelected ? "Deselect" : "Select"}>
          {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
        </button>
      )}
      <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
        <Icon size={24} className="text-muted-foreground/60" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{out.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0 min-w-0">
          {out.aspectRatio && (<span className="inline-flex items-center gap-1"><Monitor size={10} className="shrink-0 opacity-70" />{out.aspectRatio}</span>)}
          {out.durationSeconds != null && (<span className="inline-flex items-center gap-1 tabular-nums"><Clock size={10} className="shrink-0 opacity-70" />{formatDuration(out.durationSeconds)}</span>)}
          {out.sizeBytes != null && (<span className="inline-flex items-center gap-1"><HardDrive size={10} className="shrink-0 opacity-70" />{formatSize(out.sizeBytes)}</span>)}
          <span className="inline-flex items-center gap-1 text-muted-foreground/90"><Calendar size={10} className="shrink-0 opacity-70" />{formatDate(out.createdAt)}</span>
        </p>
      </div>
      <div className={cn("flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium shrink-0", config.className, config.animate && (status === "queue" ? "animate-queue-pulse" : "animate-status-pulse"))}>
        <StatusIcon size={12} className={status === "processing" ? "animate-spin" : ""} />
        <span>{config.label}</span>
      </div>
      <div className="relative flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); openOutput(out); }}><Play size={14} /></Button>
        {hasPreview && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); onViewScriptVoice(out); }} title="Preview script & voice over"><Eye size={14} /></Button>
        )}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Delete"><Trash2 size={14} /></Button>
      </div>
      </div>
      {isGenerating && (
        <div className="px-4 pb-2 pt-0 flex items-center gap-2 shrink-0" aria-label="Processing">
          <Loader2 size={10} className="shrink-0 text-amber-600 dark:text-amber-400 animate-spin" aria-hidden />
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Processing</span>
          <div className="h-1 flex-1 min-w-[60px] max-w-[120px] rounded-full bg-muted/60 overflow-hidden" role="progressbar" aria-valuetext="In progress">
            <div className="h-full w-[70%] rounded-full bg-amber-500/80 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
