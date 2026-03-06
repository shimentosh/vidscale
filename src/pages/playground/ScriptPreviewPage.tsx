import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, FileText, GripVertical, RotateCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const WORDS_PER_MINUTE = 150;

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h}h ${min}m` : `${h}h`;
}

type PreviewState = {
  scriptTitles: string[];
  scriptBodies: Record<number, string>;
  activeScriptIndex: number;
};

export function ScriptPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PreviewState | null;

  const [scriptTitles] = useState<string[]>(state?.scriptTitles ?? []);
  const [scriptBodies, setScriptBodies] = useState<Record<number, string>>(state?.scriptBodies ?? {});
  const [activeScriptIndex, setActiveScriptIndex] = useState(state?.activeScriptIndex ?? 0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");

  useEffect(() => {
    if (!state?.scriptTitles?.length) {
      navigate("/playground/script-writing", { replace: true });
    }
  }, [state, navigate]);

  const currentBody = scriptBodies[activeScriptIndex] ?? "";
  const words = wordCount(currentBody);
  const durationSec = Math.round((words / WORDS_PER_MINUTE) * 60);
  const currentTitle = scriptTitles[activeScriptIndex] ?? `Script ${activeScriptIndex + 1}`;

  const handleSaveScript = () => {
    // Placeholder: persist script (e.g. API or local storage)
  };

  if (!state?.scriptTitles?.length) {
    return null;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header: option to switch back to Script Writing step */}
      <div className="shrink-0 py-4 px-8 border-b border-border flex items-center justify-between gap-4">
        <Link
          to="/playground/script-writing"
          state={{ topics: scriptTitles, scriptBodies, activeScriptIndex }}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Switch back to Script Writing step"
        >
          <ChevronLeft size={18} />
          Back to Script Writing
        </Link>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full">
            {/* Docs-style headline */}
            <header className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {currentTitle}
                  </h1>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    Script {activeScriptIndex + 1} of {scriptTitles.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegenerateModal(true)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                  aria-label="Regenerate script with AI"
                  title="Regenerate with AI"
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </header>

            {/* Inline AI Regenerate – one line, small */}
            {showRegenerateModal && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-[#131922]/80 px-3 py-2" role="region" aria-label="Regenerate script with AI">
                <Sparkles size={16} className="text-primary shrink-0" />
                <Input
                  id="regenerate-prompt-preview"
                  value={regeneratePrompt}
                  onChange={(e) => setRegeneratePrompt(e.target.value)}
                  placeholder="Optional prompt…"
                  className="h-8 flex-1 min-w-0 border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  aria-label="Prompt for regeneration"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newBody = regeneratePrompt.trim()
                      ? `[Regenerated with prompt: "${regeneratePrompt.trim()}"]\n\nRegenerated script content would appear here. Connect to your AI API.`
                      : `[Regenerated script for "${currentTitle}"]\n\nRegenerated content would appear here. Connect to your AI API to replace this placeholder.`;
                    setScriptBodies((prev) => ({ ...prev, [activeScriptIndex]: newBody }));
                    setRegeneratePrompt("");
                    setShowRegenerateModal(false);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/15 transition-colors"
                  aria-label="Regenerate script"
                  title="Regenerate"
                >
                  <RotateCw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegenerateModal(false)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Doc body */}
            <div className="flex-1 min-h-[240px] flex flex-col rounded-lg border border-border bg-[#131922]/60 overflow-hidden">
              <textarea
                value={currentBody}
                onChange={(e) =>
                  setScriptBodies((prev) => ({ ...prev, [activeScriptIndex]: e.target.value }))
                }
                placeholder="Generated script will appear here. Edit as needed."
                className="flex-1 w-full min-h-[280px] p-6 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none border-0 leading-relaxed"
                aria-label="Edit script"
              />
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between flex-wrap gap-4 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">
                  Est. length <span className="font-medium tabular-nums text-foreground">{formatDuration(durationSec)}</span>
                </span>
                <span className="text-muted-foreground">
                  Words <span className="font-medium tabular-nums text-foreground">{words}</span>
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleSaveScript}>
                SAVE SCRIPT
              </Button>
            </footer>
          </div>

          {/* Bottom: option to switch to Script Writing or proceed to Voiceover */}
          <div className="shrink-0 p-8 pt-4 flex flex-col gap-3">
            <div className="flex items-center justify-center">
              <Link
                to="/playground/script-writing"
                state={{ topics: scriptTitles, scriptBodies, activeScriptIndex }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Switch back to Script Writing step
              </Link>
            </div>
            <Button
              asChild
              className="w-full h-12 text-base font-medium"
            >
              <Link to="/playground/voice-overs" state={{ scriptTitles, scriptBodies }}>
                CONFIRM & VOICEOVER &gt;
              </Link>
            </Button>
          </div>
        </div>

        {/* Script list sidebar */}
        <aside className="w-96 min-w-[280px] shrink-0 border-l border-border bg-[#0D1117]/50 flex flex-col">
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
            <GripVertical size={14} className="text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              SCRIPT LIST
            </span>
          </div>
          <div className="flex-1 overflow-auto py-2 px-2">
            {scriptTitles.map((title, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveScriptIndex(index)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors min-w-0",
                  activeScriptIndex === index
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
                    activeScriptIndex === index ? "bg-primary text-primary-foreground" : "bg-white/10 text-muted-foreground"
                  )}
                >
                  {index + 1}
                </span>
                <span className="truncate min-w-0">{title}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

    </div>
  );
}
