import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getOutputsGroupedByWorkflow,
  getRunKey,
  deleteOutputs,
  type WorkflowOutput,
  type WorkflowOutputGroup,
  type WorkflowRun,
} from "@/lib/workflowOutputs";
import {
  OutputsHeader,
  OutputsToolbar,
  OutputRunCard,
  OutputsEmptyState,
} from "@/components/outputs";
import type { OutputTypeFilter } from "@/components/outputs/OutputsToolbar";
import { cn } from "@/lib/utils";
import { getRunOutputType } from "@/lib/workflowOutputs";

const PER_PAGE = 8;

function runKey(workflowId: string, run: WorkflowRun) {
  return `${workflowId}:${getRunKey(run)}`;
}

type RunEntry = { group: WorkflowOutputGroup; run: WorkflowRun };

export function OutputsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<WorkflowOutputGroup[]>(() => getOutputsGroupedByWorkflow());
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRunKeys, setSelectedRunKeys] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<OutputTypeFilter>("all");

  const allRuns = useMemo(
    () => groups.flatMap((group) => group.runs.map((run) => ({ group, run }))),
    [groups]
  );
  const filteredRuns = useMemo(
    () =>
      typeFilter === "all"
        ? allRuns
        : allRuns.filter(({ run }) => getRunOutputType(run) === typeFilter),
    [allRuns, typeFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredRuns.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRuns = useMemo(
    () => filteredRuns.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [filteredRuns, currentPage]
  );

  const refresh = useCallback(() => {
    setGroups(getOutputsGroupedByWorkflow());
    setPage(1);
  }, []);

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

  const allRunKeys = useMemo(
    () => groups.flatMap((g) => g.runs.map((r) => runKey(g.workflowId, r))),
    [groups]
  );
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

  const handleSelectModeToggle = () => {
    setSelectMode((m) => !m);
    if (selectMode) setSelectedRunKeys(new Set());
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-background">
      <OutputsHeader groups={groups} />

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-6 sm:p-8 pt-0">
          <section className="max-w-[1600px] mx-auto">
            <OutputsToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              typeFilter={typeFilter}
              onTypeFilterChange={(f) => {
                setTypeFilter(f);
                setPage(1);
              }}
              selectMode={selectMode}
              onSelectModeToggle={handleSelectModeToggle}
              selectedCount={selectedRunKeys.size}
              onSelectAll={handleSelectAll}
              onDeselect={() => setSelectedRunKeys(new Set())}
              onBulkDelete={handleBulkDelete}
            />

            {viewMode === "gallery" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 items-stretch md:[grid-template-columns:repeat(4,minmax(0,1fr))]">
                {paginatedRuns.map(({ group, run }) => {
                  const key = runKey(group.workflowId, run);
                  return (
                    <div key={key} className="flex flex-col min-h-0 min-w-0 w-full">
                      <OutputRunCard
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
                {paginatedRuns.map(({ group, run }, idx) => {
                  const key = runKey(group.workflowId, run);
                  return (
                    <OutputRunCard
                      key={key}
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

            {groups.length === 0 && <OutputsEmptyState />}

            {groups.length > 0 && filteredRuns.length > PER_PAGE && (
              <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-0.5 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={cn(
                        "min-w-[32px] h-8 px-2 rounded-full text-sm font-medium transition-colors",
                        p === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      aria-label={`Page ${p}`}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
