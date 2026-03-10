import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, FileVideo, ImageIcon, Music, FileIcon, Play, Download, FolderOpen, FileText, Mic, Eye, Copy, Check, X, LayoutGrid, List, Loader2, CheckCircle2, ListOrdered, Monitor, Clock, HardDrive, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getRunByWorkflowAndKey,
  getWorkflowOutputFolderPath,
  formatSize,
  formatDuration,
  type WorkflowOutput,
  type OutputType,
} from "@/lib/workflowOutputs";

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

function handleOpenItem(out: WorkflowOutput) {
  if (out.url) window.open(out.url, "_blank");
}

const statusConfig = {
  done: { label: "Done", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  processing: { label: "Processing", icon: Loader2, className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  queue: { label: "In queue", icon: ListOrdered, className: "bg-muted text-muted-foreground border-border" },
} as const;

function OutputCard({ out, singleItem, onViewScriptVoice }: { out: WorkflowOutput; singleItem: boolean; onViewScriptVoice: (out: WorkflowOutput) => void }) {
  const Icon = outputIcon(out.type);
  const hasScript = out.script && out.script.trim().length > 0;
  const hasVoiceOver = !!out.voiceOverUrl;
  const hasPreview = hasScript || hasVoiceOver;
  const status = out.status ?? "done";
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden flex flex-col",
        singleItem ? "w-full" : ""
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 shrink-0 relative",
          singleItem ? "aspect-video" : "aspect-video min-h-[120px]"
        )}
      >
        <Icon size={singleItem ? 48 : 32} className="text-muted-foreground/60" />
        <div className={cn("absolute top-2 left-2 flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium", config.className)}>
          <StatusIcon size={10} className={status === "processing" ? "animate-spin shrink-0" : "shrink-0"} />
          <span>{config.label}</span>
        </div>
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
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenItem(out)}>
            <Play size={14} />
          </Button>
          {hasPreview && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onViewScriptVoice(out)} title="Preview script & voice over">
              <Eye size={14} />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Download size={14} />
          </Button>
        </div>
      </div>
      <div className="px-3 pb-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground shrink-0">
        <div className="flex flex-wrap gap-x-2 gap-y-0 items-center min-w-0">
          {out.aspectRatio && (
            <span className="flex items-center gap-1 tabular-nums">
              <Monitor size={10} className="shrink-0 opacity-70" />
              {out.aspectRatio}
            </span>
          )}
          {out.durationSeconds != null && (
            <span className="flex items-center gap-1 tabular-nums">
              <Clock size={10} className="shrink-0 opacity-70" />
              {formatDuration(out.durationSeconds)}
            </span>
          )}
          {out.sizeBytes != null && (
            <span className="flex items-center gap-1">
              <HardDrive size={10} className="shrink-0 opacity-70" />
              {formatSize(out.sizeBytes)}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 shrink-0">
          <Calendar size={10} className="shrink-0 opacity-70" />
          {formatDate(out.createdAt)}
        </span>
      </div>
    </div>
  );
}

function ScriptVoiceModal({ output, onClose }: { output: WorkflowOutput; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const hasScript = output.script && output.script.trim().length > 0;
  const hasVoiceOver = !!output.voiceOverUrl;

  const copyScript = () => {
    if (!output.script) return;
    navigator.clipboard.writeText(output.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70" aria-hidden onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <p className="text-sm font-semibold text-foreground truncate pr-2">{output.name}</p>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {hasScript && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <FileText size={12} /> Script
                </span>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyScript}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-muted/20 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                {output.script}
              </p>
            </div>
          )}
          {hasVoiceOver && (
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-2">
                <Mic size={12} /> Voice over
              </span>
              <audio controls preload="metadata" className="w-full h-10 accent-primary" src={output.voiceOverUrl}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {!hasScript && !hasVoiceOver && (
            <p className="text-sm text-muted-foreground">No script or voice over for this output.</p>
          )}
        </div>
      </div>
    </>
  );
}

/** Build file:// URL for opening folder in OS; works in Electron/some environments; may be blocked in browser */
function folderPathToFileUrl(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const normalized = trimmed.replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return "file:///" + encodeURI(normalized).replace(/#/g, "%23").replace(/%5C/g, "/");
  }
  if (normalized.startsWith("/")) {
    return "file://" + encodeURI(normalized).replace(/#/g, "%23");
  }
  return "";
}

export function OutputViewPage() {
  const { workflowId, runKey } = useParams<{ workflowId: string; runKey: string }>();
  if (!workflowId || !runKey) return <Navigate to="/outputs" replace />;

  const data = getRunByWorkflowAndKey(workflowId, decodeURIComponent(runKey));
  if (!data) return <Navigate to="/outputs" replace />;

  const { workflowName, run } = data;
  const defaultPath = getWorkflowOutputFolderPath(workflowName);
  const [folderPath, setFolderPath] = useState(defaultPath);
  const [scriptVoiceModalOutput, setScriptVoiceModalOutput] = useState<WorkflowOutput | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setFolderPath(defaultPath);
  }, [defaultPath]);

  const openFolder = () => {
    const url = folderPathToFileUrl(folderPath);
    if (url) {
      window.open(url, "_blank", "noopener");
    } else {
      navigator.clipboard.writeText(folderPath);
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 px-8 border-b border-border bg-background/40">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="gap-1.5 shrink-0" asChild>
            <Link to="/outputs">
              <ArrowLeft size={16} />
              Outputs
            </Link>
          </Button>
          <div className="h-4 w-px bg-border shrink-0" />
          <h1 className="text-lg font-semibold text-foreground truncate">{workflowName}</h1>
        </div>
        <div className="flex items-center gap-4 shrink-0 flex-wrap min-w-0">
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {run.items.length}
            </span>
            <span className="text-base font-medium text-foreground">
              {run.items.length === 1 ? "output" : "outputs"}
            </span>
            {run.items[0]?.createdAt && (
              <span className="text-sm text-muted-foreground">
                · {formatDate(run.items[0].createdAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0 max-w-full sm:max-w-[300px] flex-1">
            <FolderOpen size={14} className="text-muted-foreground shrink-0" />
            <Input
              type="text"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="h-8 text-[9px] md:text-[9px] bg-muted/20 border-border flex-1 min-w-0"
              placeholder="Output folder path"
              title="Edit path then click Open folder"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs shrink-0" onClick={openFolder}>
            <FolderOpen size={14} />
            Open folder
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className="flex rounded-lg border border-border overflow-hidden bg-muted/20">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2 transition-colors text-sm font-medium",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} className="inline-block sm:mr-1.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2 transition-colors text-sm font-medium",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
              aria-label="List view"
            >
              <List size={16} className="inline-block sm:mr-1.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60">
            {run.items.map((out) => {
              const Icon = outputIcon(out.type);
              const hasPreview = (out.script && out.script.trim().length > 0) || !!out.voiceOverUrl;
              const status = out.status ?? "done";
              const config = statusConfig[status];
              const StatusIcon = config.icon;
              return (
                <div
                  key={out.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    <Icon size={24} className="text-muted-foreground/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{out.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0 min-w-0">
                      {out.aspectRatio && (
                        <span className="inline-flex items-center gap-1">
                          <Monitor size={10} className="shrink-0 opacity-70" />
                          {out.aspectRatio}
                        </span>
                      )}
                      {out.durationSeconds != null && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock size={10} className="shrink-0 opacity-70" />
                          {formatDuration(out.durationSeconds)}
                        </span>
                      )}
                      {out.sizeBytes != null && (
                        <span className="inline-flex items-center gap-1">
                          <HardDrive size={10} className="shrink-0 opacity-70" />
                          {formatSize(out.sizeBytes)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-muted-foreground/90">
                        <Calendar size={10} className="shrink-0 opacity-70" />
                        {formatDate(out.createdAt)}
                      </span>
                    </p>
                  </div>
                  <div className={cn("flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium shrink-0", config.className)}>
                    <StatusIcon size={10} className={status === "processing" ? "animate-spin" : ""} />
                    <span>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenItem(out)}>
                      <Play size={14} />
                    </Button>
                    {hasPreview && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setScriptVoiceModalOutput(out)} title="Preview script & voice over">
                        <Eye size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {run.items.map((out) => (
              <OutputCard
                key={out.id}
                out={out}
                singleItem={false}
                onViewScriptVoice={setScriptVoiceModalOutput}
              />
            ))}
          </div>
        )}
      </div>

      {scriptVoiceModalOutput && (
        <ScriptVoiceModal output={scriptVoiceModalOutput} onClose={() => setScriptVoiceModalOutput(null)} />
      )}
    </div>
  );
}

