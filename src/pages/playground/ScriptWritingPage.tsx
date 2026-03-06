import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  ChevronDown,
  X,
  Loader2,
  Shuffle,
  Ghost,
  Trophy,
  Moon,
  ScrollText,
  Lightbulb,
  Laugh,
  Wrench,
  Brain,
  Megaphone,
  Search,
  ScanSearch,
  FlaskConical,
  Eye,
  Sparkles,
  RotateCw,
  DollarSign,
  Building2,
  Stethoscope,
  Telescope,
  ChevronLeft,
  FileText,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const NARRATIVE_PERSON_OPTIONS = [
  { value: "first", label: "First Person", example: "(I/we)" },
  { value: "second", label: "Second Person", example: "(you)" },
  { value: "third", label: "Third Person", example: "(he/she/they)" },
] as const;

const DEFAULT_TOPICS = ["Script 1", "Script 2", "Script 3"];

const PROMPT_NICHES: { label: string; icon: LucideIcon }[] = [
  { label: "Random AI Story", icon: Shuffle },
  { label: "Scary Stories", icon: Ghost },
  { label: "Motivational", icon: Trophy },
  { label: "Bedtime Stories", icon: Moon },
  { label: "Interesting History", icon: ScrollText },
  { label: "Fun Facts", icon: Lightbulb },
  { label: "Long Form Jokes", icon: Laugh },
  { label: "Life Pro Tips", icon: Wrench },
  { label: "Philosophy", icon: Brain },
  { label: "Product Marketing", icon: Megaphone },
  { label: "True Crime", icon: Search },
  { label: "Mystery & Thriller", icon: ScanSearch },
  { label: "Science & Tech", icon: FlaskConical },
  { label: "Conspiracy Theories", icon: Eye },
  { label: "Self Improvement", icon: Sparkles },
  { label: "Wealth & Success", icon: DollarSign },
  { label: "Urban Legends", icon: Building2 },
  { label: "Paranormal", icon: Ghost },
  { label: "Medical Mysteries", icon: Stethoscope },
  { label: "Space & Astronomy", icon: Telescope },
];

const WORDS_PER_MINUTE = 150;
const WORD_COUNT_MIN = 50;
const WORD_COUNT_MAX = 25_000;

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function estimatedMinutes(words: number) {
  return Math.max(0, Math.ceil(words / WORDS_PER_MINUTE));
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m} min ${s} sec` : `${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h} hr ${min} min` : `${h} hr`;
}

type ScriptWritingLocationState = {
  topics?: string[];
  scriptBodies?: Record<number, string>;
  activeScriptIndex?: number;
};

export function ScriptWritingPage() {
  const location = useLocation();
  const locState = location.state as ScriptWritingLocationState | null;
  const topicsFromState = locState?.topics;
  const scriptTitles = topicsFromState?.length ? topicsFromState : DEFAULT_TOPICS;

  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [showMoreNiches, setShowMoreNiches] = useState(false);
  const [customPromptOpen, setCustomPromptOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(300);
  const [narrativePerson, setNarrativePerson] = useState<"first" | "second" | "third">("third");
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeScriptIndex, setActiveScriptIndex] = useState(locState?.activeScriptIndex ?? 0);
  const [scriptBodies, setScriptBodies] = useState<Record<number, string>>(locState?.scriptBodies ?? {});
  const [scriptTitlesLocal, setScriptTitlesLocal] = useState<string[]>(
    locState?.topics?.length ? locState.topics : scriptTitles
  );
  const [showPreviewEditor, setShowPreviewEditor] = useState(
    !!(locState?.scriptBodies && Object.keys(locState.scriptBodies).length > 0)
  );
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");

  const displayedNiches = showMoreNiches ? PROMPT_NICHES : PROMPT_NICHES.slice(0, 12);

  const clampedWords = Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, targetWordCount));
  const durationEstimateSeconds = Math.round((clampedWords / WORDS_PER_MINUTE) * 60);

  useEffect(() => {
    if (!previewFor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewFor]);

  useEffect(() => {
    if (!showGenerateModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isGeneratingScript) setShowGenerateModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGenerateModal, isGeneratingScript]);

  useEffect(() => {
    if (!showRegenerateModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowRegenerateModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRegenerateModal]);

  useEffect(() => {
    if (!isGeneratingScript) return;
    setGenerationProgress(0);
    const duration = 2000;
    const step = 50;
    const steps = duration / step;
    const increment = 100 / steps;
    let count = 0;
    const timer = setInterval(() => {
      count += 1;
      setGenerationProgress((p) => Math.min(100, p + increment));
    }, step);
    const doneTimer = setTimeout(() => {
      clearInterval(timer);
      const sampleScript = `[Generated script for "${scriptTitlesLocal[activeScriptIndex] ?? `Script ${activeScriptIndex + 1}`}"]\n\nThis is a sample script generated from your topic. Replace this with real API-generated content. The narrative perspective is ${narrativePerson} person. Target length: ~${clampedWords} words (${formatDuration(durationEstimateSeconds)}).\n\nYou can edit this text and use it as reference for your video.`;
      const nextBodies = { ...scriptBodies, [activeScriptIndex]: sampleScript };
      setScriptBodies(nextBodies);
      setShowGenerateModal(false);
      setIsGeneratingScript(false);
      setGenerationProgress(0);
      setShowPreviewEditor(true);
    }, duration);
    return () => {
      clearInterval(timer);
      clearTimeout(doneTimer);
    };
  }, [isGeneratingScript]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 py-6 px-8 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Script Writing</h1>
          <p className="text-sm text-muted-foreground mt-2">Write the full script for your video.</p>
        </div>
      </div>

      {/* Back to script settings (when in preview mode) */}
      {showPreviewEditor && (
        <div className="shrink-0 px-8 py-3 border-b border-border">
          <button
            type="button"
            onClick={() => setShowPreviewEditor(false)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
            Back to script settings
          </button>
        </div>
      )}

      {!showPreviewEditor && (
        <>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 space-y-6">
            {/* Prompt / Niche selection */}
            <section>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider block mb-3">
                Select a niche for your video series
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedNiche(null);
                    setCustomPromptOpen((v) => !v);
                  }}
                  className={cn(
                    "rounded-lg border px-4 py-3 flex items-center gap-3 text-left text-sm font-medium transition-colors w-full",
                    customPromptOpen
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-[#131922] text-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <MessageSquare size={20} className="shrink-0" />
                  <span className="flex-1 min-w-0 truncate">Customise Prompt</span>
                </button>
                {displayedNiches.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setSelectedNiche(label);
                      setCustomPromptOpen(false);
                    }}
                    className={cn(
                      "rounded-lg border px-4 py-3 flex items-center gap-3 text-left text-sm font-medium transition-colors w-full",
                      selectedNiche === label
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-[#131922] text-foreground hover:border-muted-foreground/50"
                    )}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span className="flex-1 min-w-0 truncate">{label}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewFor(label);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setPreviewFor(label);
                        }
                      }}
                      className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Preview script quality"
                      aria-label="Preview script quality"
                    >
                      <Eye size={18} />
                    </span>
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-muted-foreground gap-1"
                onClick={() => setShowMoreNiches((v) => !v)}
              >
                <ChevronDown size={16} className={cn("transition-transform", showMoreNiches && "rotate-180")} />
                {showMoreNiches ? "Show less" : "Show more"}
              </Button>

            </section>

            {/* Preview modal (portal) */}
            {previewFor &&
              createPortal(
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="preview-modal-title"
                >
                  <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setPreviewFor(null)}
                    aria-hidden="true"
                  />
                  <div
                    className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-border bg-[#131922] shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-4 shrink-0 border-b border-border px-6 py-4 bg-[#0D1117]/80">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-primary/15 text-primary" aria-hidden>
                          <Eye size={22} strokeWidth={1.5} />
                        </span>
                        <div className="min-w-0">
                          <h2 id="preview-modal-title" className="text-lg font-semibold text-foreground truncate">
                            {previewFor}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Preview script quality for this option</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewFor(null)}
                        className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        aria-label="Close preview"
                      >
                        <X size={18} />
                        <span>Close</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-6 min-h-[120px]">
                      <p className="text-sm text-muted-foreground">
                        Content for this option will appear here. Generate or load a sample script to see quality.
                      </p>
                    </div>
                  </div>
                </div>,
                document.body
              )}

            {/* Custom prompt box */}
            {customPromptOpen && (
              <section className="rounded-xl border border-border bg-[#131922] p-4">
                <Label className="text-foreground text-sm block mb-2">Custom prompt</Label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Add custom instructions for script generation..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Custom prompt"
                />
              </section>
            )}

            {/* Script options – compact single card */}
            <section className="rounded-lg border border-border bg-[#131922]/80 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
                {/* Target word count – slider + range */}
                <div className="flex-1 min-w-0 space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Script length</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={WORD_COUNT_MIN}
                      max={WORD_COUNT_MAX}
                      value={Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, targetWordCount))}
                      onChange={(e) => setTargetWordCount(Number(e.target.value))}
                      className="flex-1 h-2 rounded-full appearance-none bg-input accent-primary cursor-pointer min-w-0"
                      aria-valuemin={WORD_COUNT_MIN}
                      aria-valuemax={WORD_COUNT_MAX}
                      aria-valuenow={targetWordCount}
                    />
                    <Input
                      type="number"
                      min={WORD_COUNT_MIN}
                      max={WORD_COUNT_MAX}
                      value={targetWordCount}
                      onChange={(e) => setTargetWordCount(Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, Number(e.target.value) || WORD_COUNT_MIN)))}
                      className="w-20 h-9 text-sm shrink-0 tabular-nums"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Range: {WORD_COUNT_MIN.toLocaleString()} – {WORD_COUNT_MAX.toLocaleString()} words</p>
                </div>

                {/* Total words + Est. duration – prominent display */}
                <div className="flex flex-col items-end sm:items-end justify-center gap-1 min-w-0 sm:min-w-[180px]">
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-foreground leading-tight">
                      {Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, targetWordCount)).toLocaleString()}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">words</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/80 w-full text-right">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Est. duration</p>
                    <p className="text-base font-semibold tabular-nums text-primary">
                      {formatDuration(durationEstimateSeconds)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">~{WORDS_PER_MINUTE} words/min (speech)</p>
                  </div>
                </div>
              </div>

              {/* Narrative perspective – own line */}
              <div className="border-t border-border pt-4 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Perspective</Label>
                <Select
                  value={narrativePerson}
                  onValueChange={(v) => setNarrativePerson(v as "first" | "second" | "third")}
                >
                  <SelectTrigger className="h-9 text-sm w-full max-w-xs">
                    <SelectValue placeholder="Choose perspective" />
                  </SelectTrigger>
                  <SelectContent>
                    {NARRATIVE_PERSON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} {opt.example}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* Bottom: if already generated, primary action is Return to script preview */}
      <div className="shrink-0 p-8 pt-4">
        {Object.keys(scriptBodies).length > 0 ? (
          <Button
            size="lg"
            className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2"
            onClick={() => setShowPreviewEditor(true)}
          >
            Return to script preview
            <span className="text-lg">&gt;</span>
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={isGeneratingScript}
            className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2"
            onClick={() => {
              if (isGeneratingScript) return;
              setShowGenerateModal(true);
              setIsGeneratingScript(true);
            }}
          >
            {isGeneratingScript ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating script...
              </>
            ) : (
              <>
                Generate Script
                <span className="text-lg">&gt;</span>
              </>
            )}
          </Button>
        )}
      </div>
        </>
      )}

      {/* Preview editor (same page, after generation) */}
      {showPreviewEditor && (
        <>
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col overflow-auto">
              <div className="p-8 flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full">
                {/* Docs-style headline */}
                <header className="mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        {scriptTitlesLocal[activeScriptIndex] ?? `Script ${activeScriptIndex + 1}`}
                      </h1>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                        Script {activeScriptIndex + 1} of {scriptTitlesLocal.length}
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
                      id="regenerate-prompt"
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
                          ? `[Regenerated with prompt: "${regeneratePrompt.trim()}"]\n\nThis is a sample regenerated script. Replace with real API response. Original target: ~${clampedWords} words, ${narrativePerson} person.`
                          : `[Regenerated script for "${scriptTitlesLocal[activeScriptIndex] ?? `Script ${activeScriptIndex + 1}`}"]\n\nRegenerated content would appear here. Connect to your AI API to replace this placeholder.`;
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
                    value={scriptBodies[activeScriptIndex] ?? ""}
                    onChange={(e) => setScriptBodies((prev) => ({ ...prev, [activeScriptIndex]: e.target.value }))}
                    placeholder="Generated script will appear here. Edit as needed."
                    className="flex-1 w-full min-h-[280px] p-6 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none border-0 leading-relaxed"
                    aria-label="Edit script"
                  />
                </div>
                <footer className="flex items-center justify-between flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      Est. length <span className="font-medium tabular-nums text-foreground">{formatDuration(Math.round((wordCount(scriptBodies[activeScriptIndex] ?? "") / WORDS_PER_MINUTE) * 60))}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Words <span className="font-medium tabular-nums text-foreground">{wordCount(scriptBodies[activeScriptIndex] ?? "")}</span>
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">SAVE SCRIPT</Button>
                </footer>
              </div>
              <div className="shrink-0 p-8 pt-4">
                <Button asChild size="lg" className="w-full h-12 text-base font-medium">
                  <Link to="/playground/voice-overs" state={{ scriptTitles: scriptTitlesLocal, scriptBodies }}>
                    CONFIRM & VOICEOVER &gt;
                  </Link>
                </Button>
              </div>
            </div>
            <aside className="w-96 min-w-[280px] shrink-0 border-l border-border bg-[#0D1117]/50 flex flex-col">
              <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
                <GripVertical size={14} className="text-muted-foreground" aria-hidden />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SCRIPT LIST</span>
              </div>
              <div className="flex-1 overflow-auto py-2 px-2">
                {scriptTitlesLocal.map((title, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveScriptIndex(index)}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors min-w-0",
                      activeScriptIndex === index ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
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
        </>
      )}

      {/* Generate script modal: loading only; on done this page switches to preview editor */}
      {showGenerateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Generating script"
          >
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            <div
              className="relative z-10 w-full max-w-md flex flex-col rounded-xl border border-border bg-[#131922] shadow-xl overflow-hidden p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Loader2 size={22} className="text-primary animate-spin shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Generating script 1 of {scriptTitlesLocal.length}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Converting topic to script...</p>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-input overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2 tabular-nums">{Math.round(generationProgress)}%</p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
