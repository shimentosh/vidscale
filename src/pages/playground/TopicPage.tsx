import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronUp, Upload, X, Loader2, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const topicLines = (text: string) =>
  text
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

export function TopicPage() {
  const [topics, setTopics] = useState("");
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState(10);
  const [showAiEngine, setShowAiEngine] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "import" | "generate"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topicsRef = useRef<HTMLTextAreaElement>(null);

  const topicCount = topicLines(topics).length;
  const hasTopics = topicCount > 0;

  // Close AI panel on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAiEngine(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clear feedback after delay
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleImportTxt = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? "";
      const lines = topicLines(text);
      if (lines.length > 0) {
        const appended = topics ? `${topics}\n${lines.join("\n")}` : lines.join("\n");
        setTopics(appended);
        setFeedback({ type: "import", text: `Imported ${lines.length} topic${lines.length === 1 ? "" : "s"} from ${file.name}` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleGenerateTopics = async () => {
    setIsGenerating(true);
    setFeedback(null);
    // Simulate API delay; replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    const placeholder = Array.from({ length: count }, (_, i) =>
      niche ? `Generated topic ${i + 1} for: ${niche}` : `Generated topic ${i + 1}`
    ).join("\n");
    setTopics((prev) => (prev ? `${prev}\n${placeholder}` : placeholder));
    setIsGenerating(false);
    setFeedback({ type: "generate", text: `Added ${count} topics to your list` });
    topicsRef.current?.focus({ preventScroll: true });
  };

  const handleClearTopics = () => {
    setTopics("");
    setFeedback(null);
  };

  const topicList = topics.split("\n");
  const updateTopicAt = (index: number, value: string) => {
    const next = [...topicList];
    next[index] = value;
    setTopics(next.join("\n"));
  };
  const removeTopicAt = (index: number) => {
    const next = topicList.filter((_, i) => i !== index);
    setTopics(next.join("\n"));
  };
  const addTopicRow = () => {
    setTopics(topics.trimEnd() ? `${topics}\n` : topics + "\n");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header (same structure as Script Writing: step label, headline, description) */}
      <div className="shrink-0 flex items-center justify-between py-5 px-8 border-b border-border bg-background/40">
        <div className="max-w-5xl">
          <span className="text-xs font-medium text-muted-foreground">Step 1 · Topic</span>
          <h1 className="text-xl font-bold text-foreground tracking-tight mt-1">Add your topics</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter or import topics, or use AI to generate headlines. Edit in the preview sidebar, then continue to script writing.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={showAiEngine ? "default" : "outline"}
            size="sm"
            className="gap-2 uppercase text-xs font-semibold tracking-wider"
            onClick={() => setShowAiEngine((v) => !v)}
            aria-expanded={showAiEngine}
            aria-controls="ai-topic-engine"
          >
            <Sparkles size={16} />
            AI Generate
            <ChevronUp size={14} className={cn("opacity-70 transition-transform", showAiEngine && "rotate-180")} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 uppercase text-xs font-semibold tracking-wider"
            onClick={handleImportTxt}
          >
            <Upload size={16} />
            Import .TXT
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Inline feedback */}
      {feedback && (
        <div
          className={cn(
            "shrink-0 mx-8 mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200",
            feedback.type === "import"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#c4b5fd]"
          )}
          role="status"
        >
          <Check size={18} className="shrink-0" />
          {feedback.text}
        </div>
      )}

      {/* Main content + Right sidebar (preview) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Center: scrollable grid (Topics Engine + optional AI) */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div
            className={cn(
              "grid gap-6 p-8 min-h-full transition-[grid-template-columns] duration-300 ease-out",
              showAiEngine ? "grid-cols-1 lg:grid-cols-[1fr_360px]" : "grid-cols-1"
            )}
          >
          <div className={cn("min-h-0 min-w-0")}>
            <div className="flex flex-col min-h-0 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-black/10 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Topics Engine
                </h2>
                <div className="flex items-center gap-2">
                  {hasTopics && (
                    <>
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        {topicCount} topic{topicCount === 1 ? "" : "s"}
                      </span>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
                        onClick={handleClearTopics}
                      >
                        Clear all
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <textarea
                ref={topicsRef}
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Enter multiple topics (one per line)...&#10;e.g. History of Space Travel&#10;The Future of AI&#10;Quantum Computing Explained"
                className={cn(
                  "flex-1 min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-sm shadow-xs resize-none transition-colors",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50",
                  "dark:bg-input/30"
                )}
                rows={12}
                aria-label="Topics list, one per line"
              />
              {!hasTopics && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Enter one topic per line, import a .txt file, or use <strong className="text-foreground/80">AI Generate</strong> to create topics.
                </p>
              )}
            </div>
          </div>

          {/* AI Topic Engine (when open) */}
          {showAiEngine && (
            <div
              id="ai-topic-engine"
              className="flex flex-col min-h-0 rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-right-4 duration-300 lg:max-w-[360px]"
              role="region"
              aria-label="AI Topic Engine"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  AI Topic Engine
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => setShowAiEngine(false)}
                  aria-label="Close AI Topic Engine"
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="niche" className="text-foreground text-sm">
                    Describe your niche...
                  </Label>
                  <Input
                    id="niche"
                    placeholder="e.g. Finance for Gen Z"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="bg-background/50"
                    disabled={isGenerating}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-foreground text-sm">Count</Label>
                    <span className="text-sm font-medium text-foreground tabular-nums">{count}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={500}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer disabled:opacity-50"
                    disabled={isGenerating}
                    aria-valuemin={1}
                    aria-valuemax={500}
                    aria-valuenow={count}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>500</span>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateTopics}
                  size="lg"
                  disabled={isGenerating}
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold uppercase tracking-wider text-sm gap-2 disabled:opacity-80"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate {count} Topics
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Right: Headline preview — editable list (same function/design as former Review & Edit Topics) */}
        <aside className="w-[320px] min-w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-card overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <FileText size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Headline preview
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
            {topicList.length === 0 || (topicList.length === 1 && !topicList[0].trim()) ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-2">
                Topics will appear here as you add or generate them. Edit headlines below or add more.
              </p>
            ) : (
              <ul className="space-y-3">
                {topicList.map((line, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 group animate-in fade-in slide-in-from-bottom-1 duration-150"
                  >
                    <span
                      className={cn(
                        "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                        "bg-[#1e3a5f] text-[#93c5fd] border border-[#2563eb]/30"
                      )}
                    >
                      {index + 1}
                    </span>
                    <Input
                      value={line}
                      onChange={(e) => updateTopicAt(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className="flex-1 min-w-0 bg-card border-border text-sm"
                      aria-label={`Topic ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 size-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTopicAt(index)}
                      aria-label={`Remove topic ${index + 1}`}
                    >
                      <X size={18} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-3 border-dashed text-muted-foreground hover:text-foreground text-xs"
              onClick={addTopicRow}
            >
              + Add topic
            </Button>
            {topicCount > 0 && (
              <p className="text-[11px] text-muted-foreground mt-3 pt-3 border-t border-border/60">
                {topicCount} topic{topicCount === 1 ? "" : "s"} · continue to script writing when ready
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom bar: item count + continue (same style as other steps) */}
      <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-card">
        <span className="text-[11px] text-muted-foreground">
          {topicCount} item{topicCount === 1 ? "" : "s"}
        </span>
        <Button
          asChild
          size="sm"
          variant="default"
          className="h-7 text-xs shrink-0"
        >
          <Link
            to="/playground/script-writing"
            state={{ topics: topicLines(topics) }}
            onClick={(e) => !hasTopics && e.preventDefault()}
          >
            Continue to Script Writing
          </Link>
        </Button>
      </div>
    </div>
  );
}
