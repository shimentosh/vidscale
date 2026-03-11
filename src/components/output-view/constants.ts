import { CheckCircle2, X, ListOrdered, Loader2 } from "lucide-react";

export const statusConfig: Record<
  string,
  { label: string; icon: typeof CheckCircle2; className: string; animate?: boolean }
> = {
  done: { label: "Done", icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  processing: { label: "Processing", icon: Loader2, className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30", animate: true },
  queue: { label: "In queue", icon: ListOrdered, className: "bg-amber-50 dark:bg-amber-500/15 text-amber-800/90 dark:text-amber-200 border-amber-200/60 dark:border-amber-500/25", animate: true },
  failed: { label: "Failed", icon: X, className: "bg-destructive/15 text-destructive border-destructive/30" },
};
