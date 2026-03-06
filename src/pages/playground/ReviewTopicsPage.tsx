import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ReviewTopicsPage() {
  const location = useLocation();
  const passedTopics = (location.state as { topics?: string[] } | null)?.topics ?? [];
  const [topics, setTopics] = useState<string[]>(passedTopics);

  if (passedTopics.length === 0) {
    return <Navigate to="/playground/topic" replace />;
  }

  const updateTopic = (index: number, value: string) => {
    setTopics((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeTopic = (index: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const addEmptyTopic = () => {
    setTopics((prev) => [...prev, ""]);
  };

  const confirmedTopics = topics.filter((t) => t.trim().length > 0);
  const hasValidTopics = confirmedTopics.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between py-6 px-8 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Step 1 — Preview
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Review & Edit Topics
          </h1>
        </div>
        <Link
          to="/playground/topic"
          className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
        >
          Back to Input
        </Link>
      </div>

      {/* Editable list */}
      <div className="flex-1 min-h-0 overflow-auto py-8 px-8">
        <div className="max-w-2xl mx-auto space-y-3">
          {topics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <span
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  "bg-[#1e3a5f] text-[#93c5fd] border border-[#2563eb]/30"
                )}
              >
                {index + 1}
              </span>
              <Input
                value={topic}
                onChange={(e) => updateTopic(index, e.target.value)}
                placeholder={`Topic ${index + 1}`}
                className="flex-1 bg-[#131922] border-border"
                aria-label={`Topic ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeTopic(index)}
                aria-label={`Remove topic ${index + 1}`}
              >
                <X size={18} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-4 border-dashed text-muted-foreground hover:text-foreground"
            onClick={addEmptyTopic}
          >
            + Add topic
          </Button>
        </div>
      </div>

      {/* Bottom: Confirm & Proceed */}
      <div className="shrink-0 p-8 pt-4 space-y-2">
        {!hasValidTopics && topics.some((t) => t.length > 0) && (
          <p className="text-center text-sm text-muted-foreground">
            Add at least one non-empty topic to continue.
          </p>
        )}
        {hasValidTopics ? (
          <Button asChild size="lg" className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
            <Link to="/playground/script-writing" state={{ topics: confirmedTopics }}>
              Confirm & Proceed to Script Writing
              <span className="text-lg">&gt;</span>
            </Link>
          </Button>
        ) : (
          <Button
            size="lg"
            variant="outline"
            disabled
            className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2 text-muted-foreground border-dashed"
          >
            Confirm & Proceed to Script Writing
            <span className="text-lg">&gt;</span>
          </Button>
        )}
      </div>
    </div>
  );
}
