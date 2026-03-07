import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Search, Play, RotateCcw, Loader2, X, Headphones, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const VOICES = [
  { id: "rachel", name: "Rachel", tags: ["american", "calm", "young", "female", "narration"] },
  { id: "antoni", name: "Antoni", tags: ["american", "well-rounded", "young", "male", "narration"] },
  { id: "drew", name: "Drew", tags: ["American", "well-rounded", "middle-aged", "male", "news"] },
  { id: "clyde", name: "Clyde", tags: ["American", "war veteran", "middle-aged", "male", "characters"] },
  { id: "paul", name: "Paul", tags: ["American", "authoritative", "middle-aged", "male", "news"] },
  { id: "aria", name: "Aria", tags: ["American", "expressive", "middle-aged", "female", "social media"] },
  { id: "domi", name: "Domi", tags: ["american", "strong", "young", "female", "narration"] },
  { id: "dave", name: "Dave", tags: ["British", "conversational", "young", "male", "characters"] },
  { id: "roger", name: "Roger", tags: ["American", "confident", "middle-aged", "male", "social media"] },
  { id: "fin", name: "Fin", tags: ["Irish", "sailor", "old", "male", "characters"] },
];

const SPEED_MIN = 0.5;
const SPEED_MAX = 2;
const SPEED_DEFAULT = 1;

const PREVIEW_PHRASE = "This is a sample of how I sound. Use me for your voice over.";

function useSpeechVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const load = () => setVoices(speechSynthesis.getVoices());
    load();
    speechSynthesis.onvoiceschanged = load;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, []);
  return voices;
}

export function VoiceOversPage() {
  const location = useLocation();
  const scriptTitlesFromState = (location.state as { scriptTitles?: string[] } | null)?.scriptTitles;
  const generateTotal = scriptTitlesFromState?.length ?? 3;
  // Always have a list for sidebar: use state titles or placeholders so sidebar can show during generation
  const scriptTitles = useMemo(
    () => scriptTitlesFromState ?? Array.from({ length: generateTotal }, (_, i) => `Script ${i + 1}`),
    [scriptTitlesFromState, generateTotal]
  );

  const [search, setSearch] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(SPEED_DEFAULT);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCurrent, setGenerateCurrent] = useState(0);
  const [generateComplete, setGenerateComplete] = useState(false);
  const [generatedVoiceOvers, setGeneratedVoiceOvers] = useState<{ index: number; title: string; status: "ready" | "generating" | "regenerating" }[]>([]);
  const [playingVoiceIndex, setPlayingVoiceIndex] = useState<number | null>(null);
  const browserVoices = useSpeechVoices();

  useEffect(() => {
    if (!showGenerateModal || generateComplete) return;
    // Show first item immediately in sidebar
    setGenerateCurrent(1);
    const interval = setInterval(() => {
      setGenerateCurrent((c) => {
        if (c >= generateTotal) {
          clearInterval(interval);
          setGenerateComplete(true);
          return c;
        }
        return c + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [showGenerateModal, generateTotal, generateComplete]);

  // When generation completes, persist list for the right sidebar
  useEffect(() => {
    if (!generateComplete || !showGenerateModal || scriptTitles.length === 0) return;
    setGeneratedVoiceOvers(
      scriptTitles.map((title, index) => ({ index, title, status: "ready" as const }))
    );
  }, [generateComplete, showGenerateModal, scriptTitles]);

  const handleOpenGenerate = () => {
    setGeneratedVoiceOvers([]);
    setGenerateComplete(false);
    setGenerateCurrent(1); // show first item in sidebar immediately
    setShowGenerateModal(true);
  };

  const handleCloseGenerate = () => {
    setShowGenerateModal(false);
    setGenerateComplete(false);
    setGenerateCurrent(0);
  };

  // Display list: during generation show progress one-by-one; after that show persisted list
  const displayVoiceOvers = useMemo(() => {
    if (showGenerateModal && !generateComplete && scriptTitles.length > 0) {
      return scriptTitles.slice(0, generateCurrent).map((title, i) => ({
        index: i,
        title,
        status: i === generateCurrent - 1 ? ("generating" as const) : ("ready" as const),
      }));
    }
    return generatedVoiceOvers;
  }, [showGenerateModal, generateComplete, generateCurrent, scriptTitles, generatedVoiceOvers]);

  const playGeneratedVoice = (index: number) => {
    speechSynthesis.cancel();
    setPlayingVoiceIndex(index);
    const title = scriptTitles?.[index] ?? displayVoiceOvers.find((v) => v.index === index)?.title ?? "Script";
    const utterance = new SpeechSynthesisUtterance(`Voice over for: ${title}. This is a sample. Connect your TTS API for real audio.`);
    utterance.rate = speed;
    const voiceId = selectedVoiceId ?? VOICES[0].id;
    const voice = VOICES.find((v) => v.id === voiceId);
    if (voice) {
      const isFemale = voice.tags.some((t) => t.toLowerCase() === "female");
      const preferred = browserVoices.find((v) =>
        isFemale ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") : v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel")
      );
      if (preferred) utterance.voice = preferred;
    }
    utterance.onend = () => setPlayingVoiceIndex(null);
    utterance.onerror = () => setPlayingVoiceIndex(null);
    speechSynthesis.speak(utterance);
  };

  const regenerateVoiceOver = (index: number) => {
    setGeneratedVoiceOvers((prev) => {
      if (!prev.some((v) => v.index === index)) return prev;
      return prev.map((item) => (item.index === index ? { ...item, status: "regenerating" as const } : item));
    });
    setTimeout(() => {
      setGeneratedVoiceOvers((prev) =>
        prev.map((item) => (item.index === index ? { ...item, status: "ready" as const } : item))
      );
    }, 1500);
  };

  const filteredVoices = useMemo(() => {
    if (!search.trim()) return VOICES;
    const q = search.trim().toLowerCase();
    return VOICES.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [search]);

  const handleSpeedReset = () => setSpeed(SPEED_DEFAULT);

  const playVoicePreview = (voice: (typeof VOICES)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(PREVIEW_PHRASE);
    utterance.rate = speed;
    const isFemale = voice.tags.some((t) => t.toLowerCase() === "female");
    const preferred = browserVoices.find((v) =>
      isFemale ? v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("victoria")
        : v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("alex")
    );
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setPlayingId(voice.id);
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header – same as Script Writing */}
      <div className="shrink-0 py-6 px-8 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 3</span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Voice Overs</h1>
        <p className="text-sm text-muted-foreground mt-2">Record or generate voice-over for your script.</p>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 space-y-6 max-w-4xl">
            {/* Voice selection – section card like Script Writing */}
            <section className="rounded-xl border border-border bg-[#131922] p-6">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider block mb-3">
                Choose a voice for your videos
              </Label>
              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                  type="search"
                  placeholder="Search voices..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-lg bg-background/50 border-border focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Search voices"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto">
                {filteredVoices.length === 0 ? (
                  <div className="col-span-2 px-4 py-8 text-center text-sm text-muted-foreground">
                    No voices match your search.
                  </div>
                ) : (
                  filteredVoices.map((voice) => (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => setSelectedVoiceId(voice.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg border border-transparent",
                        selectedVoiceId === voice.id
                          ? "bg-primary/15 border-primary ring-1 ring-primary/50"
                          : "bg-background/30 border-border hover:bg-white/5 hover:border-border"
                      )}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => playVoicePreview(voice, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            playVoicePreview(voice, e as unknown as React.MouseEvent);
                          }
                        }}
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 text-primary hover:bg-primary/20 transition-colors",
                          playingId === voice.id && "bg-primary/20"
                        )}
                        aria-label={`Preview ${voice.name}`}
                      >
                        {playingId === voice.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Play size={16} className="ml-0.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{voice.name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {voice.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Speed – section card */}
            <section className="rounded-xl border border-border bg-[#131922] p-6">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider block mb-3">Playback speed</Label>
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm text-foreground">Speed</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={SPEED_MIN}
                    max={SPEED_MAX}
                    step={0.1}
                    value={speed}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (!Number.isNaN(v)) setSpeed(Math.min(SPEED_MAX, Math.max(SPEED_MIN, v)));
                    }}
                    className="w-20 h-9 text-sm tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={handleSpeedReset}
                    aria-label="Reset speed to 1"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums w-8">{SPEED_MIN}</span>
                <input
                  type="range"
                  min={SPEED_MIN}
                  max={SPEED_MAX}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="flex-1 h-2.5 rounded-full appearance-none bg-input accent-primary cursor-pointer"
                  aria-valuemin={SPEED_MIN}
                  aria-valuemax={SPEED_MAX}
                  aria-valuenow={speed}
                />
                <span className="text-xs text-muted-foreground tabular-nums w-8">{SPEED_MAX}</span>
              </div>
            </section>
          </div>
        </div>

        {/* Right: Voice preview sidebar (same style as Topic headline preview) */}
        <aside className="w-[320px] min-w-[320px] shrink-0 flex flex-col border-l border-border/80 bg-[#161B22] overflow-hidden hidden lg:flex">
          <div className="shrink-0 px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <Headphones size={14} className="text-muted-foreground shrink-0" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Voice preview
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
            {displayVoiceOvers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8 px-2">
                Topic-by-topic voice overs will appear here. Click &quot;Generate Voice Overs&quot; to create them. Then play or regenerate each topic&apos;s voice from this list.
              </p>
            ) : (
              <ul className="space-y-3">
                {displayVoiceOvers.map((item) => (
                  <li
                    key={item.index}
                    className={cn(
                      "rounded-lg border border-border/60 bg-[#131922] p-3 flex flex-col gap-2",
                      (item.status === "generating" || item.status === "regenerating") && "ring-1 ring-primary/40"
                    )}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span
                        className={cn(
                          "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                          "bg-[#1e3a5f] text-[#93c5fd] border border-[#2563eb]/30"
                        )}
                      >
                        {item.index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Topic {item.index + 1}</p>
                        <p className="text-sm font-medium text-foreground truncate mt-0.5">{item.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex-1 gap-1.5"
                        disabled={item.status === "generating" || item.status === "regenerating"}
                        onClick={() => playGeneratedVoice(item.index)}
                      >
                        {playingVoiceIndex === item.index ? (
                          <Loader2 size={12} className="animate-spin shrink-0" />
                        ) : (
                          <Play size={12} className="shrink-0" />
                        )}
                        Play
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs shrink-0 gap-1"
                        disabled={item.status === "generating" || item.status === "regenerating" || (showGenerateModal && !generateComplete)}
                        onClick={() => regenerateVoiceOver(item.index)}
                      >
                        {item.status === "regenerating" ? (
                          <Loader2 size={12} className="animate-spin shrink-0" />
                        ) : (
                          <RotateCw size={12} className="shrink-0" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                    {(item.status === "generating" || item.status === "regenerating") && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin shrink-0" />
                        {item.status === "generating" ? "Generating…" : "Regenerating…"}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom: Generate button — show only until voice overs are generated; then hide */}
      {generatedVoiceOvers.length === 0 && (
        <div className="shrink-0 p-4 border-t border-border bg-background/30">
          <Button
            size="lg"
            className="w-full h-11 font-medium gap-2 mb-3"
            onClick={handleOpenGenerate}
          >
            Generate Voice Overs &gt;
          </Button>
        </div>
      )}
      {/* Compact bar: show only once voice overs are generated */}
      {generatedVoiceOvers.length > 0 && (
        <div className="shrink-0 h-9 px-4 flex items-center justify-between border-t border-border/80 bg-[#161B22]">
          <span className="text-[11px] text-muted-foreground">
            {generatedVoiceOvers.length} item{generatedVoiceOvers.length === 1 ? "" : "s"}
          </span>
          <Button asChild size="sm" variant="default" className="h-7 text-xs shrink-0">
            <Link to="/playground/media-library">
              Continue to Media Library
            </Link>
          </Button>
        </div>
      )}

      {/* Generate voice overs popup – one by one progress */}
      {showGenerateModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Generating voice overs"
          >
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            <div
              className="relative z-10 w-full max-w-md rounded-xl border border-border bg-[#131922] shadow-xl overflow-hidden p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Generate voice overs</h2>
                {generateComplete && (
                  <button
                    type="button"
                    onClick={handleCloseGenerate}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              {!generateComplete ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 size={22} className="text-primary animate-spin shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Generating voice over {generateCurrent} of {generateTotal}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Please wait...</p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-input overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${generateTotal ? (generateCurrent / generateTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                    {generateTotal ? Math.round((generateCurrent / generateTotal) * 100) : 0}%
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">All voice overs have been generated.</p>
                  <Button className="w-full" onClick={handleCloseGenerate} asChild>
                    <Link to="/playground/media-library">Continue to Media &gt;</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
