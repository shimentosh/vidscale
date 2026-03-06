import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { Search, Play, RotateCcw, Loader2, X } from "lucide-react";
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
  const scriptTitles = (location.state as { scriptTitles?: string[] } | null)?.scriptTitles;
  const generateTotal = scriptTitles?.length ?? 3;

  const [search, setSearch] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(SPEED_DEFAULT);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCurrent, setGenerateCurrent] = useState(0);
  const [generateComplete, setGenerateComplete] = useState(false);
  const browserVoices = useSpeechVoices();

  useEffect(() => {
    if (!showGenerateModal || generateComplete) return;
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

  const handleOpenGenerate = () => {
    setShowGenerateModal(true);
    setGenerateComplete(false);
    setGenerateCurrent(0);
  };

  const handleCloseGenerate = () => {
    setShowGenerateModal(false);
    setGenerateComplete(false);
    setGenerateCurrent(0);
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
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 4</span>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Voice Overs</h1>
        <p className="text-sm text-muted-foreground mt-2">Record or generate voice-over for your script.</p>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="p-8 space-y-6">
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
      </div>

      {/* Bottom CTA */}
      <div className="shrink-0 p-8 pt-4">
        <Button
          size="lg"
          className="w-full h-12 font-semibold uppercase tracking-wider text-sm gap-2"
          onClick={handleOpenGenerate}
        >
          Generate Voice Overs &gt;
        </Button>
      </div>

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
