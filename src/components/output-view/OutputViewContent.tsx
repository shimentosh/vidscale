import type { WorkflowOutput } from "@/lib/workflowOutputs";
import { OutputViewEmpty } from "./OutputViewEmpty";
import { OutputViewListRow } from "./OutputViewListRow";
import { OutputViewCard } from "./OutputViewCard";
import type { StatusFilter } from "./OutputViewToolbar";

type OutputViewContentProps = {
  items: WorkflowOutput[];
  statusFilter: StatusFilter;
  viewMode: "grid" | "list";
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewScriptVoice: (out: WorkflowOutput) => void;
  onDeleteItem: (id: string) => void;
};

export function OutputViewContent({
  items,
  statusFilter,
  viewMode,
  selectMode,
  selectedIds,
  onToggleSelect,
  onViewScriptVoice,
  onDeleteItem,
}: OutputViewContentProps) {
  if (items.length === 0) return <OutputViewEmpty statusFilter={statusFilter} />;

  if (viewMode === "list") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border/60">
        {items.map((out) => (
          <OutputViewListRow
            key={out.id}
            out={out}
            selectMode={selectMode}
            isSelected={selectedIds.has(out.id)}
            onToggleSelect={() => onToggleSelect(out.id)}
            onViewScriptVoice={onViewScriptVoice}
            onDelete={() => onDeleteItem(out.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((out) => (
        <OutputViewCard
          key={out.id}
          out={out}
          singleItem={false}
          onViewScriptVoice={onViewScriptVoice}
          selectMode={selectMode}
          isSelected={selectedIds.has(out.id)}
          onToggleSelect={() => onToggleSelect(out.id)}
          onDelete={() => onDeleteItem(out.id)}
        />
      ))}
    </div>
  );
}
