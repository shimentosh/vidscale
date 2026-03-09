interface StepPanelProps {
  step: number;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function StepPanel({ step, title, description, children }: StepPanelProps) {
  return (
    <div className="py-10 px-8 max-w-3xl">
      <div className="mb-8">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step {step}
        </span>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mt-1">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {children ?? (
        <div className="rounded-lg border border-border bg-card/50 p-8 text-center text-muted-foreground/70 text-sm">
          Content for this step will go here.
        </div>
      )}
    </div>
  );
}
