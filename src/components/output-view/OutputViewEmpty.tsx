import type { StatusFilter } from "./OutputViewToolbar";

type OutputViewEmptyProps = { statusFilter: StatusFilter };

function filterLabel(filter: StatusFilter): string {
  if (filter === "all") return "No outputs in this run.";
  const adjective = filter === "done" ? "completed" : filter === "processing" ? "processing" : filter === "queue" ? "queued" : "failed";
  return `No ${adjective} outputs.`;
}

export function OutputViewEmpty({ statusFilter }: OutputViewEmptyProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden py-12 text-center">
      <p className="text-sm text-muted-foreground">{filterLabel(statusFilter)}</p>
    </div>
  );
}
