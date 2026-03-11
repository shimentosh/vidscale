import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getRunByWorkflowAndKey,
  getWorkflowOutputFolderPath,
  deleteOutputs,
  retryOutputs,
  formatSize,
  formatDuration,
  type WorkflowOutput,
} from "@/lib/workflowOutputs";
import {
  OutputViewHeader,
  OutputViewToolbar,
  OutputViewContent,
  ScriptVoiceModal,
  folderPathToFileUrl,
} from "@/components/output-view";
import type { StatusFilter } from "@/components/output-view";

export function OutputViewPage() {
  const { workflowId, runKey } = useParams<{ workflowId: string; runKey: string }>();
  const [refresh, setRefresh] = useState(0);
  const data = useMemo(
    () => (workflowId && runKey ? getRunByWorkflowAndKey(workflowId, decodeURIComponent(runKey)) : null),
    [workflowId, runKey, refresh]
  );

  if (!workflowId || !runKey) return <Navigate to="/outputs" replace />;
  if (!data) return <Navigate to="/outputs" replace />;

  const { workflowName, run } = data;
  const defaultPath = getWorkflowOutputFolderPath(workflowName);
  const [folderPath, setFolderPath] = useState(defaultPath);
  const [scriptVoiceModalOutput, setScriptVoiceModalOutput] = useState<WorkflowOutput | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return run.items;
    if (statusFilter === "done") return run.items.filter((i) => (i.status ?? "done") === "done");
    return run.items.filter((i) => i.status === statusFilter);
  }, [run.items, statusFilter]);

  useEffect(() => {
    setFolderPath(defaultPath);
  }, [defaultPath]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredItems.map((o) => o.id)));
  }, [filteredItems]);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length) deleteOutputs(ids);
    setSelectedIds(new Set());
    setSelectMode(false);
    setRefresh((r) => r + 1);
  }, [selectedIds]);

  const handleSelectModeToggle = useCallback(() => {
    setSelectMode((m) => !m);
    setSelectedIds(new Set());
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    deleteOutputs([id]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setRefresh((r) => r + 1);
  }, []);

  const failedIds = useMemo(
    () => run.items.filter((i) => i.status === "failed").map((i) => i.id),
    [run.items]
  );
  const handleRetryAllFailed = useCallback(() => {
    if (failedIds.length === 0) return;
    retryOutputs(failedIds);
    setRefresh((r) => r + 1);
  }, [failedIds]);

  const openFolder = useCallback(() => {
    const url = folderPathToFileUrl(folderPath);
    if (url) window.open(url, "_blank", "noopener");
    else navigator.clipboard.writeText(folderPath);
  }, [folderPath]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Name", "Type", "Status", "Aspect ratio", "Duration", "Size", "Created"];
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = filteredItems.map((o) => [
      o.name,
      o.type ?? "",
      o.status ?? "",
      o.aspectRatio ?? "",
      o.durationSeconds != null ? formatDuration(o.durationSeconds) : "",
      o.sizeBytes != null ? formatSize(o.sizeBytes) : "",
      o.createdAt ?? "",
    ].map(escape).join(","));
    const csv = [headers.map(escape).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `outputs-${workflowName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [filteredItems, workflowName]);

  const handlePushToStorage = useCallback(() => {
    // Placeholder: integrate with user's storage (e.g. cloud bucket, local path)
    window.alert("Push to my storage — connect your storage in settings to export outputs here.");
  }, []);

  const handlePushToUContents = useCallback(() => {
    // Placeholder: integrate with uContents
    window.alert("Push to uContents — connect uContents in settings to send outputs here.");
  }, []);

  const processingCount = run.items.filter((i) => i.status === "processing").length;
  const queueCount = run.items.filter((i) => i.status === "queue").length;
  const doneCount = run.items.filter((i) => (i.status ?? "done") === "done").length;
  const failedCount = run.items.filter((i) => i.status === "failed").length;

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <OutputViewHeader
        workflowName={workflowName}
        itemCount={run.items.length}
        createdAt={run.items[0]?.createdAt}
        processingCount={processingCount}
        queueCount={queueCount}
        doneCount={doneCount}
        failedCount={failedCount}
        folderPath={folderPath}
        onFolderPathChange={setFolderPath}
        onOpenFolder={openFolder}
      />
      <div className="flex-1 overflow-auto p-8">
        <OutputViewToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          doneCount={doneCount}
          queueCount={queueCount}
          processingCount={processingCount}
          failedCount={failedCount}
          totalCount={run.items.length}
          selectMode={selectMode}
          selectedCount={selectedIds.size}
          onSelectModeToggle={handleSelectModeToggle}
          onSelectAll={handleSelectAll}
          onDeselectAll={() => setSelectedIds(new Set())}
          onBulkDelete={handleBulkDelete}
          onRetryAllFailed={handleRetryAllFailed}
          onExportCSV={handleExportCSV}
          onPushToStorage={handlePushToStorage}
          onPushToUContents={handlePushToUContents}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <OutputViewContent
          items={filteredItems}
          statusFilter={statusFilter}
          viewMode={viewMode}
          selectMode={selectMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onViewScriptVoice={setScriptVoiceModalOutput}
          onDeleteItem={handleDeleteItem}
        />
      </div>
      {scriptVoiceModalOutput && (
        <ScriptVoiceModal output={scriptVoiceModalOutput} onClose={() => setScriptVoiceModalOutput(null)} />
      )}
    </div>
  );
}
