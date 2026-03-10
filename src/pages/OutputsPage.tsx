import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderOutput,
  FileVideo,
  ImageIcon,
  LayoutGrid,
  List,
  Download,
  Play,
  GitBranch,
  FileIcon,
  Music,
  Layers,
  FileText,
  Mic,
  CheckCircle2,
  Loader2,
  Film,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getOutputsGroupedByWorkflow,
  getRunKey,
  getOutputStats,
  getActivityCounts,
  deleteOutputs,
  formatSize,
  formatDuration,
  type WorkflowOutput,
  type WorkflowOutputGroup,
  type WorkflowRun,
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

function RunGalleryCard({
  workflowName,
  run,
  onView,
  onOpenItem,
  onDelete,
  viewMode,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  workflowName: string;
  run: WorkflowRun;
  onView: () => void;
  onOpenItem: (out: WorkflowOutput) => void;
  onDelete?: () => void;
  viewMode: "gallery" | "list";
  selectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const isBulk = run.items.length > 1;
  const handleCardClick = () => {
    if (selectMode && onToggleSelect) onToggleSelect();
    else onView();
  };
  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "rounded-2xl overflow-hidden cursor-pointer transition-all duration-200",
          selectMode && isSelected ? "ring-2 ring-primary bg-primary/5 shadow-lg" : "bg-card/80 dark:bg-white/[0.06] border border-border/50 hover:shadow-md hover:border-border"
        )}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(); } }}
      >
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2 flex-wrap min-w-0">
          {selectMode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground shrink-0"
              aria-label={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
            </button>
          )}
          <Layers size={16} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{workflowName}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            · {run.items.length === 1 && run.label === "Single output" ? "Single output · 1 item" : run.label}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="ml-auto p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive shrink-0"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <div className="divide-y divide-border/50">
          {(run.items.length > 1 ? run.items.slice(0, 2) : run.items).map((out) => {
            const Icon = outputIcon(out.type);
            return (
              <div
                key={out.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={(e) => { e.stopPropagation(); onOpenItem(out); }}
              >
                <div className="w-11 h-11 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-muted-foreground/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{out.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {out.aspectRatio && <>{out.aspectRatio} · </>}
                    {out.durationSeconds != null && formatDuration(out.durationSeconds) + " · "}
                    {out.sizeBytes != null && formatSize(out.sizeBytes)}
                  </p>
                  {(out.script?.trim() || out.voiceOverUrl) && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground/70">
                      {out.script?.trim() && <FileText size={10} title="Script" />}
                      {out.voiceOverUrl && <Mic size={10} title="Voice over" />}
                    </div>
                  )}
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); onOpenItem(out); }} className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
                  <Play size={14} />
                </button>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-border/30 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{formatDate(run.items[0]?.createdAt ?? "")}</span>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
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
      className={cn(
        "flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 cursor-pointer",
        selectMode && isSelected
          ? "ring-2 ring-primary bg-primary/5 shadow-lg"
          : "bg-card/80 dark:bg-white/[0.06] border border-border/50 hover:border-border hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(); } }}
    >
      <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2 min-h-[52px]">
        <div className="flex items-center gap-2 min-w-0">
          {selectMode && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(); }}
              className="p-0.5 rounded-full text-muted-foreground hover:text-foreground shrink-0"
              aria-label={isSelected ? "Deselect" : "Select"}
            >
              {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
            </button>
          )}
          <span className="text-sm font-semibold text-foreground truncate">{workflowName}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className={cn("flex-1 min-h-0 p-4 flex gap-3 overflow-x-auto items-stretch", run.items.length > 1 ? "min-h-[100px]" : "min-h-0")}>
        {(run.items.length > 1 ? run.items.slice(0, 2) : run.items).map((out) => {
          const Icon = outputIcon(out.type);
          return (
            <button
              key={out.id}
              type="button"
              className={cn("flex-shrink-0 rounded-xl bg-muted/20 dark:bg-white/5 border border-border/40 flex flex-col items-center justify-center gap-2 p-4 hover:bg-muted/30 dark:hover:bg-white/10 hover:border-primary/30 transition-all text-left", run.items.length > 1 ? "min-w-[120px]" : "min-w-[140px] w-full max-w-[200px]")}
              onClick={(e) => { e.stopPropagation(); onOpenItem(out); }}
            >
              <Icon size={32} className="text-muted-foreground/70" />
              <span className={cn("text-xs font-medium text-foreground truncate w-full", run.items.length === 1 && "text-center")}>{out.name}</span>
              {(out.aspectRatio || (out.type === "video" && out.durationSeconds != null) || out.sizeBytes != null) && (
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {[out.aspectRatio, out.type === "video" && out.durationSeconds != null && formatDuration(out.durationSeconds), out.sizeBytes != null && formatSize(out.sizeBytes)].filter(Boolean).join(" · ")}
                </span>
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
      <div className="px-4 py-3 flex items-center gap-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground">{formatDate(runDate)}</span>
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          <Play size={14} />
          View {run.items.length > 1 ? `all ${run.items.length}` : "output"}
        </Button>
      </div>
    </article>
  );
}

function runKey(workflowId: string, run: WorkflowRun) {
  return `${workflowId}:${getRunKey(run)}`;
}

export function OutputsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<WorkflowOutputGroup[]>(() => getOutputsGroupedByWorkflow());
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRunKeys, setSelectedRunKeys] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => setGroups(getOutputsGroupedByWorkflow()), []);

  const handleViewRun = (workflowId: string, run: WorkflowRun) => {
    navigate(`/outputs/view/${workflowId}/${encodeURIComponent(getRunKey(run))}`);
  };

  const handleOpenItem = (out: WorkflowOutput) => {
    if (out.url) window.open(out.url, "_blank");
  };

  const toggleSelect = (key: string) => {
    setSelectedRunKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteRun = (workflowId: string, run: WorkflowRun) => {
    const ids = run.items.map((o) => o.id);
    if (ids.length) deleteOutputs(ids);
    refresh();
  };

  const allRunKeys = groups.flatMap((g) => g.runs.map((r) => runKey(g.workflowId, r)));
  const handleSelectAll = () => {
    setSelectedRunKeys(new Set(allRunKeys));
  };

  const handleBulkDelete = () => {
    const ids: string[] = [];
    for (const key of selectedRunKeys) {
      const i = key.indexOf(":");
      const wfId = i >= 0 ? key.slice(0, i) : "";
      const runKeyPart = i >= 0 ? key.slice(i + 1) : key;
      const group = groups.find((g) => g.workflowId === wfId);
      const run = group?.runs.find((r) => getRunKey(r) === runKeyPart);
      if (run) ids.push(...run.items.map((o) => o.id));
    }
    if (ids.length) deleteOutputs(ids);
    setSelectedRunKeys(new Set());
    setSelectMode(false);
    refresh();
  };

  const stats = getOutputStats(groups);
  const activity = getActivityCounts();

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      {/* Modern header: editorial title + status pills */}
      <header className="shrink-0 py-6 px-6 sm:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Results</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Outputs</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Workflow results grouped by run. Open or download any output.
          </p>
        </div>
        <div className="shrink-0 flex items-start gap-4 flex-wrap rounded-2xl bg-muted/30 dark:bg-white/5 px-5 py-3 border border-border/40">
          <span className="flex items-baseline gap-2 text-foreground">
            <CheckCircle2 size={24} className="text-emerald-500 shrink-0 mt-1" />
            <span className="tabular-nums text-[36px] font-bold leading-none">{stats.successfulRuns}</span>
            <span className="text-sm font-medium text-muted-foreground">Done</span>
          </span>
          <span className="w-px h-10 bg-border/60 self-center" aria-hidden />
          <span className="flex items-baseline gap-2 text-foreground">
            <Loader2 size={24} className="text-amber-500 shrink-0 animate-spin mt-1" />
            <span className="tabular-nums text-[36px] font-bold leading-none">{stats.inProgress}</span>
            <span className="text-sm font-medium text-muted-foreground">Active</span>
          </span>
          <span className="w-px h-10 bg-border/60 self-center" aria-hidden />
          <span className="flex items-baseline gap-2 text-foreground">
            <Film size={24} className="text-primary shrink-0 mt-1" />
            <span className="tabular-nums text-[36px] font-bold leading-none">{activity.rendering}</span>
            <span className="text-sm font-medium text-muted-foreground">Rendering</span>
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-6 sm:p-8 pt-0">
          <section className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">Gallery by workflow</h2>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" asChild>
                  <Link to="/workflow">
                    <GitBranch size={14} />
                    Workflows
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setSelectMode((m) => !m); if (selectMode) setSelectedRunKeys(new Set()); }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    selectMode ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                  aria-label={selectMode ? "Exit select mode" : "Select multiple"}
                  title={selectMode ? "Exit select mode" : "Select multiple"}
                >
                  <CheckSquare size={18} />
                </button>
                {selectMode && (
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full h-8" onClick={handleSelectAll}>
                    <CheckSquare size={14} />
                    Select all
                  </Button>
                )}
                {selectedRunKeys.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 rounded-full h-8"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={14} />
                    Delete ({selectedRunKeys.size})
                  </Button>
                )}
                <div className="flex rounded-full p-0.5 bg-muted/40 border border-border/40">
                  <button
                    type="button"
                    onClick={() => setViewMode("gallery")}
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
                    onClick={() => setViewMode("list")}
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

            {groups.map((group) => (
              <div key={group.workflowId} className="mb-8 last:mb-0">
                {viewMode === "gallery" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
                    {group.runs.map((run, idx) => {
                      const key = runKey(group.workflowId, run);
                      const isSingle = run.items.length === 1;
                      return (
                        <div key={run.runId ?? `single-${idx}`} className={cn("flex flex-col min-h-0", isSingle ? "sm:col-span-1" : "sm:col-span-2")}>
                          <RunGalleryCard
                            workflowName={group.workflowName}
                            run={run}
                            onView={() => handleViewRun(group.workflowId, run)}
                            onOpenItem={handleOpenItem}
                            onDelete={() => handleDeleteRun(group.workflowId, run)}
                            viewMode="gallery"
                            selectMode={selectMode}
                            isSelected={selectedRunKeys.has(key)}
                            onToggleSelect={() => toggleSelect(key)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.runs.map((run, idx) => {
                      const key = runKey(group.workflowId, run);
                      return (
                        <RunGalleryCard
                          key={run.runId ?? `single-${idx}`}
                          workflowName={group.workflowName}
                          run={run}
                          onView={() => handleViewRun(group.workflowId, run)}
                          onOpenItem={handleOpenItem}
                          onDelete={() => handleDeleteRun(group.workflowId, run)}
                          viewMode="list"
                          selectMode={selectMode}
                          isSelected={selectedRunKeys.has(key)}
                          onToggleSelect={() => toggleSelect(key)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {groups.length === 0 && (
              <div className="rounded-2xl border border-border/50 bg-card/50 dark:bg-white/[0.04] p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 dark:bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <FolderOutput size={32} className="text-muted-foreground/60" />
                </div>
                <p className="text-base font-semibold text-foreground">No outputs yet</p>
                <p className="text-sm text-muted-foreground mt-1.5">Run a workflow to see results here.</p>
                <Button variant="outline" size="sm" className="mt-5 gap-1.5 rounded-full h-9" asChild>
                  <Link to="/workflow">
                    <GitBranch size={14} />
                    Go to Workflows
                  </Link>
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
