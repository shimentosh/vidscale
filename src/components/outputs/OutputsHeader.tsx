import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { getOutputStats } from "@/lib/workflowOutputs";
import type { WorkflowOutputGroup } from "@/lib/workflowOutputs";

type OutputsHeaderProps = {
  groups: WorkflowOutputGroup[];
};

export function OutputsHeader({ groups }: OutputsHeaderProps) {
  const stats = getOutputStats(groups);

  return (
    <header className="shrink-0 flex items-center justify-between py-5 px-8 border-b border-border bg-background/40">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Outputs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Workflow results grouped by run. Open or download any output.
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-foreground rounded-lg bg-amber-500/10 dark:bg-amber-500/20 px-2.5 py-1.5 border border-amber-500/20">
          <Loader2 size={16} className="text-amber-500 shrink-0 animate-spin" aria-hidden />
          <span className="tabular-nums text-sm font-semibold leading-none">{stats.inProgress}</span>
          <span className="text-xs font-medium text-muted-foreground">Processing</span>
        </span>
        <span className="flex items-center gap-1.5 text-foreground">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" aria-hidden />
          <span className="tabular-nums text-sm font-semibold leading-none">{stats.successfulRuns}</span>
          <span className="text-xs font-medium text-muted-foreground">Done</span>
        </span>
        <span className="flex items-center gap-1.5 text-foreground">
          <XCircle size={16} className="text-destructive shrink-0" aria-hidden />
          <span className="tabular-nums text-sm font-semibold leading-none">{stats.failedRuns}</span>
          <span className="text-xs font-medium text-muted-foreground">Failed</span>
        </span>
      </div>
    </header>
  );
}
