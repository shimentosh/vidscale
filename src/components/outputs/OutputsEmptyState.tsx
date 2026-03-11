import { Link } from "react-router-dom";
import { FolderOutput, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OutputsEmptyState() {
  return (
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
  );
}
