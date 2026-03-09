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
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const HOOK_STYLE_OPTIONS = [
  { value: "question", label: "Question Hook" },
  { value: "shock", label: "Shock Hook" },
  { value: "curiosity", label: "Curiosity Hook" },
  { value: "story", label: "Story Hook" },
  { value: "statistic", label: "Statistic Hook" },
  { value: "bold", label: "Bold Statement Hook" },
  { value: "contrarian", label: "Contrarian Hook" },
  { value: "myth-busting", label: "Myth Busting Hook" },
  { value: "list", label: "List Hook" },
  { value: "promise", label: "Promise Hook" },
  { value: "fear", label: "Fear Hook" },
  { value: "humor", label: "Humor Hook" },
  { value: "quote", label: "Quote Hook" },
  { value: "scenario", label: "Scenario Hook" },
  { value: "secret", label: "Secret Hook" },
  { value: "controversy", label: "Controversy Hook" },
  { value: "transformation", label: "Transformation Hook" },
  { value: "direct-address", label: "Direct Address Hook" },
  { value: "mystery", label: "Mystery Hook" },
  { value: "custom", label: "Custom" },
] as const;

const HOOK_WORD_COUNT_PRESETS = [
  { value: "6-12", label: "6–12 words — Short video" },
  { value: "12-20", label: "12–20 words — Medium" },
  { value: "15-25", label: "15–25 words — Long video" },
] as const;

/** Build the script-writing prompt per user's format (niche, word count, sections, hook style). */
function buildScriptPrompt(opts: {
  niche: string;
  wordCount: number;
  hook: boolean;
  hookStyleLabel?: string;
  hookWordCountPreset?: string;
  intro: boolean;
  mainContent: boolean;
  ending: boolean;
}): string {
  const { niche, wordCount, hook, hookStyleLabel, hookWordCountPreset, intro, mainContent, ending } = opts;
  const hookLines: string[] = [];
  if (hook) {
    hookLines.push("Hook: ON");
    if (hookStyleLabel) hookLines.push(`Hook style: ${hookStyleLabel}`);
    if (hookWordCountPreset) hookLines.push(`Hook length: ${hookWordCountPreset}`);
  } else {
    hookLines.push("Hook: OFF");
  }
  const hookBlock = hookLines.join("\n") + "\n\n";
  return `Write a video script for the niche: ${niche}.
Total length: ${wordCount} words.

Generate only the sections that are enabled:

${hookBlock}Intro: ${intro ? "ON" : "OFF"}
Main Content: ${mainContent ? "ON" : "OFF"}
Ending: ${ending ? "ON" : "OFF"}

If a section is OFF, skip it completely.

Keep the script engaging, simple, and suitable for faceless AI videos.
Avoid repetition and write in a natural storytelling tone.`;
}

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

/** Parse section headers from script body (━━━ HOOK ━━━ etc.) for structure strip */
function parseScriptSections(body: string): string[] {
  const matches = body.matchAll(/━━━\s+([A-Za-z\s]+)\s+━━━/g);
  return [...matches].map((m) => m[1].trim());
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
  const [sectionHook, setSectionHook] = useState(true);
  const [sectionIntro, setSectionIntro] = useState(true);
  const [sectionMainContent, setSectionMainContent] = useState(true);
  const [sectionEnding, setSectionEnding] = useState(true);
  const [hookStyle, setHookStyle] = useState<string>(HOOK_STYLE_OPTIONS[0].value);
  const [hookStyleCustom, setHookStyleCustom] = useState("");
  const [hookWordCountPreset, setHookWordCountPreset] = useState<string>(HOOK_WORD_COUNT_PRESETS[0].value);
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
      const nicheLabel = selectedNiche ?? (customPrompt.trim() || "Your niche");
      const hookStyleLabel =
        sectionHook &&
        (hookStyle === "custom" ? hookStyleCustom.trim() : HOOK_STYLE_OPTIONS.find((o) => o.value === hookStyle)?.label);
      const hookWordCountLabel = sectionHook
        ? HOOK_WORD_COUNT_PRESETS.find((o) => o.value === hookWordCountPreset)?.label
        : undefined;
      const promptUsed = buildScriptPrompt({
        niche: nicheLabel,
        wordCount: clampedWords,
        hook: sectionHook,
        hookStyleLabel: hookStyleLabel || undefined,
        hookWordCountPreset: hookWordCountLabel,
        intro: sectionIntro,
        mainContent: sectionMainContent,
        ending: sectionEnding,
      });
      const sections: string[] = [];
      if (sectionHook) {
        sections.push(`━━━ HOOK ━━━\n\n[Write your hook here. Style: ${hookStyleLabel || "—"}, length: ${hookWordCountLabel || "—"}. Replace with AI-generated hook.]`);
      }
      if (sectionIntro) {
        sections.push(`━━━ INTRO ━━━\n\n[Write your intro here. Set up the topic and grab attention. Replace with AI-generated intro.]`);
      }
      if (sectionMainContent) {
        sections.push(`━━━ MAIN CONTENT ━━━\n\n[Write your main content here. Core message, key points, story or facts. Replace with AI-generated content.]`);
      }
      if (sectionEnding) {
        sections.push(`━━━ ENDING ━━━\n\n[Write your ending here. Call to action, summary, or closing thought. Replace with AI-generated ending.]`);
      }
      const structuredBody = sections.length > 0
        ? sections.join("\n\n\n")
        : "[No sections enabled. Enable Hook, Intro, Main content, or Ending in settings.]";
      const sampleScript = `Script: ${scriptTitlesLocal[activeScriptIndex] ?? `Script ${activeScriptIndex + 1}`}\nNiche: ${nicheLabel} · ${clampedWords} words · ${formatDuration(durationEstimateSeconds)}\n\n${structuredBody}\n\n---\nPrompt sent to AI:\n${promptUsed}`;
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

  const nicheLabel = selectedNiche ?? (customPrompt.trim() || null);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 py-5 px-8 border-b border-border bg-background/40">
        <div className="max-w-5xl">
          <span className="text-xs font-medium text-muted-foreground">Step 2 · Script Writing</span>
          <h1 className="text-xl font-bold text-foreground tracking-tight mt-1">Write your script</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose your topic, length, and structure. Then generate your script.</p>
        </div>
      </div>

      {/* Back to script settings (when in preview mode) */}
      {showPreviewEditor && (
        <div className="shrink-0 px-8 py-2.5 border-b border-border bg-background/30">
          <button
            type="button"
            onClick={() => setShowPreviewEditor(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1.5 -ml-2 hover:bg-white/5"
          >
            <ChevronLeft size={18} />
            Back to settings
          </button>
        </div>
      )}

      {!showPreviewEditor && (
        <>
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Main content – scrollable settings */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 max-w-3xl space-y-8">
            {/* 1. Prompt template */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Prompt template</h2>
                <p className="text-xs text-muted-foreground mt-0.5">What kind of content is this script for?</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      : "border-border bg-card text-foreground hover:border-muted-foreground/50 hover:bg-white/[0.02]"
                  )}
                >
                  <MessageSquare size={20} className="shrink-0" />
                  <span className="flex-1 min-w-0 truncate">Custom</span>
                </button>
                {displayedNiches.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className={cn(
                      "rounded-lg border px-4 py-3 flex items-center gap-3 text-left text-sm font-medium transition-colors w-full",
                      selectedNiche === label
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-foreground hover:border-muted-foreground/50 hover:bg-white/[0.02]"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNiche(label);
                        setCustomPromptOpen(false);
                      }}
                      className="flex-1 min-w-0 flex items-center gap-3 text-left"
                    >
                      <Icon size={20} className="shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFor(label)}
                      className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Preview"
                      aria-label="Preview"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-1 h-8"
                onClick={() => setShowMoreNiches((v) => !v)}
              >
                <ChevronDown size={14} className={cn("transition-transform", showMoreNiches && "rotate-180")} />
                {showMoreNiches ? "Show less" : "Show more topics"}
              </Button>
              {customPromptOpen && (
                <div className="rounded-lg border border-border bg-card p-4 mt-2">
                  <Label className="text-sm text-foreground block mb-2">Custom instructions</Label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Focus on beginner-friendly explanations..."
                    className="w-full min-h-[88px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Custom prompt"
                  />
                </div>
              )}
            </section>

            {/* 2. Script length */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Script length</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Total word count for the full script (~{WORDS_PER_MINUTE} words/min when spoken).</p>
              </div>
              <div className="rounded-lg border border-border bg-card/80 p-5 space-y-4">
                <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      min={WORD_COUNT_MIN}
                      max={WORD_COUNT_MAX}
                      value={targetWordCount}
                      onChange={(e) => setTargetWordCount(Math.min(WORD_COUNT_MAX, Math.max(WORD_COUNT_MIN, Number(e.target.value) || WORD_COUNT_MIN)))}
                      className="w-24 h-9 text-sm tabular-nums"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">words</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Est. duration: <span className="font-medium text-foreground">{formatDuration(durationEstimateSeconds)}</span>
                </p>
              </div>
            </section>

            {/* 3. Structure: sections + hook options */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Structure</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Include only the parts you need. Turn off any section to skip it.</p>
              </div>
              <div className="rounded-lg border border-border bg-card/80 p-5 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2.5">
                    <span className="text-sm">Hook</span>
                    <Switch checked={sectionHook} onCheckedChange={setSectionHook} aria-label="Hook" />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2.5">
                    <span className="text-sm">Intro</span>
                    <Switch checked={sectionIntro} onCheckedChange={setSectionIntro} aria-label="Intro" />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2.5">
                    <span className="text-sm">Main content</span>
                    <Switch checked={sectionMainContent} onCheckedChange={setSectionMainContent} aria-label="Main content" />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background/30 px-3 py-2.5">
                    <span className="text-sm">Ending</span>
                    <Switch checked={sectionEnding} onCheckedChange={setSectionEnding} aria-label="Ending" />
                  </div>
                </div>
                {sectionHook && (
                  <div className="pt-2 border-t border-border space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Hook style</Label>
                      <Select value={hookStyle} onValueChange={setHookStyle}>
                        <SelectTrigger className="h-9 text-sm mt-1.5 max-w-[280px]">
                          <SelectValue placeholder="Choose style" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOOK_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {hookStyle === "custom" && (
                        <Input
                          value={hookStyleCustom}
                          onChange={(e) => setHookStyleCustom(e.target.value)}
                          placeholder="Describe your hook..."
                          className="mt-2 max-w-[280px] text-sm"
                          aria-label="Custom hook style"
                        />
                      )}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Hook length</Label>
                      <Select value={hookWordCountPreset} onValueChange={setHookWordCountPreset}>
                        <SelectTrigger className="h-9 text-sm mt-1.5 max-w-[280px]">
                          <SelectValue placeholder="Length" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOOK_WORD_COUNT_PRESETS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Voice */}
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Voice</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Narrative perspective for the script.</p>
              </div>
              <Select value={narrativePerson} onValueChange={(v) => setNarrativePerson(v as "first" | "second" | "third")}>
                <SelectTrigger className="h-10 text-sm w-full max-w-[280px]">
                  <SelectValue placeholder="Perspective" />
                </SelectTrigger>
                <SelectContent>
                  {NARRATIVE_PERSON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label} {opt.example}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>
          </div>
        </div>

        {/* Right: Summary (same style as Topic headline preview sidebar) */}
        <aside className="w-[320px] min-w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-card overflow-hidden hidden lg:flex">
          <div className="shrink-0 px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <ScrollText size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Summary
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-5">
            <div className="space-y-4">
              {/* Duration big, word count small */}
              <div className="rounded-lg border border-border/60 bg-card p-4">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Est. duration when spoken</p>
                <p className="text-3xl font-bold tabular-nums text-primary leading-tight">
                  {formatDuration(durationEstimateSeconds)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Total script length</p>
                <p className="text-sm font-medium text-foreground tabular-nums">{clampedWords.toLocaleString()} words</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">for the full script (not per video)</p>
              </div>

              {/* Prompt template */}
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Prompt template</p>
                <p className="text-sm font-medium text-foreground break-words">{nicheLabel || "—"}</p>
              </div>

              {/* Sections */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Sections</p>
                <ul className="text-sm text-foreground space-y-1">
                  {[sectionHook && "Hook", sectionIntro && "Intro", sectionMainContent && "Main content", sectionEnding && "Ending"]
                    .filter((x): x is string => Boolean(x))
                    .map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                        {s}
                      </li>
                    ))}
                </ul>
                {![sectionHook, sectionIntro, sectionMainContent, sectionEnding].some(Boolean) && (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>

              {/* Hook details (only when Hook is on) */}
              {sectionHook && (
                <div className="space-y-1.5 pt-1 border-t border-border">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Hook</p>
                  <p className="text-sm text-foreground">
                    {hookStyle === "custom" ? (hookStyleCustom.trim() || "Custom") : HOOK_STYLE_OPTIONS.find((o) => o.value === hookStyle)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {HOOK_WORD_COUNT_PRESETS.find((o) => o.value === hookWordCountPreset)?.label}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-2">
              {Object.keys(scriptBodies).length > 0 ? (
                <Button
                  size="lg"
                  className="w-full h-11 font-medium"
                  onClick={() => setShowPreviewEditor(true)}
                >
                  Open script preview
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={isGeneratingScript}
                  className="w-full h-11 font-medium gap-2"
                  onClick={() => {
                    if (isGeneratingScript) return;
                    setShowGenerateModal(true);
                    setIsGeneratingScript(true);
                  }}
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Generate script"
                  )}
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom bar: only show once content is generated */}
      {Object.keys(scriptBodies).length > 0 && (
        <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-card">
          <span className="text-[11px] text-muted-foreground">
            {scriptTitlesLocal.length} item{scriptTitlesLocal.length === 1 ? "" : "s"}
          </span>
          <Button asChild size="sm" variant="default" className="h-7 text-xs shrink-0">
            <Link to="/playground/voice-overs" state={{ scriptTitles: scriptTitlesLocal, scriptBodies }}>
              Continue to Voice Overs
            </Link>
          </Button>
        </div>
      )}
      {/* Generate / Open preview (needed to click and generate script) */}
      <div className="shrink-0 p-4 border-t border-border bg-background/30 lg:hidden">
        {Object.keys(scriptBodies).length > 0 ? (
          <Button size="lg" className="w-full h-11 font-medium" onClick={() => setShowPreviewEditor(true)}>
            Open script preview
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={isGeneratingScript}
            className="w-full h-11 font-medium gap-2"
            onClick={() => {
              if (isGeneratingScript) return;
              setShowGenerateModal(true);
              setIsGeneratingScript(true);
            }}
          >
            {isGeneratingScript ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating script…
              </>
            ) : (
              "Generate script"
            )}
          </Button>
        )}
      </div>
        </>
      )}

      {/* Niche preview modal */}
      {previewFor &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewFor(null)} aria-hidden="true" />
            <div
              className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-border bg-card shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 shrink-0 border-b border-border px-6 py-4 bg-background/80">
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

      {/* Preview editor (same page, after generation) */}
      {showPreviewEditor && (
        <>
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col overflow-auto">
              <div className="p-8 flex flex-col flex-1 min-h-0 max-w-4xl mx-auto w-full">
                {/* Header + structure strip */}
                <header className="mb-4">
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

                {/* Script structure: Hook · Intro · Main content · Ending */}
                {(() => {
                  const sections = parseScriptSections(scriptBodies[activeScriptIndex] ?? "");
                  if (sections.length === 0) return null;
                  return (
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">Structure</span>
                      {sections.map((name, i) => (
                        <span key={name} className="inline-flex items-center gap-1.5 text-xs">
                          {i > 0 && <span className="text-muted-foreground/60">·</span>}
                          <span className="font-medium text-foreground">{name}</span>
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {/* Inline AI Regenerate – one line, small */}
                {showRegenerateModal && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-card/80 px-3 py-2" role="region" aria-label="Regenerate script with AI">
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

                {/* Script body – full script with clear sections */}
                <div className="flex-1 min-h-[260px] flex flex-col rounded-lg border border-border bg-card/60 overflow-hidden">
                  <div className="shrink-0 px-4 py-2 border-b border-border bg-background/40">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Full script</span>
                  </div>
                  <textarea
                    value={scriptBodies[activeScriptIndex] ?? ""}
                    onChange={(e) => setScriptBodies((prev) => ({ ...prev, [activeScriptIndex]: e.target.value }))}
                    placeholder="Generated script will appear here. Use the section headers (HOOK, INTRO, etc.) to navigate. Edit as needed."
                    className="flex-1 w-full min-h-[300px] p-6 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none border-0 leading-[1.6] font-[inherit]"
                    aria-label="Edit script"
                    spellCheck
                  />
                </div>
                <footer className="flex items-center justify-between flex-wrap gap-4 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      Duration <span className="font-semibold tabular-nums text-primary">{formatDuration(Math.round((wordCount(scriptBodies[activeScriptIndex] ?? "") / WORDS_PER_MINUTE) * 60))}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Words <span className="font-semibold tabular-nums text-foreground">{wordCount(scriptBodies[activeScriptIndex] ?? "").toLocaleString()}</span>
                    </span>
                  </div>
                  <Button variant="secondary" size="sm">Save script</Button>
                </footer>
              </div>
              <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-card">
                <span className="text-[11px] text-muted-foreground">
                  {scriptTitlesLocal.length} item{scriptTitlesLocal.length === 1 ? "" : "s"}
                </span>
                <Button asChild size="sm" variant="default" className="h-7 text-xs shrink-0">
                  <Link to="/playground/voice-overs" state={{ scriptTitles: scriptTitlesLocal, scriptBodies }}>
                    Continue to Voice Overs
                  </Link>
                </Button>
              </div>
            </div>
            <aside className="w-96 min-w-[280px] shrink-0 border-l border-border bg-background/50 flex flex-col">
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
              className="relative z-10 w-full max-w-md flex flex-col rounded-xl border border-border bg-card shadow-xl overflow-hidden p-6"
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
